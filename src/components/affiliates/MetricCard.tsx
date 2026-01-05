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

const variantStyles = {
  default: 'bg-surface-100',
  success: 'bg-brand/10 border-brand/20',
  warning: 'bg-warning/10 border-warning/20',
  danger: 'bg-destructive/10 border-destructive/20',
};

const iconVariantStyles = {
  default: 'bg-surface-200 text-foreground-muted',
  success: 'bg-brand/20 text-brand',
  warning: 'bg-warning/20 text-warning',
  danger: 'bg-destructive/20 text-destructive',
};

export function MetricCard({
  title,
  value,
  description,
  icon,
  trend,
  variant = 'default',
}: MetricCardProps) {
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value > 0) return <TrendingUp className="w-3.5 h-3.5" />;
    if (trend.value < 0) return <TrendingDown className="w-3.5 h-3.5" />;
    return <Minus className="w-3.5 h-3.5" />;
  };

  const getTrendColor = () => {
    if (!trend) return '';
    if (trend.value > 0) return 'text-brand';
    if (trend.value < 0) return 'text-destructive';
    return 'text-foreground-muted';
  };

  return (
    <div
      className={`rounded-xl border border-solid border-border p-5 ${variantStyles[variant]}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground-light truncate">
            {title}
          </p>
          <p className="text-2xl font-semibold text-foreground mt-1">{value}</p>
          {description && (
            <p className="text-xs text-foreground-muted mt-1">{description}</p>
          )}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs ${getTrendColor()}`}>
              {getTrendIcon()}
              <span>
                {trend.value > 0 ? '+' : ''}
                {trend.value}% {trend.label}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-lg ${iconVariantStyles[variant]}`}
          >
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
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return <div className={`grid ${gridCols[columns]} gap-4`}>{children}</div>;
}
