'use client';

import { ReactNode, isValidElement, cloneElement, forwardRef } from 'react';
import Link from 'next/link';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

/**
 * Button types following Supabase Design System
 * @see https://supabase-design-system.vercel.app/design-system/docs/components/button
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
  children?: ReactNode;
  /** Button type/variant following Supabase Design System */
  type?: ButtonType;
  /** Button size */
  size?: ButtonSize;
  /** If provided, renders as a link */
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
  /** Tab index - automatically handled based on disabled state */
  tabIndex?: number;
  /** Icon to display on the left side */
  icon?: ReactNode;
  /** Icon to display on the right side */
  iconRight?: ReactNode;
  /** Use Radix Slot for composition (asChild pattern) */
  asChild?: boolean;
}

/**
 * Type styles matching Supabase Design System exactly
 */
const typeStyles: Record<ButtonType, string> = {
  primary: cn(
    'bg-brand-600 text-white',
    'hover:bg-brand-500',
    'border border-brand-600 hover:border-brand-500'
  ),
  default: cn(
    'bg-surface-300 text-foreground',
    'hover:bg-surface-400',
    'border border-border-strong hover:border-border-stronger'
  ),
  secondary: cn(
    'bg-brand-600/10 text-brand',
    'hover:bg-brand-600/20',
    'border border-brand-600/30 hover:border-brand-600/50'
  ),
  outline: cn(
    'bg-transparent text-foreground',
    'hover:bg-surface-200',
    'border border-border hover:border-border-strong'
  ),
  ghost: cn(
    'bg-transparent text-foreground-light',
    'hover:bg-surface-200 hover:text-foreground',
    'border border-transparent'
  ),
  link: cn(
    'bg-transparent text-brand',
    'hover:text-brand-400',
    'underline-offset-4 hover:underline',
    'border-none'
  ),
  warning: cn(
    'bg-warning text-background',
    'hover:bg-warning/90',
    'border border-warning'
  ),
  destructive: cn(
    'bg-destructive text-white',
    'hover:bg-destructive/90',
    'border border-destructive'
  ),
};

/**
 * Size styles - padding and text size
 */
const sizeStyles: Record<ButtonSize, string> = {
  tiny: 'h-[26px] px-2.5 text-xs',
  small: 'h-[34px] px-3 text-sm',
  medium: 'h-[38px] px-4 text-sm',
  large: 'h-[42px] px-5 text-base',
  xlarge: 'h-[50px] px-6 text-base',
};

/**
 * Gap between icon and text based on size
 */
const gapStyles: Record<ButtonSize, string> = {
  tiny: 'gap-1',
  small: 'gap-1.5',
  medium: 'gap-2',
  large: 'gap-2',
  xlarge: 'gap-2.5',
};

/**
 * Icon sizes matching button size
 */
const iconSizeStyles: Record<ButtonSize, number> = {
  tiny: 14,
  small: 16,
  medium: 16,
  large: 18,
  xlarge: 20,
};

/**
 * Loading spinner component
 */
function LoadingSpinner({ size }: { size: ButtonSize }) {
  const iconSize = iconSizeStyles[size];
  return (
    <svg
      className="animate-spin"
      width={iconSize}
      height={iconSize}
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
}

/**
 * Render icon with proper size
 */
function renderIcon(iconElement: ReactNode, size: ButtonSize) {
  if (!iconElement) return null;

  const iconSize = iconSizeStyles[size];

  // Clone Lucide icons and set proper size
  if (isValidElement(iconElement)) {
    return cloneElement(
      iconElement as React.ReactElement<{
        size?: number;
        className?: string;
        'aria-hidden'?: boolean;
      }>,
      {
        size: iconSize,
        className: cn('shrink-0', (iconElement.props as { className?: string }).className),
        'aria-hidden': true,
      }
    );
  }

  return iconElement;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
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
    },
    ref
  ) {
    const isDisabled = disabled || loading;
    // Accessibility: tabIndex automatically based on disabled state
    const effectiveTabIndex = tabIndex ?? (isDisabled ? -1 : 0);
    const isLinkType = type === 'link';
    const hasOnlyIcon = icon && !children && !iconRight;

    const baseStyles = cn(
      // Layout
      'inline-flex items-center justify-center',
      // Shape
      !isLinkType && 'rounded-md',
      // Typography
      'font-medium leading-none',
      // Transitions
      'transition-colors duration-150',
      // Focus (accessibility)
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      // Disabled state
      'disabled:opacity-50 disabled:pointer-events-none',
      // Type-specific styles
      typeStyles[type],
      // Size styles (except for link type)
      !isLinkType && sizeStyles[size],
      // Gap between elements
      !isLinkType && gapStyles[size],
      // Icon-only button is square
      hasOnlyIcon && !isLinkType && 'aspect-square !px-0',
      className
    );

    const content = (
      <>
        {loading && <LoadingSpinner size={size} />}
        {!loading && renderIcon(icon, size)}
        {children}
        {!loading && renderIcon(iconRight, size)}
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
      // Check if it's an external link or special protocol
      const isExternalOrProtocol =
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('http://') ||
        href.startsWith('https://') ||
        href.startsWith('//');

      // Use native <a> for external links and special protocols
      if (isExternalOrProtocol) {
        const externalProps =
          href.startsWith('http') || href.startsWith('//')
            ? { target: '_blank' as const, rel: 'noopener noreferrer' }
            : {};

        return (
          <a
            href={href}
            className={baseStyles}
            tabIndex={effectiveTabIndex}
            onClick={onClick}
            {...externalProps}
          >
            {content}
          </a>
        );
      }

      // Use Next.js Link for internal navigation
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

    // Render as button
    return (
      <button
        ref={ref}
        className={baseStyles}
        disabled={isDisabled}
        type={htmlType}
        onClick={onClick}
        onKeyDown={onKeyDown}
        tabIndex={effectiveTabIndex}
      >
        {content}
      </button>
    );
  }
);

/**
 * Helper to get button variant classes for use with other components
 * Useful for styling links that look like buttons
 *
 * @example
 * <Link className={buttonVariants({ type: 'outline' })}>Click here</Link>
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
    !isLinkType && 'rounded-md',
    'font-medium leading-none',
    'transition-colors duration-150',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:opacity-50 disabled:pointer-events-none',
    typeStyles[type],
    !isLinkType && sizeStyles[size],
    !isLinkType && gapStyles[size],
    className
  );
}
