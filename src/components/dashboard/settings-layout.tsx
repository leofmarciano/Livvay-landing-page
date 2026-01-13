import { SettingsSidebar, type SettingsNavItem, AFFILIATE_SETTINGS_NAV } from './settings-sidebar';

interface SettingsLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
  basePath: string;
  navItems?: SettingsNavItem[];
}

/**
 * Reusable settings layout component.
 * Provides consistent structure for settings pages across different dashboards.
 */
export function SettingsLayout({
  children,
  title,
  description,
  basePath,
  navItems = AFFILIATE_SETTINGS_NAV,
}: SettingsLayoutProps) {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <p className="text-foreground-light mt-1">{description}</p>
      </div>

      {/* Navigation + Content */}
      <div className="flex flex-col lg:flex-row lg:gap-8">
        <SettingsSidebar basePath={basePath} items={navItems} />
        <div className="flex-1 min-w-0 mt-6 lg:mt-0">{children}</div>
      </div>
    </div>
  );
}
