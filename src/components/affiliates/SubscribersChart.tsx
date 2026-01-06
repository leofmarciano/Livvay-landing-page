'use client';

import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import { PLAN_LABELS, formatCurrency, PLAN_PRICES_CENTS } from '@/lib/constants/affiliate';

interface SubscribersData {
  plus: number;
  max: number;
}

interface SubscribersChartProps {
  data: SubscribersData;
  showValue?: boolean;
}

const COLORS = {
  plus: 'hsl(var(--brand-default))',
  max: 'hsl(var(--warning-default))',
};

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { name: string; value: number; plan: 'plus' | 'max' } }>;
}) {
  if (!active || !payload || !payload[0]) return null;

  const data = payload[0].payload;
  const monthlyValue = data.value * PLAN_PRICES_CENTS[data.plan];

  return (
    <div className="bg-surface-200 border border-border rounded-lg p-3 shadow-lg">
      <p className="text-sm font-medium text-foreground mb-1">{data.name}</p>
      <p className="text-lg font-semibold text-foreground">{data.value} assinantes</p>
      <p className="text-xs text-foreground-muted mt-1">
        {formatCurrency(monthlyValue)}/mês em receita
      </p>
    </div>
  );
}

function renderCustomLabel(props: {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
}) {
  const { cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, percent = 0 } = props;

  if (percent < 0.05) return null;

  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-sm font-medium"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export function SubscribersChart({ data, showValue = true }: SubscribersChartProps) {
  const chartData = [
    { name: PLAN_LABELS.plus, value: data.plus, plan: 'plus' as const },
    { name: PLAN_LABELS.max, value: data.max, plan: 'max' as const },
  ].filter((item) => item.value > 0);

  const total = data.plus + data.max;

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[250px] text-foreground-muted">
        <p>Nenhum assinante ainda</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="w-full h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={70}
              innerRadius={35}
              dataKey="value"
              paddingAngle={2}
              isAnimationActive={false}
            >
              {chartData.map((entry) => (
                <Cell key={entry.plan} fill={COLORS[entry.plan]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value: string) => (
                <span className="text-sm text-foreground-light">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {showValue && (
        <div className="text-center mt-2">
          <p className="text-2xl font-semibold text-foreground">{total}</p>
          <p className="text-xs text-foreground-muted">Total de assinantes</p>
        </div>
      )}
    </div>
  );
}
