'use client';

import { Calendar, Video, Clock, ChevronRight } from 'lucide-react';
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

function ConsultaProximaItem({
  consulta,
  onIniciar,
}: {
  consulta: MockConsulta;
  onIniciar?: () => void;
}) {
  return (
    <div className="bg-surface-100 rounded-xl p-4 border border-border">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-foreground truncate">{consulta.titulo}</h4>
          <div className="flex items-center gap-2 mt-1 text-sm text-foreground-muted">
            <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{consulta.data}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-sm text-foreground-muted">
            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{consulta.horario}</span>
          </div>
        </div>
        <Button
          type="primary"
          size="small"
          onClick={onIniciar}
          className="flex-shrink-0"
        >
          <Video className="w-4 h-4 mr-1.5" />
          Iniciar consulta
        </Button>
      </div>
    </div>
  );
}

function ConsultaRealizadaItem({ consulta }: { consulta: MockConsulta }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-1.5 h-1.5 rounded-full bg-foreground-muted flex-shrink-0" />
        <div>
          <span className="text-sm text-foreground-muted">{consulta.data}</span>
          <span className="text-sm text-foreground ml-2">{consulta.titulo}</span>
        </div>
      </div>
      <button className="p-1 hover:bg-surface-100 rounded transition-colors">
        <ChevronRight className="w-4 h-4 text-foreground-muted" />
      </button>
    </div>
  );
}

export function ConsultasCard({
  ultimaConsulta,
  proximasConsultas,
  consultasRealizadas,
  onAgendarConsulta,
  onIniciarConsulta,
}: ConsultasCardProps) {
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
          <Calendar className="w-4 h-4 mr-1.5" />
          Agendar consulta
        </Button>
      </div>

      {/* Próximas consultas */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-foreground-muted uppercase tracking-wide mb-3">
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
          <div className="py-4 text-center text-sm text-foreground-muted">
            Nenhuma consulta agendada
          </div>
        )}
      </div>

      {/* Consultas realizadas */}
      <div>
        <h4 className="text-sm font-medium text-foreground-muted uppercase tracking-wide mb-2">
          Consultas realizadas
        </h4>
        {consultasRealizadas.length > 0 ? (
          <div>
            {consultasRealizadas.slice(0, 5).map((consulta) => (
              <ConsultaRealizadaItem key={consulta.id} consulta={consulta} />
            ))}
            {consultasRealizadas.length > 5 && (
              <button className="w-full py-2 text-sm text-brand hover:text-brand-600 transition-colors">
                Ver todas ({consultasRealizadas.length})
              </button>
            )}
          </div>
        ) : (
          <div className="py-4 text-center text-sm text-foreground-muted">
            Nenhuma consulta realizada
          </div>
        )}
      </div>
    </Card>
  );
}
