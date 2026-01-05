'use client';

import { HeroUIProvider } from '@heroui/react';
import { AuthProvider } from '@/lib/auth/auth-context';

/**
 * Application providers wrapper.
 * Wraps the app with HeroUIProvider for HeroUI components and AuthProvider for global auth state.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </HeroUIProvider>
  );
}
