'use client';

import { memo, useMemo } from 'react';
import { Calendar, Video, Clock, ChevronRight, CalendarPlus } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { MockConsulta } from '@/lib/clinic/mock-patient-data';

interface ConsultasCardProps {
  ultimaConsulta?: MockConsulta;
  proximasConsultas: MockConsulta[];
  consultasRealizadas: MockConsulta[];
  onAgendarConsulta?: () => void;
  onIniciarConsulta?: (id: string) => void;
}

interface ConsultaProximaItemProps {
  consulta: MockConsulta;
  onIniciar?: () => void;
}

const ConsultaProximaItem = memo(function ConsultaProximaItem({
  consulta,
  onIniciar,
}: ConsultaProximaItemProps) {
  return (
    <div className="bg-surface-100 rounded-xl p-4 border border-border shadow-layered">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-foreground truncate">{consulta.titulo}</h4>
          <div className="flex items-center gap-2 mt-1 text-sm text-foreground-muted">
            <Calendar className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
            <span className="tabular-nums">{consulta.data}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-sm text-foreground-muted">
            <Clock className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
            <span className="tabular-nums">{consulta.horario}</span>
          </div>
        </div>
        <Button
          type="primary"
          size="small"
          onClick={onIniciar}
          className="flex-shrink-0"
        >
          <Video className="w-4 h-4 mr-1.5" aria-hidden="true" />
          Iniciar consulta
        </Button>
      </div>
    </div>
  );
});

interface ConsultaRealizadaItemProps {
  consulta: MockConsulta;
  onView?: () => void;
}

const ConsultaRealizadaItem = memo(function ConsultaRealizadaItem({
  consulta,
  onView,
}: ConsultaRealizadaItemProps) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
      <div className="flex items-center gap-3">
        <div
          className="w-1.5 h-1.5 rounded-full bg-foreground-muted flex-shrink-0"
          aria-hidden="true"
        />
        <div>
          <span className="text-sm text-foreground-muted tabular-nums">{consulta.data}</span>
          <span className="text-sm text-foreground ml-2">{consulta.titulo}</span>
        </div>
      </div>
      <button
        type="button"
        aria-label={`Ver detalhes de ${consulta.titulo}`}
        onClick={onView}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onView?.();
          }
        }}
        className={cn(
          'p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center',
          'hover:bg-surface-100 rounded transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2'
        )}
      >
        <ChevronRight className="w-4 h-4 text-foreground-muted" aria-hidden="true" />
      </button>
    </div>
  );
});

export function ConsultasCard({
  ultimaConsulta,
  proximasConsultas,
  consultasRealizadas,
  onAgendarConsulta,
  onIniciarConsulta,
}: ConsultasCardProps) {
  // Memoize sliced consultas to avoid recalculation
  const displayedConsultas = useMemo(
    () => consultasRealizadas.slice(0, 5),
    [consultasRealizadas]
  );

  return (
    <Card hover={false} className="h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Consultas</h3>
          {ultimaConsulta && (
            <p className="text-sm text-foreground-muted">
              Última: {ultimaConsulta.titulo}
            </p>
          )}
        </div>
        <Button type="secondary" size="small" onClick={onAgendarConsulta}>
          <Calendar className="w-4 h-4 mr-1.5" aria-hidden="true" />
          Agendar consulta
        </Button>
      </div>

      {/* Próximas consultas */}
      <section aria-labelledby="proximas-consultas-heading" className="mb-6">
        <h4
          id="proximas-consultas-heading"
          className="text-sm font-medium text-foreground-muted uppercase tracking-wide mb-3"
        >
          Próximas consultas
        </h4>
        {proximasConsultas.length > 0 ? (
          <div className="space-y-3">
            {proximasConsultas.map((consulta) => (
              <ConsultaProximaItem
                key={consulta.id}
                consulta={consulta}
                onIniciar={() => onIniciarConsulta?.(consulta.id)}
              />
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <CalendarPlus
              className="w-8 h-8 mx-auto mb-3 text-foreground-muted"
              aria-hidden="true"
            />
            <p className="text-sm font-medium text-foreground mb-1">
              Nenhuma consulta agendada
            </p>
            <p className="text-xs text-foreground-muted mb-4">
              Agende a primeira consulta do paciente
            </p>
            <Button type="secondary" size="small" onClick={onAgendarConsulta}>
              <Calendar className="w-4 h-4 mr-1.5" aria-hidden="true" />
              Agendar consulta
            </Button>
          </div>
        )}
      </section>

      {/* Consultas realizadas */}
      <section aria-labelledby="consultas-realizadas-heading">
        <h4
          id="consultas-realizadas-heading"
          className="text-sm font-medium text-foreground-muted uppercase tracking-wide mb-2"
        >
          Consultas realizadas
        </h4>
        {consultasRealizadas.length > 0 ? (
          <div>
            {displayedConsultas.map((consulta) => (
              <ConsultaRealizadaItem
                key={consulta.id}
                consulta={consulta}
                onView={() => console.log('View consulta:', consulta.id)}
              />
            ))}
            {consultasRealizadas.length > 5 && (
              <button
                type="button"
                onClick={() => console.log('Ver todas consultas')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    console.log('Ver todas consultas');
                  }
                }}
                className={cn(
                  'w-full py-3 text-sm text-brand hover:text-brand-600 transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 rounded'
                )}
              >
                Ver todas ({consultasRealizadas.length})
              </button>
            )}
          </div>
        ) : (
          <div className="py-6 text-center">
            <Calendar
              className="w-8 h-8 mx-auto mb-3 text-foreground-muted"
              aria-hidden="true"
            />
            <p className="text-sm font-medium text-foreground mb-1">
              Nenhuma consulta realizada
            </p>
            <p className="text-xs text-foreground-muted">
              As consultas realizadas aparecerão aqui
            </p>
          </div>
        )}
      </section>
    </Card>
  );
}
