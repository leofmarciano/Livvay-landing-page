'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

/**
 * Button types following Supabase Design System
 * - primary: Data insertion actions, confirming purchases, strong positive actions
 * - default: Opening dialogs, navigating, non-CRUD actions (most used)
 * - secondary: Signaling data/config change, less serious than primary
 * - outline: Secondary actions, less important than primary
 * - ghost: Less important actions (text-only appearance)
 * - link: Link-style button
 * - warning: Actions with potential side effects
 * - destructive: Serious destructive actions like deleting data
 */
export type ButtonType =
  | 'primary'
  | 'default'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'link'
  | 'warning'
  | 'destructive';

export type ButtonSize = 'tiny' | 'small' | 'medium' | 'large' | 'xlarge';

interface ButtonProps {
  children: ReactNode;
  /** Button type/variant following Supabase Design System */
  type?: ButtonType;
  /** Button size */
  size?: ButtonSize;
  /** If provided, renders as Next.js Link */
  href?: string;
  /** Additional CSS classes */
  className?: string;
  /** Shows loading spinner and disables button */
  loading?: boolean;
  /** Disables the button */
  disabled?: boolean;
  /** HTML button type attribute */
  htmlType?: 'button' | 'submit' | 'reset';
  /** Click handler */
  onClick?: () => void;
  /** Keyboard handler */
  onKeyDown?: (e: React.KeyboardEvent) => void;
  /** Tab index */
  tabIndex?: number;
  /** Icon to display on the left side */
  icon?: ReactNode;
  /** Icon to display on the right side */
  iconRight?: ReactNode;
  /** Use Radix Slot for composition (asChild pattern) */
  asChild?: boolean;
}

const typeStyles: Record<ButtonType, string> = {
  primary:
    'bg-brand text-background hover:bg-brand-600 font-semibold shadow-lg shadow-brand/20',
  default:
    'bg-surface-200 text-foreground hover:bg-surface-300 border border-border font-medium',
  secondary:
    'bg-brand/10 text-brand hover:bg-brand/20 border border-brand/30 font-medium',
  outline:
    'bg-transparent text-foreground border border-border hover:bg-surface-100 hover:border-border-strong font-medium',
  ghost:
    'bg-transparent text-foreground-light hover:text-foreground hover:bg-surface-100 font-medium',
  link: 'bg-transparent text-brand hover:text-brand-600 underline-offset-4 hover:underline font-medium p-0',
  warning:
    'bg-warning text-background hover:bg-warning-600 font-semibold shadow-lg shadow-warning/20',
  destructive:
    'bg-destructive text-background hover:bg-destructive-600 font-semibold shadow-lg shadow-destructive/20',
};

const sizeStyles: Record<ButtonSize, string> = {
  tiny: 'px-2.5 py-1 text-xs gap-1',
  small: 'px-3 py-1.5 text-sm gap-1.5',
  medium: 'px-4 py-2 text-sm gap-2',
  large: 'px-6 py-3 text-base gap-2',
  xlarge: 'px-8 py-4 text-lg gap-2.5',
};

const iconSizes: Record<ButtonSize, string> = {
  tiny: 'w-3 h-3',
  small: 'w-3.5 h-3.5',
  medium: 'w-4 h-4',
  large: 'w-5 h-5',
  xlarge: 'w-5 h-5',
};

export function Button({
  children,
  type = 'primary',
  size = 'medium',
  href,
  className = '',
  loading = false,
  disabled = false,
  htmlType = 'button',
  onClick,
  onKeyDown,
  tabIndex,
  icon,
  iconRight,
  asChild = false,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const effectiveTabIndex = tabIndex ?? (isDisabled ? -1 : 0);

  // Link type has special sizing
  const isLinkType = type === 'link';

  const baseStyles = cn(
    'inline-flex items-center justify-center',
    !isLinkType && 'rounded-full',
    'transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    typeStyles[type],
    !isLinkType && sizeStyles[size],
    className
  );

  const LoadingSpinner = () => (
    <svg
      className={cn('animate-spin', iconSizes[size])}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
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
  );

  const content = (
    <>
      {loading && <LoadingSpinner />}
      {!loading && icon && (
        <span className={iconSizes[size]} aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
      {!loading && iconRight && (
        <span className={iconSizes[size]} aria-hidden="true">
          {iconRight}
        </span>
      )}
    </>
  );

  // asChild pattern using Radix Slot
  if (asChild) {
    return (
      <Slot className={baseStyles} tabIndex={effectiveTabIndex}>
        {children}
      </Slot>
    );
  }

  // Render as Link if href is provided
  if (href) {
    return (
      <Link
        href={href}
        className={baseStyles}
        tabIndex={effectiveTabIndex}
        onClick={onClick}
      >
        {content}
      </Link>
    );
  }

  // Render as button with motion
  return (
    <motion.button
      whileHover={!isDisabled ? { scale: 1.02 } : undefined}
      whileTap={!isDisabled ? { scale: 0.98 } : undefined}
      className={baseStyles}
      disabled={isDisabled}
      type={htmlType}
      onClick={onClick}
      onKeyDown={onKeyDown}
      tabIndex={effectiveTabIndex}
    >
      {content}
    </motion.button>
  );
}

/**
 * Helper to get button variant classes for use with other components
 * Useful for styling links that look like buttons
 */
export function buttonVariants({
  type = 'primary',
  size = 'medium',
  className = '',
}: {
  type?: ButtonType;
  size?: ButtonSize;
  className?: string;
} = {}) {
  const isLinkType = type === 'link';

  return cn(
    'inline-flex items-center justify-center',
    !isLinkType && 'rounded-full',
    'transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    typeStyles[type],
    !isLinkType && sizeStyles[size],
    className
  );
}
