'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Users, Plus, Search, UserPlus } from 'lucide-react';

export default function PatientsPage() {
  const [patients] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pacientes</h1>
          <p className="text-foreground-light mt-1">
            Gerencie seus pacientes e histórico de atendimentos
          </p>
        </div>
        <Button type="primary">
          <UserPlus className="w-4 h-4 mr-2" />
          Novo paciente
        </Button>
      </div>

      {/* Search and Filters */}
      <Card hover={false}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
            <input
              type="text"
              placeholder="Buscar por nome, CPF ou telefone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder-foreground-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
            />
          </div>
        </div>
      </Card>

      {/* Patients List / Empty State */}
      <Card hover={false}>
        {patients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-surface-200 mb-4">
              <Users className="w-8 h-8 text-foreground-muted" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              Nenhum paciente cadastrado
            </h3>
            <p className="text-foreground-light text-center max-w-md mb-6">
              Você ainda não possui pacientes cadastrados. Adicione seu primeiro paciente
              para começar a gerenciar seus atendimentos.
            </p>
            <Button type="primary">
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar primeiro paciente
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {/* Patients list will be rendered here */}
          </div>
        )}
      </Card>
    </div>
  );
}
