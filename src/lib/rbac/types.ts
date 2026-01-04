/**
 * RBAC Type Definitions
 *
 * Defines user roles with hierarchy levels for tiered access control.
 * Higher level = more access (admin can access all, afiliado only their area).
 */

/**
 * Role hierarchy with numeric levels for comparison.
 * Higher number = more privileges.
 */
export const ROLES = {
  afiliado: 1,
  suporte: 2,
  financeiro: 3,
  admin: 4,
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
 */
export function hasRoleAccess(userRole: Role | null | undefined, requiredRole: Role): boolean {
  if (!userRole) return false;
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
  };
  return labels[role];
}
