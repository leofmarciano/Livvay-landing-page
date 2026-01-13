import { SettingsLayout } from '@/components/dashboard/settings-layout';
import { CLINIC_SETTINGS_NAV } from '@/components/dashboard/settings-sidebar';

export default function ClinicSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SettingsLayout
      title="Settings"
      description="Manage your clinic and professional preferences"
      basePath="/clinic/settings"
      navItems={CLINIC_SETTINGS_NAV}
    >
      {children}
    </SettingsLayout>
  );
}
