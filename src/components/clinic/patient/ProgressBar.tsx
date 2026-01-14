'use client';

import { cn } from '@/lib/utils';

// Static constants moved outside component
const COLOR_CLASSES = {
  brand: 'bg-brand',
  success: 'bg-success',
  warning: 'bg-warning',
} as const;

const SIZE_CLASSES = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
} as const;

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

  return (
    <div className="w-full" role="progressbar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}>
      {/* Progress bar */}
      <div
        className={cn(
          'w-full rounded-full bg-surface-200 overflow-hidden',
          SIZE_CLASSES[size]
        )}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 motion-reduce:transition-none',
            COLOR_CLASSES[color]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Labels */}
      {showLabels && labels && (
        <div className="flex justify-between mt-2 text-xs text-foreground-muted tabular-nums">
          <span>{labels.start}</span>
          <span>{labels.middle}</span>
          <span>{labels.end}</span>
        </div>
      )}
    </div>
  );
}
