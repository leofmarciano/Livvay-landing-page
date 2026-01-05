import { Card } from '@/components/ui/Card';

export const metadata = {
  title: 'Códigos e links | Settings | Affiliates | Livvay',
};

export default function AffiliatesSettingsCodesPage() {
  return (
    <Card hover={false}>
      <div className="p-6">
        <h2 className="text-lg font-semibold text-foreground">Códigos e links</h2>
        <p className="text-sm text-foreground-light mt-1">
          Gerencie seus códigos promocionais e links de afiliado
        </p>
      </div>
    </Card>
  );
}
