'use client';

import { useState, useMemo, memo } from 'react';
import { Scale, TrendingDown, TrendingUp, Minus, Activity, Ruler } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { WeightChart } from './WeightChart';
import { cn } from '@/lib/utils';
import type { MockMedida, MockWeightHistory } from '@/lib/clinic/mock-patient-data';

type MedidasTab = 'principal' | 'habit' | 'circunferencia';
type UnitToggle = 'kg' | 'percent';
type PeriodFilter = 'all' | '60' | '30' | '7';

// Static constants moved outside component to avoid re-creation
const COLOR_CLASSES = {
  brand: 'text-brand',
  warning: 'text-warning',
  default: 'text-foreground',
} as const;

const TREND_LABELS = {
  down: 'Diminuindo',
  up: 'Aumentando',
  neutral: 'Estável',
} as const;

interface MedidasCardProps {
  ultimaMedida: MockMedida;
  historico: MockWeightHistory[];
}

interface StatItemProps {
  label: string;
  value: string;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'brand' | 'warning' | 'default';
}

const StatItem = memo(function StatItem({
  label,
  value,
  subValue,
  trend,
  color = 'default'
}: StatItemProps) {
  return (
    <div className="text-center">
      <p className="text-xs text-foreground-muted uppercase tracking-wide mb-1">
        {label}
      </p>
      <div className="flex items-center justify-center gap-1">
        {trend && (
          <span
            className={cn(
              'w-4 h-4',
              trend === 'down' ? 'text-success' : trend === 'up' ? 'text-destructive' : 'text-foreground-muted'
            )}
          >
            {trend === 'down' && <TrendingDown className="w-4 h-4" aria-hidden="true" />}
            {trend === 'up' && <TrendingUp className="w-4 h-4" aria-hidden="true" />}
            {trend === 'neutral' && <Minus className="w-4 h-4" aria-hidden="true" />}
            <span className="sr-only">{TREND_LABELS[trend]}</span>
          </span>
        )}
        <span className={cn('text-2xl font-bold tabular-nums', COLOR_CLASSES[color])}>
          {value}
        </span>
      </div>
      {subValue && (
        <p className="text-xs text-foreground-muted mt-0.5 tabular-nums">{subValue}</p>
      )}
    </div>
  );
});

interface TabButtonProps {
  id: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  controls: string;
}

function TabButton({ id, active, onClick, children, controls }: TabButtonProps) {
  return (
    <button
      id={id}
      role="tab"
      aria-selected={active}
      aria-controls={controls}
      tabIndex={active ? 0 : -1}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn(
        'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
        active
          ? 'bg-brand/10 text-brand'
          : 'text-foreground-muted hover:bg-surface-100'
      )}
    >
      {children}
    </button>
  );
}

interface FilterPillProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  role?: 'radio' | 'button';
  name?: string;
}

function FilterPill({ active, onClick, children, role = 'button', name }: FilterPillProps) {
  return (
    <button
      role={role}
      aria-checked={role === 'radio' ? active : undefined}
      aria-pressed={role === 'button' ? active : undefined}
      name={name}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn(
        'px-2.5 py-1 text-xs font-medium rounded-full transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
        active
          ? 'bg-foreground text-background'
          : 'bg-surface-100 text-foreground-muted hover:bg-surface-200'
      )}
    >
      {children}
    </button>
  );
}

