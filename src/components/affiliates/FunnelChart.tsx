'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { cn } from '@/lib/utils';

interface FunnelData {
  visits: number;
  installs: number;
  subscriptions: number;
}

interface FunnelChartProps {
  data: FunnelData;
  className?: string;
}

const COLORS = [
  'hsl(var(--foreground-muted))',
  'hsl(var(--warning-default))',
  'hsl(var(--brand-default))',
];

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
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { name: string; value: number; rate: string } }>;
}) => {
  if (!active || !payload || !payload[0]) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-surface-200 border border-solid border-border rounded-lg p-3 shadow-lg">
      <p className="text-sm font-medium text-foreground mb-1">{data.name}</p>
      <p className="text-lg font-semibold text-foreground">{data.value.toLocaleString()}</p>
      {data.rate && (
        <p className="text-xs text-foreground-muted mt-1">{data.rate}</p>
      )}
    </div>
  );
};

export function FunnelChart({ data, className }: FunnelChartProps) {
  const chartData = [
    {
      name: 'Visitas',
      value: data.visits,
      rate: '',
    },
    {
      name: 'Installs',
      value: data.installs,
      rate: data.visits > 0
        ? `${((data.installs / data.visits) * 100).toFixed(1)}% das visitas`
        : '',
    },
    {
      name: 'Assinaturas',
      value: data.subscriptions,
      rate: data.installs > 0
        ? `${((data.subscriptions / data.installs) * 100).toFixed(1)}% dos installs`
        : '',
    },
  ];

  const { ref, width, height } = useContainerSize();
  const ready = width >= 200 && height >= 180;

  return (
    <div
      ref={ref}
      className={cn(
        'relative h-[250px] w-full min-w-0 overflow-hidden',
        '[&_svg]:border-0 [&_path]:border-0 [&_.recharts-wrapper]:border-0',
        className
      )}
    >
      {ready ? (
        <BarChart
          width={width}
          height={height}
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
        >
          <XAxis
            type="number"
            tick={{ fill: 'hsl(var(--foreground-muted))', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: 'hsl(var(--foreground-light))', fontSize: 13 }}
            axisLine={false}
            tickLine={false}
            width={75}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--surface-200))' }} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={30} isAnimationActive={false}>
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Bar>
        </BarChart>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-foreground-muted">
          Carregando gráfico...
        </div>
      )}
    </div>
  );
}
