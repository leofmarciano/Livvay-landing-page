'use client';

import { Card } from '@/components/ui/Card';

/**
 * Shared notifications settings component.
 * Used by both affiliate and clinic dashboards.
 */
export function NotificationsSettings() {
  return (
    <Card hover={false}>
      <div className="p-6">
        <h2 className="text-lg font-semibold text-foreground">Notificações</h2>
        <p className="text-sm text-foreground-light mt-1">
          Configure suas preferências de notificação
        </p>
      </div>
      <div className="border-t border-border p-6">
        <p className="text-foreground-muted text-center py-8">
          Configurações de notificação em breve
        </p>
      </div>
    </Card>
  );
}
