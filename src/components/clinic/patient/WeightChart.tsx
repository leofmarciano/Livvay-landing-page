'use client';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { MockWeightHistory } from '@/lib/clinic/mock-patient-data';

interface WeightChartProps {
  data: MockWeightHistory[];
  showMusculo?: boolean;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function ChartTooltip({
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
    <div className="bg-surface-200 border border-border rounded-lg p-3 shadow-lg">
      <p className="text-sm font-medium text-foreground mb-2">
        {label ? formatDate(label) : ''}
      </p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-foreground-light">{entry.name}:</span>
          <span className="font-medium text-foreground">{entry.value.toFixed(1)} kg</span>
        </div>
      ))}
    </div>
  );
}

export function WeightChart({ data, showMusculo = true }: WeightChartProps) {
  const validData =
    data?.filter(
      (d) => d.data && typeof d.peso === 'number' && !isNaN(d.peso)
    ) || [];

  if (validData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[280px] text-foreground-muted">
        Sem dados de medidas
      </div>
    );
  }

  // Calculate Y-axis domains with padding
  const pesoValues = validData.map((d) => d.peso);
  const pesoMin = Math.floor(Math.min(...pesoValues) - 2);
  const pesoMax = Math.ceil(Math.max(...pesoValues) + 2);

  const musculoValues = validData.map((d) => d.musculo);
  const musculoMin = Math.floor(Math.min(...musculoValues) - 2);
  const musculoMax = Math.ceil(Math.max(...musculoValues) + 2);

  return (
    <div className="w-full h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={validData}
          margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border-default))"
            opacity={0.5}
          />
          <XAxis
            dataKey="data"
            tickFormatter={formatDate}
            tick={{ fill: 'hsl(var(--foreground-muted))', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            yAxisId="peso"
            domain={[pesoMin, pesoMax]}
            tickFormatter={(value) => `${value}`}
            tick={{ fill: 'hsl(var(--brand-default))', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            label={{
              value: 'Peso (kg)',
              angle: -90,
              position: 'insideLeft',
              fill: 'hsl(var(--foreground-muted))',
              fontSize: 10,
            }}
          />
          {showMusculo && (
            <YAxis
              yAxisId="musculo"
              orientation="right"
              domain={[musculoMin, musculoMax]}
              tickFormatter={(value) => `${value}`}
              tick={{ fill: 'hsl(var(--warning-default))', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              label={{
                value: 'Músculo (kg)',
                angle: 90,
                position: 'insideRight',
                fill: 'hsl(var(--foreground-muted))',
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
            stroke="hsl(var(--brand-default))"
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--brand-default))', strokeWidth: 0, r: 3 }}
            activeDot={{ r: 5, strokeWidth: 0 }}
            isAnimationActive={false}
          />
          {showMusculo && (
            <Line
              yAxisId="musculo"
              type="monotone"
              dataKey="musculo"
              name="Músculo"
              stroke="hsl(var(--warning-default))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--warning-default))', strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
              isAnimationActive={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
