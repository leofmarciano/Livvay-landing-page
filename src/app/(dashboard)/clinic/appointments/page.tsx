'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Calendar, Clock, Plus, Users, CalendarDays } from 'lucide-react';

export default function AppointmentsPage() {
  const [appointments] = useState<any[]>([]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Agendamentos</h1>
          <p className="text-foreground-light mt-1">
            Gerencie suas consultas e horários disponíveis
          </p>
        </div>
        <Button type="primary">
          <Plus className="w-4 h-4 mr-2" />
          Novo agendamento
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card hover={false}>
          <div className="flex items-center gap-4 p-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-brand/10">
              <CalendarDays className="w-6 h-6 text-brand" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">0</p>
              <p className="text-foreground-light text-sm">Hoje</p>
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
              <Calendar className="w-6 h-6 text-foreground-muted" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">0</p>
              <p className="text-foreground-light text-sm">Esta semana</p>
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
      </div>

      {/* Appointments List / Empty State */}
      <Card hover={false}>
        {appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-surface-200 mb-4">
              <Calendar className="w-8 h-8 text-foreground-muted" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              Nenhum agendamento
            </h3>
            <p className="text-foreground-light text-center max-w-md mb-6">
              Você ainda não possui agendamentos. Comece criando seu primeiro agendamento
              para gerenciar suas consultas.
            </p>
            <Button type="primary">
              <Plus className="w-4 h-4 mr-2" />
              Criar primeiro agendamento
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {/* Appointments will be listed here */}
          </div>
        )}
      </Card>
    </div>
  );
}
