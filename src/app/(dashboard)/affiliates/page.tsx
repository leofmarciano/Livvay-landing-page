import { Card } from '@/components/ui/Card';

export const metadata = {
  title: 'Affiliates Dashboard | Livvay',
};

export default function AffiliatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Affiliates Dashboard</h1>
        <p className="text-foreground-light mt-1">Your links and earnings</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card hover={false}>
          <div className="text-center py-6">
            <p className="text-3xl font-bold text-foreground">0</p>
            <p className="text-foreground-light text-sm mt-1">Active Links</p>
          </div>
        </Card>
        <Card hover={false}>
          <div className="text-center py-6">
            <p className="text-3xl font-bold text-foreground">0</p>
            <p className="text-foreground-light text-sm mt-1">Clicks</p>
          </div>
        </Card>
        <Card hover={false}>
          <div className="text-center py-6">
            <p className="text-3xl font-bold text-foreground">R$ 0</p>
            <p className="text-foreground-light text-sm mt-1">Earnings</p>
          </div>
        </Card>
      </div>

      <Card hover={false}>
        <div className="text-center py-8">
          <p className="text-foreground-light">Affiliates dashboard is under construction.</p>
        </div>
      </Card>
    </div>
  );
}
