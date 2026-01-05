'use client';

interface DashboardShellProps {
  children: React.ReactNode;
}

/**
 * Dashboard shell layout.
 */
export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <main className="flex-1 overflow-auto px-4 pb-4 lg:px-6 lg:pb-6">
      {children}
    </main>
  );
}
