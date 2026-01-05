/**
 * RBAC Server-Side Helpers
 *
 * Utilities for checking user roles in Server Components and API routes.
 * Queries the database for role information instead of relying solely on JWT.
 */

import { createClient } from '@/lib/supabase/server';
import {
  parseRole,
  hasRoleAccess,
  getRoleLabel,
  type RoleName,
  type Permission,
  type UserWithRole,
  DEFAULT_ROLE,
} from './types';

/**
 * Get current user with role information from database.
 * Falls back to app_metadata if database query fails.
 */
export async function getCurrentUser(): Promise<UserWithRole | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Try to get role from database
  const { data: userRoles } = await supabase
    .from('user_with_roles')
    .select('primary_role, primary_role_label, all_roles')
    .eq('id', user.id)
    .single();

  // Get permissions from database
  const { data: permissions } = await supabase.rpc('get_user_permissions', {
    p_user_id: user.id,
  });

  // Determine primary role - database first, then app_metadata, then default
  let primaryRole: RoleName = DEFAULT_ROLE;
  let primaryRoleLabel = getRoleLabel(DEFAULT_ROLE);
  let allRoles: RoleName[] = [DEFAULT_ROLE];

  if (userRoles?.primary_role) {
    const parsedRole = parseRole(userRoles.primary_role);
    if (parsedRole) {
      primaryRole = parsedRole;
      primaryRoleLabel = userRoles.primary_role_label || getRoleLabel(parsedRole);
      allRoles = (userRoles.all_roles || [primaryRole]).map(
        (r: string) => parseRole(r) || DEFAULT_ROLE
      );
    }
  } else if (user.app_metadata?.role) {
    // Fallback to app_metadata for backwards compatibility
    const parsedRole = parseRole(user.app_metadata.role);
    if (parsedRole) {
      primaryRole = parsedRole;
      primaryRoleLabel = getRoleLabel(parsedRole);
      allRoles = [parsedRole];
    }
  }

  return {
    id: user.id,
    email: user.email!,
    primaryRole,
    primaryRoleLabel,
    allRoles,
    permissions: (permissions as Permission[]) || [],
  };
}

/**
 * Get current user's role from server context.
 * Returns null if not authenticated.
 */
export async function getCurrentUserRole(): Promise<RoleName | null> {
  const user = await getCurrentUser();
  return user?.primaryRole || null;
}

/**
 * Check if current user has required role access.
 * Returns false if not authenticated.
 */
export async function checkRoleAccess(requiredRole: RoleName): Promise<boolean> {
  const userRole = await getCurrentUserRole();
  return hasRoleAccess(userRole, requiredRole);
}

/**
 * Check if current user has a specific permission.
 */
export async function hasPermission(permission: string): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data } = await supabase.rpc('has_permission', {
    p_user_id: user.id,
    p_permission: permission,
  });

  return data ?? false;
}

/**
 * Log an audit entry for the current user.
 */
export async function logAudit(params: {
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
}): Promise<void> {
  const supabase = await createClient();

  await supabase.from('audit_log').insert({
    action: params.action,
    resource: params.resource,
    resource_id: params.resourceId,
    details: params.details,
  });
}

/**
 * Assign a role to a user (admin only).
 */
export async function assignRole(
  userId: string,
  roleName: RoleName,
  assignedBy?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // Get role ID
  const { data: role, error: roleError } = await supabase
    .from('roles')
    .select('id')
    .eq('name', roleName)
    .single();

  if (roleError || !role) {
    return { success: false, error: 'Role not found' };
  }

  // Insert user role
  const { error: insertError } = await supabase.from('user_roles').insert({
    user_id: userId,
    role_id: role.id,
    assigned_by: assignedBy,
  });

  if (insertError) {
    return { success: false, error: insertError.message };
  }

  // Log audit
  await logAudit({
    action: 'role.assign',
    resource: 'user',
    resourceId: userId,
    details: { role: roleName, assignedBy },
  });

  return { success: true };
}

/**
 * Remove a role from a user (admin only).
 */
export async function removeRole(
  userId: string,
  roleName: RoleName
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // Get role ID
  const { data: role, error: roleError } = await supabase
    .from('roles')
    .select('id')
    .eq('name', roleName)
    .single();

  if (roleError || !role) {
    return { success: false, error: 'Role not found' };
  }

  // Delete user role
  const { error: deleteError } = await supabase
    .from('user_roles')
    .delete()
    .eq('user_id', userId)
    .eq('role_id', role.id);

  if (deleteError) {
    return { success: false, error: deleteError.message };
  }

  // Log audit
  await logAudit({
    action: 'role.remove',
    resource: 'user',
    resourceId: userId,
    details: { role: roleName },
  });

  return { success: true };
}
