import { SettingsSidebar } from '@/components/dashboard/settings-sidebar';

export default function AffiliatesSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-foreground-light mt-1">Gerencie suas preferências de afiliado</p>
      </div>

      {/* Navigation + Content */}
      <div className="flex flex-col lg:flex-row lg:gap-8">
        <SettingsSidebar basePath="/affiliates/settings" />
        <div className="flex-1 min-w-0 mt-6 lg:mt-0">{children}</div>
      </div>
    </div>
  );
}
