'use client';

import { cn } from '@/lib/utils';

interface ProgressBarProps {
  /** Current value */
  current: number;
  /** Target/goal value */
  target: number;
  /** Starting value */
  start: number;
  /** Show labels below the bar */
  showLabels?: boolean;
  /** Custom labels for start, middle, and end */
  labels?: {
    start: string;
    middle: string;
    end: string;
  };
  /** Color variant */
  color?: 'brand' | 'success' | 'warning';
  /** Height of the bar */
  size?: 'sm' | 'md' | 'lg';
}

export function ProgressBar({
  current,
  target,
  start,
  showLabels = true,
  labels,
  color = 'brand',
  size = 'md',
}: ProgressBarProps) {
  // Calculate progress percentage
  const totalRange = Math.abs(start - target);
  const currentProgress = Math.abs(start - current);
  const percentage = Math.min(100, Math.max(0, (currentProgress / totalRange) * 100));

  const colorClasses = {
    brand: 'bg-brand',
    success: 'bg-green-500',
    warning: 'bg-warning',
  };

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className="w-full">
      {/* Progress bar */}
      <div
        className={cn(
          'w-full rounded-full bg-surface-200 overflow-hidden',
          sizeClasses[size]
        )}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            colorClasses[color]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Labels */}
      {showLabels && labels && (
        <div className="flex justify-between mt-2 text-xs text-foreground-muted">
          <span>{labels.start}</span>
          <span>{labels.middle}</span>
          <span>{labels.end}</span>
        </div>
      )}
    </div>
  );
}
