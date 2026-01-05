'use client';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';

interface FunnelData {
  visits: number;
  installs: number;
  subscriptions: number;
}

interface FunnelChartProps {
  data: FunnelData;
}

const COLORS = [
  'hsl(var(--foreground-muted))',
  'hsl(var(--warning-default))',
  'hsl(var(--brand-default))',
];

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
    <div className="bg-surface-200 border border-border rounded-lg p-3 shadow-lg">
      <p className="text-sm font-medium text-foreground mb-1">{data.name}</p>
      <p className="text-lg font-semibold text-foreground">{data.value.toLocaleString()}</p>
      {data.rate && (
        <p className="text-xs text-foreground-muted mt-1">{data.rate}</p>
      )}
    </div>
  );
};

export function FunnelChart({ data }: FunnelChartProps) {
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

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border-default))"
            horizontal={false}
          />
          <XAxis
            type="number"
            tick={{ fill: 'hsl(var(--foreground-muted))', fontSize: 12 }}
            axisLine={{ stroke: 'hsl(var(--border-default))' }}
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
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={30}>
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
