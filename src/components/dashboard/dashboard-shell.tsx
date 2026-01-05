import { DashboardSidebar } from './dashboard-sidebar';

interface DashboardShellProps {
  children: React.ReactNode;
}

/**
 * Dashboard shell layout with sidebar.
 * Header is already rendered in root layout - we only add the sidebar here.
 */
export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-5rem)]">
      {/* Sidebar (desktop only) */}
      <DashboardSidebar />

      {/* Page content */}
      <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
    </div>
  );
}
