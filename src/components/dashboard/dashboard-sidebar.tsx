'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  Calendar,
  CreditCard,
  MessageSquare,
  Link as LinkIcon,
  DollarSign,
  ChevronDown,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DASHBOARD_ROUTES, type DashboardConfig } from '@/lib/rbac/config';
import { hasRoleAccess, type RoleName, type UserWithRole } from '@/lib/rbac/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogoutButton } from '@/components/logout-button';

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

interface DashboardSidebarProps {
  user: UserWithRole;
}

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname();

  // Get current dashboard config
  const currentDashboard = Object.values(DASHBOARD_ROUTES).find((config) =>
    pathname.startsWith(config.base)
  );

  // Get all accessible dashboards
  const accessibleDashboards = Object.entries(DASHBOARD_ROUTES).filter(([, config]) =>
    hasRoleAccess(user.primaryRole, config.requiredRole)
  );

  if (!currentDashboard) return null;

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-surface-100">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-foreground">Livvay</span>
        </Link>
      </div>

      {/* Dashboard Switcher */}
      {accessibleDashboards.length > 1 && (
        <div className="p-4 border-b border-border">
          <DropdownMenu>
            <DropdownMenuTrigger className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-surface-200 hover:bg-surface-300 transition-colors text-sm font-medium text-foreground">
              <span>{currentDashboard.label}</span>
              <ChevronDown className="w-4 h-4 text-foreground-muted" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {accessibleDashboards.map(([key, config]) => (
                <DropdownMenuItem key={key} asChild>
                  <Link
                    href={config.base}
                    className={cn(
                      pathname.startsWith(config.base) && 'bg-surface-200'
                    )}
                  >
                    {config.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {currentDashboard.routes.map((route) => {
          const Icon = route.icon ? ICON_MAP[route.icon] : LayoutDashboard;
          const isActive =
            pathname === route.href ||
            (route.href !== currentDashboard.base && pathname.startsWith(route.href));

          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
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

      {/* User Info */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center">
            <span className="text-sm font-medium text-brand">
              {user.email.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
            <p className="text-xs text-foreground-muted">{user.primaryRoleLabel}</p>
          </div>
        </div>
        <div className="mt-2">
          <LogoutButton className="w-full" type="ghost" size="small" />
        </div>
      </div>
    </aside>
  );
}
