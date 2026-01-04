import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { getCurrentUser } from '@/lib/rbac/server';
import { getRoleLabel } from '@/lib/rbac/types';

export default async function FinanceiroPage() {
  const user = await getCurrentUser();

  return (
    <Container className="py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Painel Financeiro</h1>
        <p className="text-foreground-light mt-2">
          Bem-vindo, {user?.email} ({getRoleLabel(user?.role || 'financeiro')})
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card hover={false}>
          <div className="text-center py-6">
            <p className="text-3xl font-bold text-foreground">R$ 0</p>
            <p className="text-foreground-light text-sm mt-1">Pagamentos Pendentes</p>
          </div>
        </Card>
        <Card hover={false}>
          <div className="text-center py-6">
            <p className="text-3xl font-bold text-foreground">R$ 0</p>
            <p className="text-foreground-light text-sm mt-1">Pagamentos Realizados</p>
          </div>
        </Card>
        <Card hover={false}>
          <div className="text-center py-6">
            <p className="text-3xl font-bold text-foreground">0</p>
            <p className="text-foreground-light text-sm mt-1">Saques Pendentes</p>
          </div>
        </Card>
      </div>

      <Card hover={false} className="mt-8">
        <div className="text-center py-8">
          <p className="text-foreground-light">
            O painel financeiro esta em construcao.
          </p>
        </div>
      </Card>
    </Container>
  );
}
