/**
 * RBAC Configuration
 *
 * Centralized configuration for protected routes and navigation.
 * Single source of truth for role-based access control.
 */

import type { RoleName } from './types';

export interface NavLink {
  href: string;
  label: string;
  icon?: string;
}

export interface RouteConfig {
  path: string;
  requiredRole: RoleName;
}

export interface DashboardConfig {
  base: string;
  requiredRole: RoleName;
  label: string;
  routes: NavLink[];
}

/**
 * Dashboard configurations with routes and navigation.
 */
export const DASHBOARD_ROUTES: Record<string, DashboardConfig> = {
  admin: {
    base: '/admin',
    requiredRole: 'admin',
    label: 'Admin',
    routes: [
      { href: '/admin', label: 'Dashboard', icon: 'LayoutDashboard' },
      { href: '/admin/users', label: 'Users', icon: 'Users' },
      { href: '/admin/reports', label: 'Reports', icon: 'FileText' },
      { href: '/admin/settings', label: 'Settings', icon: 'Settings' },
    ],
  },
  clinic: {
    base: '/clinic',
    requiredRole: 'clinic',
    label: 'Clinic',
    routes: [
      { href: '/clinic', label: 'Dashboard', icon: 'LayoutDashboard' },
      { href: '/clinic/patients', label: 'Patients', icon: 'Users' },
      { href: '/clinic/appointments', label: 'Appointments', icon: 'Calendar' },
      { href: '/clinic/settings', label: 'Settings', icon: 'Settings' },
    ],
  },
  finance: {
    base: '/finance',
    requiredRole: 'finance',
    label: 'Finance',
    routes: [
      { href: '/finance', label: 'Dashboard', icon: 'LayoutDashboard' },
      { href: '/finance/payments', label: 'Payments', icon: 'CreditCard' },
      { href: '/finance/reports', label: 'Reports', icon: 'FileText' },
    ],
  },
  support: {
    base: '/support',
    requiredRole: 'support',
    label: 'Support',
    routes: [
      { href: '/support', label: 'Dashboard', icon: 'LayoutDashboard' },
      { href: '/support/tickets', label: 'Tickets', icon: 'MessageSquare' },
    ],
  },
  affiliates: {
    base: '/affiliates',
    requiredRole: 'affiliate',
    label: 'Affiliates',
    routes: [
      { href: '/affiliates', label: 'Painel', icon: 'LayoutDashboard' },
      { href: '/affiliates/users', label: 'Usuários', icon: 'Users' },
      { href: '/affiliates/reports', label: 'Relatórios', icon: 'FileText' },
      { href: '/affiliates/settings', label: 'Configurações', icon: 'Settings' },
    ],
  },
} as const;

/**
 * Protected route configurations derived from dashboard routes.
 */
export const PROTECTED_ROUTES: RouteConfig[] = Object.values(DASHBOARD_ROUTES).map((config) => ({
  path: config.base,
  requiredRole: config.requiredRole,
}));

/**
 * Legacy route mappings for backwards compatibility.
 */
const LEGACY_ROUTES: Record<string, string> = {
  '/afiliados': '/affiliates',
  '/financeiro': '/finance',
  '/suporte': '/support',
  '/clinica': '/clinic',
};

/**
 * Get the default dashboard path for a role.
 */
export function getDefaultDashboard(role: RoleName | null | undefined): string {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'finance':
      return '/finance';
    case 'support':
      return '/support';
    case 'clinic':
      return '/clinic';
    case 'affiliate':
    default:
      return '/affiliates';
  }
}

/**
 * Get navigation links for a user based on their role.
 */
export function getNavLinksForRole(role: RoleName | null | undefined): NavLink[] {
  const dashboardKey = getDashboardKeyForRole(role);
  if (dashboardKey && DASHBOARD_ROUTES[dashboardKey]) {
    return DASHBOARD_ROUTES[dashboardKey].routes;
  }
  return DASHBOARD_ROUTES.affiliates.routes;
}

/**
 * Get dashboard key from role.
 */
function getDashboardKeyForRole(role: RoleName | null | undefined): string | null {
  switch (role) {
    case 'admin':
      return 'admin';
    case 'finance':
      return 'finance';
    case 'support':
      return 'support';
    case 'clinic':
      return 'clinic';
    case 'affiliate':
      return 'affiliates';
    default:
      return null;
  }
}

/**
 * Get current dashboard from pathname.
 */
export function getCurrentDashboard(pathname: string): DashboardConfig | null {
  for (const config of Object.values(DASHBOARD_ROUTES)) {
    if (pathname.startsWith(config.base)) {
      return config;
    }
  }
  return null;
}

/**
 * Find the route config that matches a given pathname.
 * Supports both new and legacy routes.
 */
export function findMatchingRoute(pathname: string): RouteConfig | undefined {
  // Check for legacy routes and map to new paths
  const legacyPath = Object.keys(LEGACY_ROUTES).find((legacy) =>
    pathname.startsWith(legacy)
  );

  const effectivePath = legacyPath
    ? pathname.replace(legacyPath, LEGACY_ROUTES[legacyPath])
    : pathname;

  return PROTECTED_ROUTES.find((route) => effectivePath.startsWith(route.path));
}

/**
 * Check if a pathname is a protected route.
 */
export function isProtectedPath(pathname: string): boolean {
  return findMatchingRoute(pathname) !== undefined;
}

/**
 * Check if a pathname is a legacy route that needs redirect.
 */
export function getLegacyRedirect(pathname: string): string | null {
  for (const [legacy, newPath] of Object.entries(LEGACY_ROUTES)) {
    if (pathname.startsWith(legacy)) {
      return pathname.replace(legacy, newPath);
    }
  }
  return null;
}
