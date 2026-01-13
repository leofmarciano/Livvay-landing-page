import { Card } from '@/components/ui/Card';
import { Calendar, Users, Clock, TrendingUp } from 'lucide-react';

export const metadata = {
  title: 'Painel Clínica | Livvay',
};

export default function ClinicPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Painel</h1>
        <p className="text-foreground-light mt-1">
          Visão geral dos seus atendimentos e pacientes
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card hover={false}>
          <div className="flex items-center gap-4 p-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-brand/10">
              <Calendar className="w-6 h-6 text-brand" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">0</p>
              <p className="text-foreground-light text-sm">Agendamentos hoje</p>
            </div>
          </div>
        </Card>

        <Card hover={false}>
          <div className="flex items-center gap-4 p-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-warning/10">
              <Clock className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">0</p>
              <p className="text-foreground-light text-sm">Pendentes</p>
            </div>
          </div>
        </Card>

        <Card hover={false}>
          <div className="flex items-center gap-4 p-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-surface-200">
              <Users className="w-6 h-6 text-foreground-muted" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">0</p>
              <p className="text-foreground-light text-sm">Pacientes</p>
            </div>
          </div>
        </Card>

        <Card hover={false}>
          <div className="flex items-center gap-4 p-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-surface-200">
              <TrendingUp className="w-6 h-6 text-foreground-muted" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">0</p>
              <p className="text-foreground-light text-sm">Este mês</p>
            </div>
          </div>
        </Card>
      </div>

      <Card hover={false}>
        <div className="text-center py-12">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-surface-200 mx-auto mb-4">
            <Calendar className="w-8 h-8 text-foreground-muted" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            Bem-vindo ao seu painel
          </h3>
          <p className="text-foreground-light max-w-md mx-auto">
            Aqui você poderá acompanhar seus agendamentos, gerenciar pacientes e
            visualizar métricas do seu consultório.
          </p>
        </div>
      </Card>
    </div>
  );
}
