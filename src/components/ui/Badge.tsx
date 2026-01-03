'use client';

import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'info' | 'premium';
  className?: string;
}

const badgeVariants = {
  default: 'bg-surface-200 text-foreground-light',
  success: 'bg-success-200 text-success',
  warning: 'bg-warning-200 text-warning',
  info: 'bg-brand-200 text-brand-600',
  premium: 'bg-brand/20 text-brand',
};

export function Badge({ 
  children, 
  variant = 'default',
  className = '' 
}: BadgeProps) {
  return (
    <span 
      className={`
        inline-flex items-center px-3 py-1 
        rounded-full text-xs font-medium
        ${badgeVariants[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
