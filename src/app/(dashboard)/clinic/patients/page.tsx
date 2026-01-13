'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Users,
  Search,
  Loader2,
  Calendar,
  Copy,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  User,
} from 'lucide-react';
import {
  PatientClaim,
  PatientsResponse,
  formatDateBR,
} from '@/lib/clinic/types';

export default function PatientsPage() {
  const [patients, setPatients] = useState<PatientClaim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to first page on search
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch patients
  const fetchPatients = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (debouncedSearch) {
        params.set('search', debouncedSearch);
      }

      const response = await fetch(`/api/clinic/patients?${params}`);
      const data: PatientsResponse = await response.json();

      if (!response.ok) {
        throw new Error((data as { error?: string }).error || 'Erro ao buscar pacientes');
      }

      setPatients(data.patients);
      setTotalPages(data.pagination.totalPages);
      setTotal(data.pagination.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar pacientes');
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Calculate stats
  const stats = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const activeCount = patients.filter((p) => p.scheduled_count > 0).length;
    const newThisMonth = patients.filter(
      (p) => new Date(p.claimed_at) >= startOfMonth
    ).length;

    return {
      total,
      active: activeCount,
      newThisMonth,
    };
  }, [patients, total]);

  // Copy UUID to clipboard
  const copyToClipboard = async (uuid: string) => {
    try {
      await navigator.clipboard.writeText(uuid);
      setCopiedId(uuid);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Truncate UUID for display
  const truncateUuid = (uuid: string) => {
    return `${uuid.slice(0, 8)}...${uuid.slice(-4)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pacientes</h1>
          <p className="text-foreground-light mt-1">
            Pacientes vinculados ao seu perfil
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card hover={false}>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-brand/10">
              <Users className="w-5 h-5 text-brand" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-foreground-muted">Total de pacientes</p>
            </div>
          </div>
        </Card>

        <Card hover={false}>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-brand/10">
              <Clock className="w-5 h-5 text-brand" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.active}</p>
              <p className="text-sm text-foreground-muted">Com consultas agendadas</p>
            </div>
          </div>
        </Card>

        <Card hover={false}>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-brand/10">
              <Calendar className="w-5 h-5 text-brand" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.newThisMonth}</p>
              <p className="text-sm text-foreground-muted">Novos este mês</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card hover={false}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
            <input
              type="text"
              placeholder="Buscar por UUID do paciente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder-foreground-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
            />
          </div>
          <Button type="secondary" onClick={fetchPatients} disabled={isLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Buscar'}
          </Button>
        </div>
      </Card>

      {/* Error State */}
      {error && (
        <Card hover={false}>
          <div className="text-center py-4 text-destructive">{error}</div>
        </Card>
      )}

      {/* Patients Table */}
      <Card hover={false}>
        {isLoading && patients.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-brand" />
          </div>
        ) : patients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-surface-200 mb-4">
              <Users className="w-8 h-8 text-foreground-muted" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              {debouncedSearch ? 'Nenhum paciente encontrado' : 'Nenhum paciente vinculado'}
            </h3>
            <p className="text-foreground-light text-center max-w-md">
              {debouncedSearch
                ? 'Tente buscar por outro UUID.'
                : 'Pacientes aparecerão aqui quando vincularem seu perfil através do app Livvay.'}
            </p>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">
                      UUID do Paciente
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">
                      Vinculado em
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">
                      Consultas
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">
                      Última consulta
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-foreground-muted uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {patients.map((patient) => (
                    <tr key={patient.claim_id} className="hover:bg-surface-100 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono text-foreground">
                            {truncateUuid(patient.livvay_user_id)}
                          </code>
                          <button
                            onClick={() => copyToClipboard(patient.livvay_user_id)}
                            className="p-1 hover:bg-surface-200 rounded transition-colors"
                            title="Copiar UUID completo"
                          >
                            {copiedId === patient.livvay_user_id ? (
                              <CheckCircle className="w-4 h-4 text-brand" />
                            ) : (
                              <Copy className="w-4 h-4 text-foreground-muted" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-foreground">
                        {formatDateBR(patient.claimed_at.split('T')[0])}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3 text-sm">
                          <span className="flex items-center gap-1 text-brand" title="Agendadas">
                            <Clock className="w-3.5 h-3.5" />
                            {patient.scheduled_count}
                          </span>
                          <span className="flex items-center gap-1 text-foreground-muted" title="Concluídas">
                            <CheckCircle className="w-3.5 h-3.5" />
                            {patient.completed_count}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-foreground-muted">
                        {patient.last_appointment_date
                          ? formatDateBR(patient.last_appointment_date)
                          : '-'}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <a
                            href={`/clinic/patients/${patient.livvay_user_id}`}
                            className="inline-flex items-center gap-1 text-sm text-foreground hover:text-brand transition-colors"
                          >
                            <User className="w-3.5 h-3.5" />
                            Ver resumo
                          </a>
                          <a
                            href={`/clinic/appointments?patient=${patient.livvay_user_id}`}
                            className="inline-flex items-center gap-1 text-sm text-brand hover:text-brand-600 transition-colors"
                          >
                            Ver agendamentos
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <p className="text-sm text-foreground-muted">
                  Mostrando {(page - 1) * limit + 1} a {Math.min(page * limit, total)} de {total}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="secondary"
                    size="small"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-foreground">
                    {page} / {totalPages}
                  </span>
                  <Button
                    type="secondary"
                    size="small"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
