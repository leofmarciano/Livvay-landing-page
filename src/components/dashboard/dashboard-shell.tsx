'use client';

import { AppSidebar } from './app-sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

interface DashboardShellProps {
  children: React.ReactNode;
}

/**
 * Dashboard shell layout with collapsible sidebar.
 * Uses shadcn sidebar components for better UX.
 */
export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Minimal header with just the sidebar trigger */}
        <div className="flex h-12 shrink-0 items-center px-4">
          <SidebarTrigger />
        </div>
        <main className="flex-1 overflow-auto px-4 pb-4 lg:px-6 lg:pb-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
