import { Card } from '@/components/ui/Card';

export const metadata = {
  title: 'Pagamentos | Settings | Affiliates | Livvay',
};

export default function AffiliatesSettingsPaymentsPage() {
  return (
    <Card hover={false}>
      <div className="p-6">
        <h2 className="text-lg font-semibold text-foreground">Pagamentos</h2>
        <p className="text-sm text-foreground-light mt-1">
          Gerencie suas informações de pagamento
        </p>
      </div>
    </Card>
  );
}
