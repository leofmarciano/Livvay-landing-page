/**
 * RBAC Server-Side Helpers
 *
 * Utilities for checking user roles in Server Components and API routes.
 */

import { createClient } from '@/lib/supabase/server';
import { parseRole, hasRoleAccess, type Role, DEFAULT_ROLE } from './types';

/**
 * Get current user's role from server context.
 * Returns null if not authenticated.
 */
export async function getCurrentUserRole(): Promise<Role | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return parseRole(user.app_metadata?.role) || DEFAULT_ROLE;
}

/**
 * Check if current user has required role access.
 * Returns false if not authenticated.
 */
export async function checkRoleAccess(requiredRole: Role): Promise<boolean> {
  const userRole = await getCurrentUserRole();
  return hasRoleAccess(userRole, requiredRole);
}

/**
 * Get current user with role information.
 * Returns null if not authenticated.
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return {
    ...user,
    role: (parseRole(user.app_metadata?.role) || DEFAULT_ROLE) as Role,
  };
}

/**
 * Type for user with guaranteed role.
 */
export type UserWithRole = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
