import { SettingsLayout } from '@/components/dashboard/settings-layout';
import { AFFILIATE_SETTINGS_NAV } from '@/components/dashboard/settings-sidebar';

export default function AffiliatesSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SettingsLayout
      title="Settings"
      description="Manage your affiliate preferences"
      basePath="/affiliates/settings"
      navItems={AFFILIATE_SETTINGS_NAV}
    >
      {children}
    </SettingsLayout>
  );
}
