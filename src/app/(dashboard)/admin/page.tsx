import { Card } from '@/components/ui/Card';

export const metadata = {
  title: 'Admin Dashboard | Livvay',
};

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-foreground-light mt-1">System overview and management</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card hover={false}>
          <div className="text-center py-6">
            <p className="text-3xl font-bold text-foreground">0</p>
            <p className="text-foreground-light text-sm mt-1">Users</p>
          </div>
        </Card>
        <Card hover={false}>
          <div className="text-center py-6">
            <p className="text-3xl font-bold text-foreground">0</p>
            <p className="text-foreground-light text-sm mt-1">Affiliates</p>
          </div>
        </Card>
        <Card hover={false}>
          <div className="text-center py-6">
            <p className="text-3xl font-bold text-foreground">R$ 0</p>
            <p className="text-foreground-light text-sm mt-1">Revenue</p>
          </div>
        </Card>
        <Card hover={false}>
          <div className="text-center py-6">
            <p className="text-3xl font-bold text-foreground">0</p>
            <p className="text-foreground-light text-sm mt-1">Tickets</p>
          </div>
        </Card>
      </div>

      <Card hover={false}>
        <div className="text-center py-8">
          <p className="text-foreground-light">Admin panel is under construction.</p>
        </div>
      </Card>
    </div>
  );
}