export function MedidasCard({ ultimaMedida, historico }: MedidasCardProps) {
  const [activeTab, setActiveTab] = useState<MedidasTab>('principal');
  const [unit, setUnit] = useState<UnitToggle>('kg');
  const [period, setPeriod] = useState<PeriodFilter>('all');

  // Memoized filtered data to avoid recalculation on every render
  const filteredData = useMemo(() => {
    if (period === 'all') return historico;
    const days = parseInt(period);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return historico.filter((item) => new Date(item.data) >= cutoff);
  }, [historico, period]);

  return (
    <Card hover={false} className="h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-brand/10">
            <Scale className="w-5 h-5 text-brand" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Medidas</h3>
            <p className="text-sm text-foreground-muted">
              Última pesagem: <span className="tabular-nums">{ultimaMedida.data}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Stats Row - Responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-surface-100 rounded-xl mb-6">
        <StatItem
          label="Peso"
          value={`${ultimaMedida.peso}kg`}
          color="brand"
        />
        <StatItem
          label="Gordura"
          value={unit === 'kg' ? `${ultimaMedida.gordura}kg` : `${ultimaMedida.gorduraPercent}%`}
          subValue={unit === 'kg' ? `${ultimaMedida.gorduraPercent}%` : `${ultimaMedida.gordura}kg`}
        />
        <StatItem
          label="Músculo"
          value={unit === 'kg' ? `${ultimaMedida.musculo}kg` : `${ultimaMedida.musculoPercent}%`}
          subValue={unit === 'kg' ? `${ultimaMedida.musculoPercent}%` : `${ultimaMedida.musculo}kg`}
          color="warning"
        />
      </div>

      {/* Sub-tabs with proper ARIA */}
      <div
        role="tablist"
        aria-label="Visualização de medidas"
        className="flex items-center gap-2 mb-4 overflow-x-auto"
      >
        <TabButton
          id="tab-principal"
          active={activeTab === 'principal'}
          onClick={() => setActiveTab('principal')}
          controls="tabpanel-principal"
        >
          Principal
        </TabButton>
        <TabButton
          id="tab-habit"
          active={activeTab === 'habit'}
          onClick={() => setActiveTab('habit')}
          controls="tabpanel-habit"
        >
          Habit tracker
        </TabButton>
        <TabButton
          id="tab-circunferencia"
          active={activeTab === 'circunferencia'}
          onClick={() => setActiveTab('circunferencia')}
          controls="tabpanel-circunferencia"
        >
          Circunferência
        </TabButton>
      </div>

      {/* Tab Panels */}
      <div
        id="tabpanel-principal"
        role="tabpanel"
        aria-labelledby="tab-principal"
        hidden={activeTab !== 'principal'}
      >
        {activeTab === 'principal' && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h4 className="text-sm font-medium text-foreground">Medidas</h4>
              <div className="flex flex-wrap items-center gap-2">
                {/* Unit toggle - Radio group */}
                <div
                  role="radiogroup"
                  aria-label="Unidade de medida"
                  className="flex items-center bg-surface-100 rounded-full p-0.5"
                >
                  <FilterPill
                    role="radio"
                    name="unit"
                    active={unit === 'kg'}
                    onClick={() => setUnit('kg')}
                  >
                    kg
                  </FilterPill>
                  <FilterPill
                    role="radio"
                    name="unit"
                    active={unit === 'percent'}
                    onClick={() => setUnit('percent')}
                  >
                    %
                  </FilterPill>
                </div>

                {/* Period filter - Radio group */}
                <div
                  role="radiogroup"
                  aria-label="Filtrar por período"
                  className="flex items-center gap-1"
                >
                  <FilterPill
                    role="radio"
                    name="period"
                    active={period === 'all'}
                    onClick={() => setPeriod('all')}
                  >
                    Todo período
                  </FilterPill>
                  <FilterPill
                    role="radio"
                    name="period"
                    active={period === '60'}
                    onClick={() => setPeriod('60')}
                  >
                    60d
                  </FilterPill>
                  <FilterPill
                    role="radio"
                    name="period"
                    active={period === '30'}
                    onClick={() => setPeriod('30')}
                  >
                    30d
                  </FilterPill>
                  <FilterPill
                    role="radio"
                    name="period"
                    active={period === '7'}
                    onClick={() => setPeriod('7')}
                  >
                    7d
                  </FilterPill>
                </div>
              </div>
            </div>

            {/* Chart */}
            <WeightChart data={filteredData} showMusculo={true} />
          </>
        )}
      </div>

      <div
        id="tabpanel-habit"
        role="tabpanel"
        aria-labelledby="tab-habit"
        hidden={activeTab !== 'habit'}
      >
        {activeTab === 'habit' && (
          <div className="flex flex-col items-center justify-center py-12 text-foreground-muted">
            <Activity className="w-8 h-8 mb-3" aria-hidden="true" />
            <p className="text-sm font-medium text-foreground mb-1">Habit tracker</p>
            <p className="text-xs">Em desenvolvimento...</p>
          </div>
        )}
      </div>

      <div
        id="tabpanel-circunferencia"
        role="tabpanel"
        aria-labelledby="tab-circunferencia"
        hidden={activeTab !== 'circunferencia'}
      >
        {activeTab === 'circunferencia' && (
          <div className="flex flex-col items-center justify-center py-12 text-foreground-muted">
            <Ruler className="w-8 h-8 mb-3" aria-hidden="true" />
            <p className="text-sm font-medium text-foreground mb-1">Medidas de circunferência</p>
            <p className="text-xs">Em desenvolvimento...</p>
          </div>
        )}
      </div>
    </Card>
  );
}
