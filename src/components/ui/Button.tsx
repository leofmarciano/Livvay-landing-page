'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  className?: string;
  isLoading?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
}

const variants = {
  primary: 'bg-[#00E676] text-[#0A0A0B] hover:bg-[#00C853] font-semibold shadow-lg shadow-[#00E676]/20',
  secondary: 'bg-[#1A1A1D] text-white hover:bg-[#27272A] border border-[#27272A]',
  outline: 'bg-transparent text-[#00E676] border-2 border-[#00E676] hover:bg-[#00E676]/10',
  ghost: 'bg-transparent text-[#A1A1AA] hover:text-white hover:bg-[#1A1A1D]',
};

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  className = '',
  isLoading = false,
  disabled = false,
  type = 'button',
  onClick,
}: ButtonProps) {
  const baseStyles = `
    inline-flex items-center justify-center gap-2 
    rounded-full font-medium 
    transition-all duration-200 
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E676] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0B]
    disabled:opacity-50 disabled:cursor-not-allowed
    ${variants[variant]} 
    ${sizes[size]} 
    ${className}
  `;

  const content = (
    <>
      {isLoading && (
        <svg 
          className="animate-spin h-4 w-4" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={baseStyles}>
        {content}
      </Link>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={baseStyles}
      disabled={disabled || isLoading}
      type={type}
      onClick={onClick}
    >
      {content}
    </motion.button>
  );
}
