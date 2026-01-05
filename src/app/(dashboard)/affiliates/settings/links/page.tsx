import { Card } from '@/components/ui/Card';

export const metadata = {
  title: 'Links | Settings | Affiliates | Livvay',
};

export default function AffiliatesSettingsLinksPage() {
  return (
    <Card hover={false}>
      <div className="p-6">
        <h2 className="text-lg font-semibold text-foreground">Links</h2>
        <p className="text-sm text-foreground-light mt-1">
          Configure seus links de afiliado
        </p>
      </div>
    </Card>
  );
}
