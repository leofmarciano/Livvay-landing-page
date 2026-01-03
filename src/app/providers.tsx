'use client';

import { HeroUIProvider } from '@heroui/react';

/**
 * Application providers wrapper.
 * Wraps the app with HeroUIProvider for HeroUI components.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return <HeroUIProvider>{children}</HeroUIProvider>;
}
