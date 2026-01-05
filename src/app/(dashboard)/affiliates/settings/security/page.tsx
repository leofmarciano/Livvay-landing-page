import { Card } from '@/components/ui/Card';

export const metadata = {
  title: 'Segurança | Settings | Affiliates | Livvay',
};

export default function AffiliatesSettingsSecurityPage() {
  return (
    <Card hover={false}>
      <div className="p-6">
        <h2 className="text-lg font-semibold text-foreground">Segurança</h2>
        <p className="text-sm text-foreground-light mt-1">
          Gerencie suas configurações de segurança
        </p>
      </div>
    </Card>
  );
}
