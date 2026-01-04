import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { getCurrentUser } from '@/lib/rbac/server';
import { getRoleLabel } from '@/lib/rbac/types';

export default async function AdminPage() {
  const user = await getCurrentUser();

  return (
    <Container className="py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Painel Administrativo</h1>
        <p className="text-foreground-light mt-2">
          Bem-vindo, {user?.email} ({getRoleLabel(user?.role || 'admin')})
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card hover={false}>
          <div className="text-center py-6">
            <p className="text-3xl font-bold text-foreground">0</p>
            <p className="text-foreground-light text-sm mt-1">Usuarios</p>
          </div>
        </Card>
        <Card hover={false}>
          <div className="text-center py-6">
            <p className="text-3xl font-bold text-foreground">0</p>
            <p className="text-foreground-light text-sm mt-1">Afiliados</p>
          </div>
        </Card>
        <Card hover={false}>
          <div className="text-center py-6">
            <p className="text-3xl font-bold text-foreground">R$ 0</p>
            <p className="text-foreground-light text-sm mt-1">Receita</p>
          </div>
        </Card>
        <Card hover={false}>
          <div className="text-center py-6">
            <p className="text-3xl font-bold text-foreground">0</p>
            <p className="text-foreground-light text-sm mt-1">Tickets</p>
          </div>
        </Card>
      </div>

      <Card hover={false} className="mt-8">
        <div className="text-center py-8">
          <p className="text-foreground-light">
            O painel administrativo esta em construcao.
          </p>
        </div>
      </Card>
    </Container>
  );
}
