'use client';

import { useState } from 'react';
import { Scale, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { WeightChart } from './WeightChart';
import { cn } from '@/lib/utils';
import type { MockMedida, MockWeightHistory } from '@/lib/clinic/mock-patient-data';

type MedidasTab = 'principal' | 'habit' | 'circunferencia';
type UnitToggle = 'kg' | 'percent';
type PeriodFilter = 'all' | '60' | '30' | '7';

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

function StatItem({ label, value, subValue, trend, color = 'default' }: StatItemProps) {
  const colorClasses = {
    brand: 'text-brand',
    warning: 'text-warning',
    default: 'text-foreground',
  };

  return (
    <div className="text-center">
      <p className="text-xs text-foreground-muted uppercase tracking-wide mb-1">
        {label}
      </p>
      <div className="flex items-center justify-center gap-1">
        {trend && (
          <span className={cn('w-4 h-4', trend === 'down' ? 'text-green-500' : trend === 'up' ? 'text-red-500' : 'text-foreground-muted')}>
            {trend === 'down' && <TrendingDown className="w-4 h-4" />}
            {trend === 'up' && <TrendingUp className="w-4 h-4" />}
            {trend === 'neutral' && <Minus className="w-4 h-4" />}
          </span>
        )}
        <span className={cn('text-2xl font-bold', colorClasses[color])}>{value}</span>
      </div>
      {subValue && (
        <p className="text-xs text-foreground-muted mt-0.5">{subValue}</p>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
        active
          ? 'bg-brand/10 text-brand'
          : 'text-foreground-muted hover:bg-surface-100'
      )}
    >
      {children}
    </button>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-2.5 py-1 text-xs font-medium rounded-full transition-colors',
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

  // Filter data by period
  const filteredData = historico.filter((item) => {
    if (period === 'all') return true;
    const days = parseInt(period);
    const itemDate = new Date(item.data);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return itemDate >= cutoff;
  });

  return (
    <Card hover={false} className="h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-brand/10">
            <Scale className="w-5 h-5 text-brand" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Medidas</h3>
            <p className="text-sm text-foreground-muted">
              Última pesagem: {ultimaMedida.data}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-surface-100 rounded-xl mb-6">
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

      {/* Sub-tabs */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto">
        <TabButton
          active={activeTab === 'principal'}
          onClick={() => setActiveTab('principal')}
        >
          Principal
        </TabButton>
        <TabButton
          active={activeTab === 'habit'}
          onClick={() => setActiveTab('habit')}
        >
          Habit tracker
        </TabButton>
        <TabButton
          active={activeTab === 'circunferencia'}
          onClick={() => setActiveTab('circunferencia')}
        >
          Circunferência
        </TabButton>
      </div>

      {/* Filters */}
      {activeTab === 'principal' && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-foreground">Medidas</h4>
            <div className="flex items-center gap-2">
              {/* Unit toggle */}
              <div className="flex items-center bg-surface-100 rounded-full p-0.5">
                <FilterPill active={unit === 'kg'} onClick={() => setUnit('kg')}>
                  kg
                </FilterPill>
                <FilterPill active={unit === 'percent'} onClick={() => setUnit('percent')}>
                  %
                </FilterPill>
              </div>

              {/* Period filter */}
              <div className="flex items-center gap-1">
                <FilterPill active={period === 'all'} onClick={() => setPeriod('all')}>
                  Todo período
                </FilterPill>
                <FilterPill active={period === '60'} onClick={() => setPeriod('60')}>
                  60d
                </FilterPill>
                <FilterPill active={period === '30'} onClick={() => setPeriod('30')}>
                  30d
                </FilterPill>
                <FilterPill active={period === '7'} onClick={() => setPeriod('7')}>
                  7d
                </FilterPill>
              </div>
            </div>
          </div>

          {/* Chart */}
          <WeightChart data={filteredData} showMusculo={true} />
        </>
      )}

      {activeTab === 'habit' && (
        <div className="flex items-center justify-center py-12 text-foreground-muted">
          <p className="text-sm">Habit tracker em breve</p>
        </div>
      )}

      {activeTab === 'circunferencia' && (
        <div className="flex items-center justify-center py-12 text-foreground-muted">
          <p className="text-sm">Medidas de circunferência em breve</p>
        </div>
      )}
    </Card>
  );
}
