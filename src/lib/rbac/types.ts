/**
 * RBAC Type Definitions
 *
 * Defines user roles with hierarchy levels for tiered access control.
 * Higher level = more access (admin can access all, afiliado only their area).
 */

/**
 * Role hierarchy with numeric levels for comparison.
 * Higher number = more privileges.
 *
 * Note: 'clinica' is completely isolated - it's a separate track
 * that doesn't participate in the hierarchy. Only clinica users
 * can access clinica routes, and clinica users can't access anything else.
 */
export const ROLES = {
  afiliado: 1,
  suporte: 2,
  financeiro: 3,
  admin: 4,
  clinica: 0, // Isolated role - separate track
} as const;

export type Role = keyof typeof ROLES;

export const DEFAULT_ROLE: Role = 'afiliado';

/**
 * All valid role values for validation.
 */
export const ROLE_VALUES = Object.keys(ROLES) as Role[];

/**
 * Check if a role has at least the required access level.
 * Uses hierarchy: admin > financeiro > suporte > afiliado
 *
 * IMPORTANT: 'clinica' is isolated from the hierarchy.
 * - Clinica users can only access clinica routes
 * - Admin can access clinica routes (admin has full access)
 * - Other roles (financeiro, suporte, afiliado) cannot access clinica
 */
export function hasRoleAccess(userRole: Role | null | undefined, requiredRole: Role): boolean {
  if (!userRole) return false;

  // Admin has access to everything, including clinica
  if (userRole === 'admin') {
    return true;
  }

  // Clinica routes: only clinica users (and admin, handled above)
  if (requiredRole === 'clinica') {
    return userRole === 'clinica';
  }

  // Clinica users can only access clinica routes
  if (userRole === 'clinica') {
    return false;
  }

  // Standard hierarchy check for other roles
  return ROLES[userRole] >= ROLES[requiredRole];
}

/**
 * Type-safe role parsing from unknown value.
 * Returns undefined for invalid roles.
 */
export function parseRole(value: unknown): Role | undefined {
  if (typeof value === 'string' && value in ROLES) {
    return value as Role;
  }
  return undefined;
}

/**
 * Get display label for a role (Portuguese).
 */
export function getRoleLabel(role: Role): string {
  const labels: Record<Role, string> = {
    admin: 'Administrador',
    financeiro: 'Financeiro',
    suporte: 'Suporte & Risk',
    afiliado: 'Afiliado',
    clinica: 'Clinica',
  };
  return labels[role];
}
