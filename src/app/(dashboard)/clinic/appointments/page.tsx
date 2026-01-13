'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Calendar,
  Clock,
  CalendarDays,
  CheckCircle,
  Loader2,
  MoreHorizontal,
  XCircle,
  Copy,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Ban,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AppointmentListItem,
  AppointmentsResponse,
  STATUS_CONFIG,
  formatDateBR,
  formatTime,
  getTodayISO,
  getDateOffsetISO,
} from '@/lib/clinic/types';

type FilterStatus = 'all' | 'scheduled' | 'completed' | 'cancelled' | 'no_show';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Stats
  const [stats, setStats] = useState({ today: 0, week: 0, month: 0, total: 0 });

  // Cancel modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancellingAppointment, setCancellingAppointment] = useState<AppointmentListItem | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  // Fetch appointments
  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '20');

      if (statusFilter !== 'all') {
        params.set('status', statusFilter);
      }
      if (fromDate) {
        params.set('from_date', fromDate);
      }
      if (toDate) {
        params.set('to_date', toDate);
      }

      const response = await fetch(`/api/clinic/appointments?${params}`);
      const data: AppointmentsResponse = await response.json();

      if (!response.ok) {
        throw new Error((data as { error?: string }).error || 'Erro ao buscar agendamentos');
      }

      setAppointments(data.appointments);
      setTotalPages(data.pagination.totalPages);
      setTotal(data.pagination.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar agendamentos');
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, fromDate, toDate]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const today = getTodayISO();
      const weekEnd = getDateOffsetISO(7);
      const monthEnd = getDateOffsetISO(30);

      // Fetch counts for each period
      const [todayRes, weekRes, monthRes, totalRes] = await Promise.all([
        fetch(`/api/clinic/appointments?status=scheduled&from_date=${today}&to_date=${today}&limit=1`),
        fetch(`/api/clinic/appointments?status=scheduled&from_date=${today}&to_date=${weekEnd}&limit=1`),
        fetch(`/api/clinic/appointments?status=scheduled&from_date=${today}&to_date=${monthEnd}&limit=1`),
        fetch(`/api/clinic/appointments?limit=1`),
      ]);

      const [todayData, weekData, monthData, totalData] = await Promise.all([
        todayRes.json(),
        weekRes.json(),
        monthRes.json(),
        totalRes.json(),
      ]);

      setStats({
        today: todayData.pagination?.total || 0,
        week: weekData.pagination?.total || 0,
        month: monthData.pagination?.total || 0,
        total: totalData.pagination?.total || 0,
      });
    } catch {
      // Stats are non-critical, silently fail
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Handle cancel
  const handleCancelClick = (appointment: AppointmentListItem) => {
    setCancellingAppointment(appointment);
    setCancelReason('');
    setCancelModalOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!cancellingAppointment) return;

    setIsCancelling(true);

    try {
      const response = await fetch(`/api/clinic/appointments/${cancellingAppointment.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason || undefined }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Erro ao cancelar');
      }

      // Refresh data
      await fetchAppointments();
      await fetchStats();
      setCancelModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cancelar agendamento');
    } finally {
      setIsCancelling(false);
    }
  };

  // Handle copy video link
  const handleCopyLink = async (link: string) => {
    await navigator.clipboard.writeText(link);
  };

  // Filter change resets to page 1
  const handleFilterChange = (newStatus: FilterStatus) => {
    setStatusFilter(newStatus);
    setPage(1);
  };

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
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card hover={false}>
          <div className="flex items-center gap-4 p-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-brand/10">
              <CalendarDays className="w-6 h-6 text-brand" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.today}</p>
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
              <p className="text-2xl font-bold text-foreground">{stats.week}</p>
              <p className="text-foreground-light text-sm">Próximos 7 dias</p>
            </div>
          </div>
        </Card>

        <Card hover={false}>
          <div className="flex items-center gap-4 p-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-surface-200">
              <Calendar className="w-6 h-6 text-foreground-muted" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.month}</p>
              <p className="text-foreground-light text-sm">Próximos 30 dias</p>
            </div>
          </div>
        </Card>

        <Card hover={false}>
          <div className="flex items-center gap-4 p-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-surface-200">
              <CheckCircle className="w-6 h-6 text-foreground-muted" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-foreground-light text-sm">Total</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={statusFilter}
          onChange={(e) => handleFilterChange(e.target.value as FilterStatus)}
          className="px-4 py-2 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
        >
          <option value="all">Todos os status</option>
          <option value="scheduled">Agendados</option>
          <option value="completed">Concluídos</option>
          <option value="cancelled">Cancelados</option>
          <option value="no_show">Não compareceu</option>
        </select>

        <input
          type="date"
          value={fromDate}
          onChange={(e) => {
            setFromDate(e.target.value);
            setPage(1);
          }}
          placeholder="Data inicial"
          className="px-4 py-2 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
        />

        <input
          type="date"
          value={toDate}
          onChange={(e) => {
            setToDate(e.target.value);
            setPage(1);
          }}
          placeholder="Data final"
          className="px-4 py-2 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
        />

        {(statusFilter !== 'all' || fromDate || toDate) && (
          <Button
            type="ghost"
            size="small"
            onClick={() => {
              setStatusFilter('all');
              setFromDate('');
              setToDate('');
              setPage(1);
            }}
          >
            Limpar filtros
          </Button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      {/* Appointments List */}
      <Card hover={false}>
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-brand animate-spin" />
          </div>
        ) : appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-surface-200 mb-4">
              <Calendar className="w-8 h-8 text-foreground-muted" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              Nenhum agendamento
            </h3>
            <p className="text-foreground-light text-center max-w-md">
              {statusFilter !== 'all' || fromDate || toDate
                ? 'Nenhum agendamento encontrado com os filtros selecionados.'
                : 'Você ainda não possui agendamentos. Os pacientes podem agendar consultas através do aplicativo Livvay.'}
            </p>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-0">
                <thead>
                  <tr className="border-b border-solid border-border">
                    <th className="text-left text-xs font-medium text-foreground-muted uppercase tracking-wider px-6 py-3 border-0">
                      Data
                    </th>
                    <th className="text-left text-xs font-medium text-foreground-muted uppercase tracking-wider px-6 py-3 border-0">
                      Horário
                    </th>
                    <th className="text-left text-xs font-medium text-foreground-muted uppercase tracking-wider px-6 py-3 border-0">
                      Paciente
                    </th>
                    <th className="text-left text-xs font-medium text-foreground-muted uppercase tracking-wider px-6 py-3 border-0">
                      Status
                    </th>
                    <th className="text-right text-xs font-medium text-foreground-muted uppercase tracking-wider px-6 py-3 border-0">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {appointments.map((apt) => {
                    const statusConfig = STATUS_CONFIG[apt.status];
                    return (
                      <tr key={apt.id} className="hover:bg-surface-200/50 border-0">
                        <td className="px-6 py-4 border-0 text-foreground">
                          {formatDateBR(apt.appointment_date)}
                        </td>
                        <td className="px-6 py-4 border-0 text-foreground">
                          {formatTime(apt.slot_start)} - {formatTime(apt.slot_end)}
                        </td>
                        <td className="px-6 py-4 border-0 text-foreground-light font-mono text-sm">
                          {apt.livvay_user_id.slice(0, 8)}...
                        </td>
                        <td className="px-6 py-4 border-0">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}
                          >
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 border-0 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-2 hover:bg-surface-200 rounded-lg transition-colors">
                                <MoreHorizontal className="w-4 h-4 text-foreground-muted" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {apt.video_link && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => window.open(apt.video_link!, '_blank')}
                                  >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Abrir videochamada
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleCopyLink(apt.video_link!)}
                                  >
                                    <Copy className="w-4 h-4 mr-2" />
                                    Copiar link
                                  </DropdownMenuItem>
                                </>
                              )}
                              {apt.status === 'scheduled' && (
                                <DropdownMenuItem
                                  onClick={() => handleCancelClick(apt)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Cancelar
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                <p className="text-sm text-foreground-muted">
                  Mostrando {appointments.length} de {total} agendamentos
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="outline"
                    size="small"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-foreground-light px-2">
                    Página {page} de {totalPages}
                  </span>
                  <Button
                    type="outline"
                    size="small"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Cancel Modal */}
      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ban className="w-5 h-5 text-destructive" />
              Cancelar agendamento
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja cancelar este agendamento?
            </DialogDescription>
          </DialogHeader>

          {cancellingAppointment && (
            <div className="py-4 space-y-3">
              <div className="p-4 bg-surface-100 rounded-xl">
                <p className="text-sm text-foreground-muted mb-1">Paciente</p>
                <p className="text-foreground font-mono text-sm">
                  {cancellingAppointment.livvay_user_id}
                </p>
              </div>
              <div className="p-4 bg-surface-100 rounded-xl">
                <p className="text-sm text-foreground-muted mb-1">Data e horário</p>
                <p className="text-foreground">
                  {formatDateBR(cancellingAppointment.appointment_date)} às{' '}
                  {formatTime(cancellingAppointment.slot_start)}
                </p>
              </div>
              <div>
                <label
                  htmlFor="cancel-reason"
                  className="block text-sm text-foreground-muted mb-2"
                >
                  Motivo do cancelamento (opcional)
                </label>
                <textarea
                  id="cancel-reason"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-foreground-muted focus:outline-none focus:ring-2 focus:ring-brand resize-none"
                  rows={3}
                  placeholder="Informe o motivo do cancelamento..."
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="outline" onClick={() => setCancelModalOpen(false)}>
              Voltar
            </Button>
            <Button
              type="destructive"
              onClick={handleCancelConfirm}
              loading={isCancelling}
            >
              Confirmar cancelamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
