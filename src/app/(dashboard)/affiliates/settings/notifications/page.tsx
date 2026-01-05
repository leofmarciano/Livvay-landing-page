import { Card } from '@/components/ui/Card';

export const metadata = {
  title: 'Notificações | Settings | Affiliates | Livvay',
};

export default function AffiliatesSettingsNotificationsPage() {
  return (
    <Card hover={false}>
      <div className="p-6">
        <h2 className="text-lg font-semibold text-foreground">Notificações</h2>
        <p className="text-sm text-foreground-light mt-1">
          Configure suas preferências de notificação
        </p>
      </div>
    </Card>
  );
}
