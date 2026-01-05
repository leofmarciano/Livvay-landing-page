import { SettingsSidebar } from '@/components/dashboard/settings-sidebar';

export default function AffiliatesSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-foreground-light mt-1">Configure affiliate preferences</p>
      </div>

      <div className="flex gap-8">
        <SettingsSidebar basePath="/affiliates/settings" />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
