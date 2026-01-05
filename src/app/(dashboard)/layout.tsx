import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/rbac/server';
import { hasRoleAccess } from '@/lib/rbac/types';
import { getCurrentDashboard, getDefaultDashboard } from '@/lib/rbac/config';
import { DashboardShell } from '@/components/dashboard';
import { headers } from 'next/headers';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    // Get current path for redirect
    const headersList = await headers();
    const pathname = headersList.get('x-pathname') || '/affiliates';
    redirect(`/auth/login?next=${encodeURIComponent(pathname)}`);
  }

  // Get current dashboard from URL to check access
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';
  const currentDashboard = getCurrentDashboard(pathname);

  // Check role access for current dashboard
  if (currentDashboard && !hasRoleAccess(user.primaryRole, currentDashboard.requiredRole)) {
    redirect(getDefaultDashboard(user.primaryRole));
  }

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
