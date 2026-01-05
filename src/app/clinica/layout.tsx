import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { hasRoleAccess, parseRole } from '@/lib/rbac/types';
import { getDefaultDashboard } from '@/lib/rbac/config';

export default async function ClinicaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?next=/clinica');
  }

  const userRole = parseRole(user.app_metadata?.role);

  if (!hasRoleAccess(userRole, 'clinica')) {
    redirect(getDefaultDashboard(userRole));
  }

  return <>{children}</>;
}
