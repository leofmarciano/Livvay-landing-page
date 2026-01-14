'use client';

import { useMemo, memo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Scale } from 'lucide-react';
import type { MockWeightHistory } from '@/lib/clinic/mock-patient-data';

// Static constants moved outside component
const CHART_COLORS = {
  peso: 'hsl(var(--brand-default))',
  musculo: 'hsl(var(--warning-default))',
  grid: 'hsl(var(--border-default))',
  text: 'hsl(var(--foreground-muted))',
} as const;

const PESO_DOT_CONFIG = { fill: CHART_COLORS.peso, strokeWidth: 0, r: 3 };
const MUSCULO_DOT_CONFIG = { fill: CHART_COLORS.musculo, strokeWidth: 0, r: 3 };
const ACTIVE_DOT_CONFIG = { r: 5, strokeWidth: 0 };

interface WeightChartProps {
  data: MockWeightHistory[];
  showMusculo?: boolean;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

const ChartTooltip = memo(function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload) return null;

  return (
    <div
      className="bg-surface-200 border border-border rounded-lg p-3 shadow-layered"
      role="tooltip"
    >
      <p className="text-sm font-medium text-foreground mb-2 tabular-nums">
        {label ? formatDate(label) : ''}
      </p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
            aria-hidden="true"
          />
          <span className="text-foreground-light">{entry.name}:</span>
          <span className="font-medium text-foreground tabular-nums">
            {entry.value.toFixed(1)} kg
          </span>
        </div>
      ))}
    </div>
  );
});

export function WeightChart({ data, showMusculo = true }: WeightChartProps) {
  // Memoized valid data
  const validData = useMemo(
    () =>
      data?.filter(
        (d) => d.data && typeof d.peso === 'number' && !isNaN(d.peso)
      ) || [],
    [data]
  );

  // Memoized domain calculations with single-pass algorithm
  const { pesoMin, pesoMax, musculoMin, musculoMax } = useMemo(() => {
    if (validData.length === 0) {
      return { pesoMin: 0, pesoMax: 100, musculoMin: 0, musculoMax: 100 };
    }

    let pMin = Infinity;
    let pMax = -Infinity;
    let mMin = Infinity;
    let mMax = -Infinity;

    for (const d of validData) {
      if (d.peso < pMin) pMin = d.peso;
      if (d.peso > pMax) pMax = d.peso;
      if (d.musculo < mMin) mMin = d.musculo;
      if (d.musculo > mMax) mMax = d.musculo;
    }

    return {
      pesoMin: Math.floor(pMin - 2),
      pesoMax: Math.ceil(pMax + 2),
      musculoMin: Math.floor(mMin - 2),
      musculoMax: Math.ceil(mMax + 2),
    };
  }, [validData]);

  if (validData.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center h-[280px] text-foreground-muted"
        role="img"
        aria-label="Sem dados de medidas disponíveis"
      >
        <Scale className="w-8 h-8 mb-3" aria-hidden="true" />
        <p className="text-sm font-medium text-foreground mb-1">
          Nenhuma medida registrada
        </p>
        <p className="text-xs">Registre a primeira medida do paciente</p>
      </div>
    );
  }

  return (
    <div
      className="w-full h-[280px]"
      role="img"
      aria-label={`Gráfico de peso mostrando ${validData.length} medições`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={validData}
          margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={CHART_COLORS.grid}
            opacity={0.5}
          />
          <XAxis
            dataKey="data"
            tickFormatter={formatDate}
            tick={{ fill: CHART_COLORS.text, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            yAxisId="peso"
            domain={[pesoMin, pesoMax]}
            tickFormatter={(value) => `${value}`}
            tick={{ fill: CHART_COLORS.peso, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            label={{
              value: 'Peso (kg)',
              angle: -90,
              position: 'insideLeft',
              fill: CHART_COLORS.text,
              fontSize: 10,
            }}
          />
          {showMusculo && (
            <YAxis
              yAxisId="musculo"
              orientation="right"
              domain={[musculoMin, musculoMax]}
              tickFormatter={(value) => `${value}`}
              tick={{ fill: CHART_COLORS.musculo, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              label={{
                value: 'Músculo (kg)',
                angle: 90,
                position: 'insideRight',
                fill: CHART_COLORS.text,
                fontSize: 10,
              }}
            />
          )}
          <Tooltip content={<ChartTooltip />} cursor={false} />
          <Line
            yAxisId="peso"
            type="monotone"
            dataKey="peso"
            name="Peso"
            stroke={CHART_COLORS.peso}
            strokeWidth={2}
            dot={PESO_DOT_CONFIG}
            activeDot={ACTIVE_DOT_CONFIG}
            isAnimationActive={false}
          />
          {showMusculo && (
            <Line
              yAxisId="musculo"
              type="monotone"
              dataKey="musculo"
              name="Músculo"
              stroke={CHART_COLORS.musculo}
              strokeWidth={2}
              dot={MUSCULO_DOT_CONFIG}
              activeDot={ACTIVE_DOT_CONFIG}
              isAnimationActive={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
