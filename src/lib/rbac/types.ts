/**
 * RBAC Type Definitions
 *
 * Defines user roles with hierarchy levels for tiered access control.
 * Higher level = more access (admin can access all, affiliate only their area).
 */

/**
 * Role hierarchy with numeric levels for comparison.
 * Higher number = more privileges.
 *
 * Note: 'clinic' is completely isolated - it's a separate track
 * that doesn't participate in the hierarchy. Only clinic users
 * can access clinic routes, and clinic users can't access anything else.
 */
export const ROLES = {
  affiliate: 40,
  support: 60,
  finance: 80,
  admin: 100,
  clinic: 0, // Isolated role - separate track
} as const;

export type RoleName = keyof typeof ROLES;

export const DEFAULT_ROLE: RoleName = 'affiliate';

/**
 * All valid role values for validation.
 */
export const ROLE_VALUES = Object.keys(ROLES) as RoleName[];

/**
 * Role interface for database-backed roles.
 */
export interface Role {
  id: string;
  name: RoleName;
  label: string;
  level: number;
  isIsolated: boolean;
}

/**
 * Permission interface for granular access control.
 */
export interface Permission {
  name: string;
  resource: string;
  action: string;
}

/**
 * User with role information from database.
 */
export interface UserWithRole {
  id: string;
  email: string;
  primaryRole: RoleName;
  primaryRoleLabel: string;
  allRoles: RoleName[];
  permissions: Permission[];
}

/**
 * Check if a role has at least the required access level.
 * Uses hierarchy: admin > finance > support > affiliate
 *
 * IMPORTANT: 'clinic' is isolated from the hierarchy.
 * - Clinic users can only access clinic routes
 * - Admin can access clinic routes (admin has full access)
 * - Other roles (finance, support, affiliate) cannot access clinic
 */
export function hasRoleAccess(userRole: RoleName | null | undefined, requiredRole: RoleName): boolean {
  if (!userRole) return false;

  // Admin has access to everything, including clinic
  if (userRole === 'admin') {
    return true;
  }

  // Clinic routes: only clinic users (and admin, handled above)
  if (requiredRole === 'clinic') {
    return userRole === 'clinic';
  }

  // Clinic users can only access clinic routes
  if (userRole === 'clinic') {
    return false;
  }

  // Standard hierarchy check for other roles
  return ROLES[userRole] >= ROLES[requiredRole];
}

/**
 * Type-safe role parsing from unknown value.
 * Returns undefined for invalid roles.
 * Handles both old Portuguese and new English role names.
 */
export function parseRole(value: unknown): RoleName | undefined {
  if (typeof value !== 'string') return undefined;

  // Direct match
  if (value in ROLES) {
    return value as RoleName;
  }

  // Map old Portuguese names to new English names
  const legacyMapping: Record<string, RoleName> = {
    afiliado: 'affiliate',
    financeiro: 'finance',
    suporte: 'support',
    clinica: 'clinic',
  };

  return legacyMapping[value];
}

/**
 * Role display labels (English).
 */
export const ROLE_LABELS: Record<RoleName, string> = {
  admin: 'Administrator',
  finance: 'Finance',
  support: 'Support & Risk',
  affiliate: 'Affiliate',
  clinic: 'Clinic',
};

/**
 * Get display label for a role.
 */
export function getRoleLabel(role: RoleName): string {
  return ROLE_LABELS[role] || role;
}

// ─────────────────────────────────────────────────
// Clinic Professional Types
// ─────────────────────────────────────────────────

/**
 * Clinic professional types.
 * When a user has the 'clinic' role, they must be one of these types.
 */
export const CLINIC_PROFESSIONAL_TYPES = {
  doctor: 'doctor',
  nutritionist: 'nutritionist',
  therapist: 'therapist',
} as const;

export type ClinicProfessionalType = keyof typeof CLINIC_PROFESSIONAL_TYPES;

/**
 * Display labels for clinic professional types.
 */
export const CLINIC_PROFESSIONAL_LABELS: Record<ClinicProfessionalType, string> = {
  doctor: 'Médico',
  nutritionist: 'Nutricionista',
  therapist: 'Terapeuta',
};

/**
 * Get display label for a clinic professional type.
 */
export function getClinicProfessionalLabel(type: ClinicProfessionalType): string {
  return CLINIC_PROFESSIONAL_LABELS[type] || type;
}

/**
 * Clinic profile stored in database.
 * Links a user with 'clinic' role to their professional type and details.
 */
export interface ClinicProfile {
  id: string;
  user_id: string;

  // Professional information
  professional_type: ClinicProfessionalType;
  license_number: string | null;
  specialty: string | null;
  clinic_name: string | null;

  // Personal information
  full_name: string | null;
  phone: string | null;
  birth_date: string | null;
  cpf: string | null;
  rg: string | null;

  // Address
  postal_code: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  country: string | null;

  // Status
  is_active: boolean;

  // Timestamps
  created_at: string;
  updated_at: string;
}

/**
 * Extended user interface that includes clinic profile when applicable.
 */
export interface UserWithRoleAndClinic extends UserWithRole {
  clinicProfile?: ClinicProfile;
}
