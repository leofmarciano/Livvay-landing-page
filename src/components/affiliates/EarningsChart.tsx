'use client';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
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
          <span className="font-medium text-foreground">
            {entry.name === 'Ganhos' ? formatCurrency(entry.value) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function EarningsChart({ data, showSubscriptions = true }: EarningsChartProps) {
  const validData = data?.filter(
    (d) => d.date && typeof d.earnings_cents === 'number' && !isNaN(d.earnings_cents)
  ) || [];

  if (validData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-foreground-muted">
        Sem dados para o período selecionado
      </div>
    );
  }

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={validData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
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
          <Tooltip content={<ChartTooltip />} cursor={false} />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="earnings_cents"
            name="Ganhos"
            stroke="hsl(var(--brand-default))"
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--brand-default))', strokeWidth: 0, r: 3 }}
            activeDot={{ r: 5, strokeWidth: 0 }}
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
              isAnimationActive={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
