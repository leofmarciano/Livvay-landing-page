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
  type ClinicProfile,
  type UserWithRoleAndClinic,
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

// ─────────────────────────────────────────────────
// Clinic Profile Helpers
// ─────────────────────────────────────────────────

/**
 * Get clinic profile for the current authenticated user.
 * Returns null if user is not authenticated or doesn't have clinic role.
 */
export async function getCurrentClinicProfile(): Promise<ClinicProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('clinic_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error || !data) return null;
  return data as ClinicProfile;
}

/**
 * Get clinic profile by user ID.
 * Useful for admin operations.
 */
export async function getClinicProfileByUserId(userId: string): Promise<ClinicProfile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('clinic_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;
  return data as ClinicProfile;
}

/**
 * Get current user with role and clinic profile information.
 * Fetches clinic profile only when user has 'clinic' role for efficiency.
 */
export async function getCurrentUserWithClinic(): Promise<UserWithRoleAndClinic | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  // Only fetch clinic profile if user has clinic role
  if (user.primaryRole === 'clinic') {
    const clinicProfile = await getCurrentClinicProfile();
    return {
      ...user,
      clinicProfile: clinicProfile || undefined,
    };
  }

  return user;
}

/**
 * Create or update clinic profile for a user.
 * Used during registration or profile setup.
 */
export async function upsertClinicProfile(params: {
  userId: string;
  // Professional info
  professionalType: ClinicProfile['professional_type'];
  licenseNumber?: string;
  specialty?: string;
  clinicName?: string;
  // Personal info
  fullName?: string;
  phone?: string;
  birthDate?: string;
  cpf?: string;
  rg?: string;
  // Address
  postalCode?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  country?: string;
}): Promise<{ success: boolean; profile?: ClinicProfile; error?: string }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('clinic_profiles')
    .upsert(
      {
        user_id: params.userId,
        // Professional info
        professional_type: params.professionalType,
        license_number: params.licenseNumber || null,
        specialty: params.specialty || null,
        clinic_name: params.clinicName || null,
        // Personal info
        full_name: params.fullName || null,
        phone: params.phone || null,
        birth_date: params.birthDate || null,
        cpf: params.cpf || null,
        rg: params.rg || null,
        // Address
        postal_code: params.postalCode || null,
        street: params.street || null,
        number: params.number || null,
        complement: params.complement || null,
        neighborhood: params.neighborhood || null,
        city: params.city || null,
        state: params.state || null,
        country: params.country || 'Brasil',
      },
      { onConflict: 'user_id' }
    )
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  // Log audit
  await logAudit({
    action: 'clinic_profile.upsert',
    resource: 'clinic_profile',
    resourceId: data.id,
    details: { professionalType: params.professionalType },
  });

  return { success: true, profile: data as ClinicProfile };
}
