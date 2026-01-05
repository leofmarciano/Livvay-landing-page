import { Card } from '@/components/ui/Card';

export const metadata = {
  title: 'Clinic Dashboard | Livvay',
};

export default function ClinicPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Clinic Dashboard</h1>
        <p className="text-foreground-light mt-1">Patient management and appointments</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card hover={false}>
          <div className="text-center py-6">
            <p className="text-3xl font-bold text-foreground">0</p>
            <p className="text-foreground-light text-sm mt-1">Patients</p>
          </div>
        </Card>
        <Card hover={false}>
          <div className="text-center py-6">
            <p className="text-3xl font-bold text-foreground">0</p>
            <p className="text-foreground-light text-sm mt-1">Today's Appointments</p>
          </div>
        </Card>
        <Card hover={false}>
          <div className="text-center py-6">
            <p className="text-3xl font-bold text-foreground">0</p>
            <p className="text-foreground-light text-sm mt-1">Pending</p>
          </div>
        </Card>
      </div>

      <Card hover={false}>
        <div className="text-center py-8">
          <p className="text-foreground-light">Clinic dashboard is under construction.</p>
        </div>
      </Card>
    </div>
  );
}
