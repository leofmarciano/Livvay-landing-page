import { type UserWithRole } from '@/lib/rbac/types';
import { DashboardSidebar } from './dashboard-sidebar';
import { DashboardHeader } from './dashboard-header';

interface DashboardShellProps {
  children: React.ReactNode;
  user: UserWithRole;
}

export function DashboardShell({ children, user }: DashboardShellProps) {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar (desktop only) */}
      <DashboardSidebar user={user} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <DashboardHeader user={user} />

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
