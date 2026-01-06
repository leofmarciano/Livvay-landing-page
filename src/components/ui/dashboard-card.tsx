'use client';

import { ReactNode } from 'react';

interface DashboardCardProps {
  children: ReactNode;
  title?: string;
  description?: string;
  action?: ReactNode;
  bordered?: boolean;
}

export function DashboardCard({
  children,
  title,
  description,
  action,
  bordered = true,
}: DashboardCardProps) {
  return (
    <div className={`rounded-xl bg-surface-100 overflow-hidden ${bordered ? 'border border-border' : ''}`}>
      {(title || action) && (
        <div className="flex items-center justify-between p-6 pb-0">
          <div>
            {title && (
              <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            )}
            {description && (
              <p className="text-sm text-foreground-light mt-1">{description}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={`p-6 ${title ? 'pt-4' : ''}`}>
        {children}
      </div>
    </div>
  );
}

interface DashboardCardHeaderProps {
  children: ReactNode;
}

export function DashboardCardHeader({ children }: DashboardCardHeaderProps) {
  return (
    <div className="p-6 border-b border-border">
      {children}
    </div>
  );
}

interface DashboardCardContentProps {
  children: ReactNode;
  noPadding?: boolean;
}

export function DashboardCardContent({ children, noPadding }: DashboardCardContentProps) {
  return (
    <div className={noPadding ? '' : 'p-6'}>
      {children}
    </div>
  );
}
