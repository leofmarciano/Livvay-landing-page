'use client';

import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'info' | 'premium';
  className?: string;
}

const badgeVariants = {
  default: 'bg-[#27272A] text-[#A1A1AA]',
  success: 'bg-[#22C55E]/20 text-[#22C55E]',
  warning: 'bg-[#EAB308]/20 text-[#EAB308]',
  info: 'bg-[#3B82F6]/20 text-[#3B82F6]',
  premium: 'bg-[#00E676]/20 text-[#00E676]',
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

