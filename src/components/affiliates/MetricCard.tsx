'use client';

import { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export function MetricCard({
  title,
  value,
  description,
  icon,
  trend,
  variant = 'default',
}: MetricCardProps) {
  const cardBg = {
    default: 'bg-surface-100',
    success: 'bg-brand/10',
    warning: 'bg-warning/10',
    danger: 'bg-destructive/10',
  }[variant];

  const iconBg = {
    default: 'bg-surface-200 text-foreground-muted',
    success: 'bg-brand/20 text-brand',
    warning: 'bg-warning/20 text-warning',
    danger: 'bg-destructive/20 text-destructive',
  }[variant];

  const trendColor = !trend ? 'text-foreground-muted' :
    trend.value > 0 ? 'text-brand' :
    trend.value < 0 ? 'text-destructive' : 'text-foreground-muted';

  return (
    <div className={`rounded-xl p-5 border border-border ${cardBg}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground-light truncate">{title}</p>
          <p className="text-2xl font-semibold text-foreground mt-1">{value}</p>
          {description && (
            <p className="text-xs text-foreground-muted mt-1">{description}</p>
          )}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs ${trendColor}`}>
              {trend.value > 0 ? <TrendingUp className="w-3.5 h-3.5" /> :
               trend.value < 0 ? <TrendingDown className="w-3.5 h-3.5" /> :
               <Minus className="w-3.5 h-3.5" />}
              <span>{trend.value > 0 ? '+' : ''}{trend.value}% {trend.label}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className={`flex items-center justify-center w-10 h-10 rounded-lg shrink-0 ${iconBg}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

interface MetricsGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
}

export function MetricsGrid({ children, columns = 4 }: MetricsGridProps) {
  const cols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }[columns];

  return (
    <div className={`grid gap-4 ${cols}`}>
      {children}
    </div>
  );
}
