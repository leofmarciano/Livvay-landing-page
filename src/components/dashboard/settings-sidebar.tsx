'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Bell, CreditCard, Shield, QrCode } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingsNavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SettingsSidebarProps {
  basePath: string;
}

const SETTINGS_NAV: SettingsNavItem[] = [
  { href: '', label: 'Perfil', icon: User },
  { href: '/notifications', label: 'Notificações', icon: Bell },
  { href: '/payments', label: 'Pagamentos', icon: CreditCard },
  { href: '/codes', label: 'Códigos', icon: QrCode },
  { href: '/security', label: 'Segurança', icon: Shield },
];

export function SettingsSidebar({ basePath }: SettingsSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile: Horizontal scrolling tabs */}
      <nav className="lg:hidden -mx-4 px-4 overflow-x-auto no-scrollbar" aria-label="Settings navigation">
        <div className="flex gap-1 min-w-max pb-1">
          {SETTINGS_NAV.map((item) => {
            const href = `${basePath}${item.href}`;
            const isActive = item.href === ''
              ? pathname === basePath || pathname === `${basePath}/`
              : pathname.startsWith(href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={href}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
                  isActive
                    ? 'bg-brand/10 text-brand'
                    : 'text-foreground-light hover:bg-surface-100 hover:text-foreground'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="size-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop: Vertical sidebar */}
      <nav className="hidden lg:block w-56 shrink-0" aria-label="Settings navigation">
        <ul className="space-y-1">
          {SETTINGS_NAV.map((item) => {
            const href = `${basePath}${item.href}`;
            const isActive = item.href === ''
              ? pathname === basePath || pathname === `${basePath}/`
              : pathname.startsWith(href);
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
                    isActive
                      ? 'bg-brand/10 text-brand'
                      : 'text-foreground-light hover:bg-surface-100 hover:text-foreground'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                  tabIndex={0}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
