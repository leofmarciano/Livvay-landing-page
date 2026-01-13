'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  Calendar,
  CalendarDays,
  CreditCard,
  MessageSquare,
  Link as LinkIcon,
  DollarSign,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { DASHBOARD_ROUTES } from '@/lib/rbac/config';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  Calendar,
  CalendarDays,
  CreditCard,
  MessageSquare,
  Link: LinkIcon,
  DollarSign,
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  // Get current dashboard config based on pathname
  const currentDashboard = Object.values(DASHBOARD_ROUTES).find((config) =>
    pathname.startsWith(config.base)
  );

  if (!currentDashboard) return null;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex h-10 items-center px-2">
          <span className="text-xs font-medium uppercase tracking-wider text-foreground-muted group-data-[collapsible=icon]:hidden">
            {currentDashboard.label}
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="pt-0">
          <SidebarGroupContent>
            <SidebarMenu>
              {currentDashboard.routes.map((route) => {
                const Icon = route.icon ? ICON_MAP[route.icon] : LayoutDashboard;
                const isActive =
                  pathname === route.href ||
                  (route.href !== currentDashboard.base && pathname.startsWith(route.href));

                return (
                  <SidebarMenuItem key={route.href}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={route.label}>
                      <Link href={route.href}>
                        {Icon && <Icon className="size-4" />}
                        <span>{route.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
