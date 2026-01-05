import { Card } from '@/components/ui/Card';

export const metadata = {
  title: 'Perfil | Settings | Affiliates | Livvay',
};

export default function AffiliatesSettingsProfilePage() {
  return (
    <Card hover={false}>
      <div className="p-6">
        <h2 className="text-lg font-semibold text-foreground">Perfil</h2>
        <p className="text-sm text-foreground-light mt-1">
          Gerencie suas informações pessoais
        </p>
      </div>
    </Card>
  );
}
