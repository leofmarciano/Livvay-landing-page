'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown, LogOut, LayoutDashboard, Users, FileText, Settings, Calendar, CreditCard, MessageSquare, Link as LinkIcon, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DASHBOARD_ROUTES } from '@/lib/rbac/config';
import { hasRoleAccess, type UserWithRole } from '@/lib/rbac/types';
import { LogoutButton } from '@/components/logout-button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  Calendar,
  CreditCard,
  MessageSquare,
  Link: LinkIcon,
  DollarSign,
};

interface DashboardHeaderProps {
  user: UserWithRole;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Get current dashboard config
  const currentDashboard = Object.values(DASHBOARD_ROUTES).find((config) =>
    pathname.startsWith(config.base)
  );

  // Get all accessible dashboards
  const accessibleDashboards = Object.entries(DASHBOARD_ROUTES).filter(([, config]) =>
    hasRoleAccess(user.primaryRole, config.requiredRole)
  );

  return (
    <>
      <header className="h-16 border-b border-border bg-surface-100 px-4 lg:px-6 flex items-center justify-between">
        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-surface-200 transition-colors"
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Logo (mobile) */}
        <Link href="/" className="lg:hidden flex items-center gap-2">
          <span className="text-xl font-bold text-foreground">Livvay</span>
        </Link>

        {/* Page title (desktop) */}
        <div className="hidden lg:block">
          <h1 className="text-lg font-semibold text-foreground">
            {currentDashboard?.label || 'Dashboard'}
          </h1>
        </div>

        {/* User menu (desktop) */}
        <div className="hidden lg:flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-200 transition-colors">
              <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center">
                <span className="text-sm font-medium text-brand">
                  {user.email.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-medium text-foreground">{user.email}</span>
              <ChevronDown className="w-4 h-4 text-foreground-muted" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium text-foreground">{user.email}</p>
                <p className="text-xs text-foreground-muted">{user.primaryRoleLabel}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/account">Account Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <LogoutButton type="ghost" className="w-full justify-start cursor-pointer" />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* User avatar (mobile) */}
        <div className="lg:hidden w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center">
          <span className="text-sm font-medium text-brand">
            {user.email.charAt(0).toUpperCase()}
          </span>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-background">
          <div className="flex flex-col h-full">
            {/* Mobile header */}
            <div className="h-16 border-b border-border px-4 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-xl font-bold text-foreground">Livvay</span>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 -mr-2 rounded-lg hover:bg-surface-200 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Dashboard switcher */}
            {accessibleDashboards.length > 1 && (
              <div className="p-4 border-b border-border">
                <p className="text-xs font-medium text-foreground-muted mb-2">Switch Dashboard</p>
                <div className="space-y-1">
                  {accessibleDashboards.map(([key, config]) => (
                    <Link
                      key={key}
                      href={config.base}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'block px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        pathname.startsWith(config.base)
                          ? 'bg-brand/10 text-brand'
                          : 'text-foreground-light hover:bg-surface-200 hover:text-foreground'
                      )}
                    >
                      {config.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {currentDashboard?.routes.map((route) => {
                const Icon = route.icon ? ICON_MAP[route.icon] : LayoutDashboard;
                const isActive =
                  pathname === route.href ||
                  (route.href !== currentDashboard.base && pathname.startsWith(route.href));

                return (
                  <Link
                    key={route.href}
                    href={route.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-brand/10 text-brand'
                        : 'text-foreground-light hover:bg-surface-200 hover:text-foreground'
                    )}
                  >
                    {Icon && <Icon className="w-5 h-5" />}
                    {route.label}
                  </Link>
                );
              })}
            </nav>

            {/* User info */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-3 px-3 py-2 mb-2">
                <div className="w-10 h-10 rounded-full bg-brand/20 flex items-center justify-center">
                  <span className="text-lg font-medium text-brand">
                    {user.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
                  <p className="text-xs text-foreground-muted">{user.primaryRoleLabel}</p>
                </div>
              </div>
              <LogoutButton className="w-full" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
