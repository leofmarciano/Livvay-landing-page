'use client';

import * as React from 'react';
import * as NavigationMenuPrimitive from '@radix-ui/react-navigation-menu';
import { cva } from 'class-variance-authority';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Shared styles for navigation menu triggers and link-like items.
 */
export const navigationMenuTriggerStyle = cva(
  [
    'inline-flex h-9 w-max items-center justify-center rounded-md px-3 py-2 text-sm font-medium',
    'text-foreground transition-colors',
    'hover:bg-surface-100/60 hover:text-foreground',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'data-[active]:bg-surface-100/60 data-[state=open]:bg-surface-100/60',
    'disabled:pointer-events-none disabled:opacity-50',
  ].join(' ')
);

/**
 * Root navigation menu container for Radix NavigationMenu.
 */
export const NavigationMenu = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Root
    ref={ref}
    className={cn('relative z-10 flex max-w-max flex-1 items-center justify-center', className)}
    {...props}
  >
    {children}
    <NavigationMenuViewport />
  </NavigationMenuPrimitive.Root>
));
NavigationMenu.displayName = NavigationMenuPrimitive.Root.displayName;

/**
 * Navigation menu list wrapper for grouping items.
 */
export const NavigationMenuList = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.List
    ref={ref}
    className={cn('group flex flex-1 list-none items-center justify-center gap-2', className)}
    {...props}
  />
));
NavigationMenuList.displayName = NavigationMenuPrimitive.List.displayName;

/**
 * Navigation menu item wrapper.
 */
export const NavigationMenuItem = NavigationMenuPrimitive.Item;

/**
 * Navigation menu trigger for opening content panels.
 */
export const NavigationMenuTrigger = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Trigger
    ref={ref}
    className={cn(navigationMenuTriggerStyle(), 'group gap-1', className)}
    tabIndex={0}
    {...props}
  >
    {children}
    <ChevronDown
      className="relative top-[1px] ml-1 h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180"
      aria-hidden="true"
    />
  </NavigationMenuPrimitive.Trigger>
));
NavigationMenuTrigger.displayName = NavigationMenuPrimitive.Trigger.displayName;

/**
 * Navigation menu content panel.
 */
export const NavigationMenuContent = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Content
    ref={ref}
    className={cn(
      [
        'absolute left-0 top-0 w-full data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out',
        'data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out',
        'data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52',
        'data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52',
        'md:w-auto',
      ].join(' '),
      className
    )}
    {...props}
  />
));
NavigationMenuContent.displayName = NavigationMenuPrimitive.Content.displayName;

/**
 * Navigation menu link wrapper.
 */
export const NavigationMenuLink = NavigationMenuPrimitive.Link;

/**
 * Navigation menu viewport container.
 */
export const NavigationMenuViewport = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <div className={cn('absolute left-0 top-full flex justify-center')}>
    <NavigationMenuPrimitive.Viewport
      ref={ref}
      className={cn(
        [
          'origin-top-center relative mt-3 h-[var(--radix-navigation-menu-viewport-height)]',
          'w-full overflow-hidden rounded-lg border border-border bg-surface-100 text-foreground shadow-lg',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90',
          'md:w-[var(--radix-navigation-menu-viewport-width)]',
        ].join(' '),
        className
      )}
      {...props}
    />
  </div>
));
NavigationMenuViewport.displayName = NavigationMenuPrimitive.Viewport.displayName;

/**
 * Navigation menu indicator arrow.
 */
export const NavigationMenuIndicator = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Indicator>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Indicator>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Indicator
    ref={ref}
    className={cn(
      [
        'top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden',
        'data-[state=visible]:animate-in data-[state=hidden]:animate-out',
        'data-[state=hidden]:fade-out data-[state=visible]:fade-in',
      ].join(' '),
      className
    )}
    {...props}
  >
    <div className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm border border-border bg-surface-100" />
  </NavigationMenuPrimitive.Indicator>
));
NavigationMenuIndicator.displayName = NavigationMenuPrimitive.Indicator.displayName;
