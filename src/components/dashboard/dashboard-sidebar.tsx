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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DASHBOARD_ROUTES } from '@/lib/rbac/config';

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

/**
 * Sidebar navigation for dashboard pages.
 * Only shows navigation links for the current dashboard.
 * Dashboard switching and user actions are handled by the Header.
 */
export function DashboardSidebar() {
  const pathname = usePathname();

  // Get current dashboard config
  const currentDashboard = Object.values(DASHBOARD_ROUTES).find((config) =>
    pathname.startsWith(config.base)
  );

  if (!currentDashboard) return null;

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-surface-100 min-h-[calc(100vh-5rem)]">
      {/* Dashboard Title */}
      <div className="p-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">{currentDashboard.label}</h2>
      </div>

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
    </aside>
  );
}
