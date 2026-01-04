/**
 * RBAC Configuration
 *
 * Centralized configuration for protected routes and navigation.
 * Single source of truth for role-based access control.
 */

import type { Role } from './types';

export interface NavLink {
  href: string;
  label: string;
}

export interface RouteConfig {
  path: string;
  requiredRole: Role;
}

/**
 * Protected route configurations with required roles.
 * Order matters: more specific paths should come first.
 */
export const PROTECTED_ROUTES: RouteConfig[] = [
  { path: '/admin', requiredRole: 'admin' },
  { path: '/financeiro', requiredRole: 'financeiro' },
  { path: '/suporte', requiredRole: 'suporte' },
  { path: '/afiliados', requiredRole: 'afiliado' },
];

/**
 * Navigation links per role.
 * Each role sees only their specific section in the header.
 */
export const ROLE_NAV_LINKS: Record<Role, NavLink[]> = {
  admin: [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/users', label: 'Usuarios' },
    { href: '/admin/reports', label: 'Relatorios' },
    { href: '/admin/settings', label: 'Configuracoes' },
  ],
  financeiro: [
    { href: '/financeiro', label: 'Dashboard' },
    { href: '/financeiro/payments', label: 'Pagamentos' },
    { href: '/financeiro/reports', label: 'Relatorios' },
  ],
  suporte: [
    { href: '/suporte', label: 'Dashboard' },
    { href: '/suporte/tickets', label: 'Tickets' },
    { href: '/suporte/users', label: 'Usuarios' },
  ],
  afiliado: [
    { href: '/afiliados', label: 'Dashboard' },
    { href: '/afiliados/links', label: 'Links' },
    { href: '/afiliados/earnings', label: 'Ganhos' },
  ],
};

/**
 * Get the default dashboard path for a role.
 */
export function getDefaultDashboard(role: Role | null | undefined): string {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'financeiro':
      return '/financeiro';
    case 'suporte':
      return '/suporte';
    case 'afiliado':
    default:
      return '/afiliados';
  }
}

/**
 * Get navigation links for a user based on their role.
 */
export function getNavLinksForRole(role: Role | null | undefined): NavLink[] {
  if (!role || !(role in ROLE_NAV_LINKS)) {
    return ROLE_NAV_LINKS.afiliado;
  }
  return ROLE_NAV_LINKS[role];
}

/**
 * Find the route config that matches a given pathname.
 */
export function findMatchingRoute(pathname: string): RouteConfig | undefined {
  return PROTECTED_ROUTES.find((route) => pathname.startsWith(route.path));
}

/**
 * Check if a pathname is a protected route.
 */
export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route.path));
}
