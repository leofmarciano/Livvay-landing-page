'use client';

import { useState, useMemo, memo } from 'react';
import {
  Target,
  ChevronDown,
  ChevronUp,
  Plus,
  Pencil,
  CheckCircle,
  TrendingDown,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from './ProgressBar';
import { cn } from '@/lib/utils';
import type { MockObjetivo } from '@/lib/clinic/mock-patient-data';

interface ObjetivoCardProps {
  objetivo: MockObjetivo;
  onCriarObjetivo?: () => void;
  onEditarPesoAlvo?: () => void;
}

interface VariacaoItemProps {
  label: string;
  value: string;
  isPositive?: boolean;
}

const VariacaoItem = memo(function VariacaoItem({ label, value, isPositive }: VariacaoItemProps) {
  return (
    <div className="text-center">
      <p className="text-xs text-foreground-muted uppercase tracking-wide mb-1">
        {label}
      </p>
      <p
        className={cn(
          'text-lg font-semibold tabular-nums',
          isPositive ? 'text-success' : 'text-foreground'
        )}
      >
        {value}
        {isPositive && <span className="sr-only"> (positivo)</span>}
      </p>
    </div>
  );
});

export function ObjetivoCard({
  objetivo,
  onCriarObjetivo,
  onEditarPesoAlvo,
}: ObjetivoCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Memoized progress labels to avoid recalculation
  const progressLabels = useMemo(() => ({
    start: `${objetivo.pesoInicial}kg/0%`,
    middle: `${((objetivo.pesoInicial + objetivo.pesoAlvo) / 2).toFixed(1)}/5%`,
    end: `${objetivo.pesoAlvo}kg/7%`,
  }), [objetivo.pesoInicial, objetivo.pesoAlvo]);

  const contentId = 'objetivo-content';

  return (
    <Card hover={false}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-expanded={isExpanded}
          aria-controls={contentId}
          aria-label={isExpanded ? 'Recolher detalhes do objetivo' : 'Expandir detalhes do objetivo'}
          onClick={() => setIsExpanded(!isExpanded)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsExpanded(!isExpanded);
            }
          }}
          className={cn(
            'flex items-center gap-3 cursor-pointer',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 rounded-lg'
          )}
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-brand/10">
            <Target className="w-5 h-5 text-brand" aria-hidden="true" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Objetivo</h3>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-foreground-muted" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-5 h-5 text-foreground-muted" aria-hidden="true" />
          )}
        </button>
        <Button type="secondary" size="small" onClick={onCriarObjetivo}>
          <Plus className="w-4 h-4 mr-1" aria-hidden="true" />
          Criar objetivo novo
        </Button>
      </div>

      {/* Collapsible Content */}
      <div
        id={contentId}
        hidden={!isExpanded}
        aria-hidden={!isExpanded}
      >
        {isExpanded && (
          <div className="mt-6 space-y-6">
            {/* Objetivo Title Row */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-success" aria-hidden="true" />
                  <h4 className="text-base font-medium text-foreground">
                    {objetivo.titulo}
                  </h4>
                  <span className="sr-only">Objetivo de perda de peso</span>
                </div>
                <p className="text-sm text-foreground-muted mt-1">
                  Desde {objetivo.dataInicio}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground tabular-nums">{objetivo.dias}</p>
                <p className="text-xs text-foreground-muted">dias</p>
              </div>
            </div>

            {/* Variações Grid - Responsive */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 p-4 bg-surface-100 rounded-xl">
              <VariacaoItem
                label="Total (kg)"
                value={`${objetivo.variacoes.totalKg.toFixed(2)}kg`}
                isPositive
              />
              <VariacaoItem
                label="Total (%)"
                value={`${objetivo.variacoes.totalPercent.toFixed(2)}%`}
                isPositive
              />
              <VariacaoItem
                label="30d"
                value={`${objetivo.variacoes.dias30.toFixed(2)}kg`}
              />
              <VariacaoItem
                label="7d"
                value={`${objetivo.variacoes.dias7.toFixed(2)}kg`}
              />
              <div className="text-center">
                <p className="text-xs text-foreground-muted uppercase tracking-wide mb-1">
                  Peso alvo
                </p>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-lg font-semibold text-foreground tabular-nums">
                    {objetivo.pesoAlvo}kg
                  </span>
                  <button
                    type="button"
                    onClick={onEditarPesoAlvo}
                    aria-label="Editar peso alvo"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onEditarPesoAlvo?.();
                      }
                    }}
                    className={cn(
                      'p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center',
                      'hover:bg-surface-200 rounded transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2'
                    )}
                  >
                    <Pencil className="w-3.5 h-3.5 text-foreground-muted" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>

            {/* Evolução */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">Evolução</h4>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-4 h-4 text-success flex-shrink-0" aria-hidden="true" />
                <span className="text-sm text-foreground">
                  Perdeu{' '}
                  <span className="font-semibold text-success tabular-nums">
                    {objetivo.evolucao.perdeu.toFixed(2)} kg
                  </span>{' '}
                  <span className="tabular-nums">({objetivo.evolucao.percentual.toFixed(2)}%)</span>
                  <span className="sr-only">de peso</span>
                </span>
              </div>
              <ProgressBar
                current={objetivo.pesoAtual}
                target={objetivo.pesoAlvo}
                start={objetivo.pesoInicial}
                showLabels={true}
                labels={progressLabels}
                color="success"
                size="lg"
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
