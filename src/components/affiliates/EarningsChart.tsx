'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { formatCurrency } from '@/lib/constants/affiliate';

interface EarningsDataPoint {
  date: string;
  earnings_cents: number;
  subscriptions?: number;
}

interface EarningsChartProps {
  data: EarningsDataPoint[];
  showSubscriptions?: boolean;
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
};

const useContainerSize = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      setSize({ width, height });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, ...size };
};

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) => {
  if (!active || !payload) return null;

  return (
    <div className="bg-surface-200 border border-border rounded-lg p-3 shadow-lg">
      <p className="text-sm font-medium text-foreground mb-2">
        {label ? formatDate(label) : ''}
      </p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-foreground-light">{entry.name}:</span>
          <span className="font-medium text-foreground">
            {entry.name === 'Ganhos'
              ? formatCurrency(entry.value)
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export function EarningsChart({ data, showSubscriptions = true }: EarningsChartProps) {
  // Filter out invalid data points
  const validData = data?.filter(
    (d) => d.date && typeof d.earnings_cents === 'number' && !isNaN(d.earnings_cents)
  ) || [];

  const { ref, width, height } = useContainerSize();
  const ready = width >= 240 && height >= 220;

  if (validData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-foreground-muted">
        Sem dados para o período selecionado
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="relative h-[300px] w-full min-w-0 overflow-hidden bg-surface-100 rounded-lg"
    >
      {ready ? (
        <LineChart
          width={width}
          height={height}
          data={validData}
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fill: 'hsl(var(--foreground-muted))', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="left"
            tickFormatter={(value) => `$${(value / 100).toFixed(0)}`}
            tick={{ fill: 'hsl(var(--foreground-muted))', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          {showSubscriptions && (
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: 'hsl(var(--foreground-muted))', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
          )}
          <Tooltip content={<CustomTooltip />} cursor={false} />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="earnings_cents"
            name="Ganhos"
            stroke="hsl(var(--brand-default))"
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--brand-default))', strokeWidth: 0, r: 3 }}
            activeDot={{ r: 5, strokeWidth: 0 }}
            connectNulls={false}
            isAnimationActive={false}
          />
          {showSubscriptions && (
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="subscriptions"
              name="Assinaturas"
              stroke="hsl(var(--warning-default))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--warning-default))', strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
              connectNulls={false}
              isAnimationActive={false}
            />
          )}
        </LineChart>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-foreground-muted">
          Carregando gráfico...
        </div>
      )}
    </div>
  );
}
