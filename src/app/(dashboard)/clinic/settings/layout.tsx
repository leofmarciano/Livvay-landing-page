import { SettingsLayout } from '@/components/dashboard/settings-layout';
import { CLINIC_SETTINGS_NAV } from '@/components/dashboard/settings-sidebar';

export default function ClinicSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SettingsLayout
      title="Configurações"
      description="Gerencie suas preferências profissionais e do consultório"
      basePath="/clinic/settings"
      navItems={CLINIC_SETTINGS_NAV}
    >
      {children}
    </SettingsLayout>
  );
}
