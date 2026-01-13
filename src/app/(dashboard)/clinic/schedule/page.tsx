'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Ban,
  Trash2,
  Clock,
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
  AvailableSlot,
  Block,
  AvailabilityResponse,
  BlocksResponse,
  BLOCK_TYPE_LABELS,
  formatDateBR,
  formatTime,
  getTodayISO,
} from '@/lib/clinic/types';

// Days of week in Portuguese
const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

// All possible time slots (07:00 to 18:30)
const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = Math.floor(i / 2) + 7;
  const minute = (i % 2) * 30;
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
});

type BlockType = 'vacation' | 'holiday' | 'personal' | 'other';

export default function SchedulePage() {
  // Current month view
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string>(getTodayISO());

  // Data
  const [availability, setAvailability] = useState<AvailableSlot[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Block modal
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [blockDate, setBlockDate] = useState('');
  const [blockFullDay, setBlockFullDay] = useState(true);
  const [blockStartTime, setBlockStartTime] = useState('07:00');
  const [blockEndTime, setBlockEndTime] = useState('19:00');
  const [blockType, setBlockType] = useState<BlockType>('personal');
  const [blockReason, setBlockReason] = useState('');
  const [isCreatingBlock, setIsCreatingBlock] = useState(false);

  // Delete block modal
  const [deleteBlockModalOpen, setDeleteBlockModalOpen] = useState(false);
  const [deletingBlock, setDeletingBlock] = useState<Block | null>(null);
  const [isDeletingBlock, setIsDeletingBlock] = useState(false);

  // Calculate month boundaries
  const monthStart = useMemo(() => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    return date.toISOString().split('T')[0];
  }, [currentDate]);

  const monthEnd = useMemo(() => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    return date.toISOString().split('T')[0];
  }, [currentDate]);

  // Fetch availability
  const fetchAvailability = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/clinic/schedule/availability?start_date=${monthStart}&end_date=${monthEnd}`
      );
      const data: AvailabilityResponse = await response.json();

      if (!response.ok) {
        throw new Error((data as { error?: string }).error || 'Erro ao buscar disponibilidade');
      }

      setAvailability(data.slots);
    } catch (err) {
      console.error('[Schedule] Fetch availability error:', err);
    }
  }, [monthStart, monthEnd]);

  // Fetch blocks
  const fetchBlocks = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/clinic/blocks?from_date=${monthStart}&to_date=${monthEnd}`
      );
      const data: BlocksResponse = await response.json();

      if (!response.ok) {
        throw new Error((data as { error?: string }).error || 'Erro ao buscar bloqueios');
      }

      setBlocks(data.blocks);
    } catch (err) {
      console.error('[Schedule] Fetch blocks error:', err);
    }
  }, [monthStart, monthEnd]);

  // Load data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await Promise.all([fetchAvailability(), fetchBlocks()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  }, [fetchAvailability, fetchBlocks]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Calendar days for current month
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days: { date: string; day: number; isCurrentMonth: boolean }[] = [];

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const date = new Date(year, month - 1, day);
      days.push({
        date: date.toISOString().split('T')[0],
        day,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({
        date: date.toISOString().split('T')[0],
        day,
        isCurrentMonth: true,
      });
    }

    // Next month days
    const remainingDays = 42 - days.length; // 6 rows x 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date: date.toISOString().split('T')[0],
        day,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentDate]);

  // Get availability summary for a date
  const getDateSummary = useCallback(
    (date: string) => {
      const daySlots = availability.filter((s) => s.date === date);
      const dayBlocks = blocks.filter((b) => b.block_date === date);
      const hasFullDayBlock = dayBlocks.some((b) => !b.start_time);

      if (hasFullDayBlock) {
        return { available: 0, total: 24, blocked: true };
      }

      const totalAvailable = daySlots.reduce((sum, s) => sum + s.available_spots, 0);
      const totalSlots = 24; // 12 hours * 2 slots per hour

      return {
        available: totalAvailable,
        total: totalSlots,
        blocked: false,
      };
    },
    [availability, blocks]
  );

  // Get slots for selected date
  const selectedDateSlots = useMemo(() => {
    return availability.filter((s) => s.date === selectedDate);
  }, [availability, selectedDate]);

  // Get blocks for selected date
  const selectedDateBlocks = useMemo(() => {
    return blocks.filter((b) => b.block_date === selectedDate);
  }, [blocks, selectedDate]);

  // Handle navigation
  const goToPrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(getTodayISO());
  };

  // Handle block creation
  const openBlockModal = (date?: string) => {
    setBlockDate(date || selectedDate);
    setBlockFullDay(true);
    setBlockStartTime('07:00');
    setBlockEndTime('19:00');
    setBlockType('personal');
    setBlockReason('');
    setBlockModalOpen(true);
  };

  const handleCreateBlock = async () => {
    setIsCreatingBlock(true);
    setError(null);

    try {
      const response = await fetch('/api/clinic/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          block_date: blockDate,
          start_time: blockFullDay ? null : blockStartTime,
          end_time: blockFullDay ? null : blockEndTime,
          block_type: blockType,
          reason: blockReason || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar bloqueio');
      }

      await loadData();
      setBlockModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar bloqueio');
    } finally {
      setIsCreatingBlock(false);
    }
  };

  // Handle block deletion
  const openDeleteBlockModal = (block: Block) => {
    setDeletingBlock(block);
    setDeleteBlockModalOpen(true);
  };

  const handleDeleteBlock = async () => {
    if (!deletingBlock) return;

    setIsDeletingBlock(true);
    setError(null);

    try {
      const response = await fetch(`/api/clinic/blocks/${deletingBlock.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao remover bloqueio');
      }

      await loadData();
      setDeleteBlockModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover bloqueio');
    } finally {
      setIsDeletingBlock(false);
    }
  };

  // Format selected date for display
  const selectedDateFormatted = useMemo(() => {
    const [year, month, day] = selectedDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const weekday = WEEKDAYS[date.getDay()];
    return `${weekday}, ${day} de ${MONTHS[month - 1]}`;
  }, [selectedDate]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Minha Agenda</h1>
          <p className="text-foreground-light mt-1">
            Visualize sua disponibilidade e gerencie bloqueios
          </p>
        </div>
        <Button type="primary" onClick={() => openBlockModal()}>
          <Ban className="w-4 h-4 mr-2" />
          Bloquear horário
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card hover={false} className="lg:col-span-2">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button type="ghost" size="small" onClick={goToPrevMonth}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h2 className="text-lg font-semibold text-foreground min-w-[160px] text-center">
                  {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <Button type="ghost" size="small" onClick={goToNextMonth}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <Button type="outline" size="small" onClick={goToToday}>
                Hoje
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 text-brand animate-spin" />
            </div>
          ) : (
            <div className="p-4">
              {/* Weekday headers */}
              <div className="grid grid-cols-7 mb-2">
                {WEEKDAYS.map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs font-medium text-foreground-muted py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map(({ date, day, isCurrentMonth }) => {
                  const summary = getDateSummary(date);
                  const isSelected = date === selectedDate;
                  const isToday = date === getTodayISO();
                  const isPast = date < getTodayISO();

                  return (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      disabled={!isCurrentMonth}
                      className={`
                        relative p-2 rounded-lg text-center transition-colors min-h-[60px]
                        overflow-hidden
                        ${!isCurrentMonth ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
                        ${isSelected ? 'bg-brand/10 ring-2 ring-brand' : 'hover:bg-surface-200'}
                        ${isToday && !isSelected ? 'bg-surface-200' : ''}
                        ${summary.blocked ? 'bg-destructive/10' : ''}
                      `}
                    >
                      <span
                        className={`
                          text-sm font-medium block
                          ${isSelected ? 'text-brand' : 'text-foreground'}
                          ${isPast && !isSelected ? 'text-foreground-muted' : ''}
                        `}
                      >
                        {day}
                      </span>
                      {isCurrentMonth && !isPast && (
                        <div className="mt-1 overflow-hidden">
                          {summary.blocked ? (
                            <span className="text-xs text-destructive block truncate whitespace-nowrap">
                              Bloqueado
                            </span>
                          ) : (
                            <span className="text-xs text-foreground-muted block truncate whitespace-nowrap">
                              {summary.available > 0 ? `${summary.available} vagas` : 'Lotado'}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </Card>

        {/* Day detail */}
        <Card hover={false}>
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-foreground">{selectedDateFormatted}</h3>
          </div>

          <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
            {/* Blocks for this day */}
            {selectedDateBlocks.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider">
                  Bloqueios
                </p>
                {selectedDateBlocks.map((block) => (
                  <div
                    key={block.id}
                    className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-destructive">
                        {block.start_time
                          ? `${formatTime(block.start_time)} - ${formatTime(block.end_time!)}`
                          : 'Dia inteiro'}
                      </p>
                      <p className="text-xs text-foreground-muted">
                        {BLOCK_TYPE_LABELS[block.block_type]}
                        {block.reason && ` - ${block.reason}`}
                      </p>
                    </div>
                    <button
                      onClick={() => openDeleteBlockModal(block)}
                      className="p-1.5 hover:bg-destructive/20 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Slots */}
            {selectedDate >= getTodayISO() && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider">
                  Horários
                </p>
                {TIME_SLOTS.map((time) => {
                  const slot = selectedDateSlots.find((s) => s.start === time);
                  const isBlocked = selectedDateBlocks.some(
                    (b) =>
                      !b.start_time ||
                      (b.start_time && time >= b.start_time && time < b.end_time!)
                  );

                  if (isBlocked) {
                    return (
                      <div
                        key={time}
                        className="flex items-center gap-3 p-2 rounded-lg bg-surface-200/50"
                      >
                        <Clock className="w-4 h-4 text-foreground-muted" />
                        <span className="text-sm text-foreground-muted">{time}</span>
                        <span className="text-xs text-destructive ml-auto">Bloqueado</span>
                      </div>
                    );
                  }

                  if (!slot) {
                    return (
                      <div
                        key={time}
                        className="flex items-center gap-3 p-2 rounded-lg bg-surface-200/50"
                      >
                        <Clock className="w-4 h-4 text-foreground-muted" />
                        <span className="text-sm text-foreground-muted">{time}</span>
                        <span className="text-xs text-foreground-muted ml-auto">Lotado</span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={time}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-100"
                    >
                      <Clock className="w-4 h-4 text-brand" />
                      <span className="text-sm text-foreground">{time}</span>
                      <span className="text-xs text-brand ml-auto">
                        {slot.available_spots} {slot.available_spots === 1 ? 'vaga' : 'vagas'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {selectedDate < getTodayISO() && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="w-8 h-8 text-foreground-muted mb-2" />
                <p className="text-foreground-muted text-sm">Data passada</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Block Modal */}
      <Dialog open={blockModalOpen} onOpenChange={setBlockModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ban className="w-5 h-5" />
              Bloquear horário
            </DialogTitle>
            <DialogDescription>
              Defina o período que deseja bloquear para indisponibilidade
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {/* Date */}
            <div>
              <label className="block text-sm text-foreground-muted mb-2">Data</label>
              <input
                type="date"
                value={blockDate}
                onChange={(e) => setBlockDate(e.target.value)}
                min={getTodayISO()}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>

            {/* Block type */}
            <div>
              <label className="block text-sm text-foreground-muted mb-2">Tipo</label>
              <select
                value={blockType}
                onChange={(e) => setBlockType(e.target.value as BlockType)}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <option value="vacation">Férias</option>
                <option value="holiday">Feriado</option>
                <option value="personal">Pessoal</option>
                <option value="other">Outro</option>
              </select>
            </div>

            {/* Full day toggle */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="fullDay"
                checked={blockFullDay}
                onChange={(e) => setBlockFullDay(e.target.checked)}
                className="w-4 h-4 rounded border-border text-brand focus:ring-brand"
              />
              <label htmlFor="fullDay" className="text-sm text-foreground">
                Bloquear dia inteiro
              </label>
            </div>

            {/* Time range (if not full day) */}
            {!blockFullDay && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-foreground-muted mb-2">
                    Horário início
                  </label>
                  <select
                    value={blockStartTime}
                    onChange={(e) => setBlockStartTime(e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                  >
                    {TIME_SLOTS.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-foreground-muted mb-2">
                    Horário fim
                  </label>
                  <select
                    value={blockEndTime}
                    onChange={(e) => setBlockEndTime(e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                  >
                    {TIME_SLOTS.filter((t) => t > blockStartTime).map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                    <option value="19:00">19:00</option>
                  </select>
                </div>
              </div>
            )}

            {/* Reason */}
            <div>
              <label className="block text-sm text-foreground-muted mb-2">
                Motivo (opcional)
              </label>
              <textarea
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-foreground-muted focus:outline-none focus:ring-2 focus:ring-brand resize-none"
                rows={2}
                placeholder="Informe o motivo do bloqueio..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="outline" onClick={() => setBlockModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="primary" onClick={handleCreateBlock} loading={isCreatingBlock}>
              Bloquear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Block Modal */}
      <Dialog open={deleteBlockModalOpen} onOpenChange={setDeleteBlockModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-destructive" />
              Remover bloqueio
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover este bloqueio?
            </DialogDescription>
          </DialogHeader>

          {deletingBlock && (
            <div className="py-4">
              <div className="p-4 bg-surface-100 rounded-xl space-y-2">
                <p className="text-sm text-foreground">
                  <span className="text-foreground-muted">Data:</span>{' '}
                  {formatDateBR(deletingBlock.block_date)}
                </p>
                <p className="text-sm text-foreground">
                  <span className="text-foreground-muted">Horário:</span>{' '}
                  {deletingBlock.start_time
                    ? `${formatTime(deletingBlock.start_time)} - ${formatTime(deletingBlock.end_time!)}`
                    : 'Dia inteiro'}
                </p>
                <p className="text-sm text-foreground">
                  <span className="text-foreground-muted">Tipo:</span>{' '}
                  {BLOCK_TYPE_LABELS[deletingBlock.block_type]}
                </p>
                {deletingBlock.reason && (
                  <p className="text-sm text-foreground">
                    <span className="text-foreground-muted">Motivo:</span>{' '}
                    {deletingBlock.reason}
                  </p>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="outline" onClick={() => setDeleteBlockModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="destructive" onClick={handleDeleteBlock} loading={isDeletingBlock}>
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
