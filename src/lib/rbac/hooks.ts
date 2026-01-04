'use client';

/**
 * RBAC Client-Side Hooks
 *
 * React hooks for accessing user role and authentication state.
 */

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { parseRole, type Role } from './types';
import type { User } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  role: Role | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

/**
 * Hook to get current user with role information.
 * Subscribes to auth state changes for real-time updates.
 */
export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    role: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    const supabase = createClient();

    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const role = user ? parseRole(user.app_metadata?.role) || 'afiliado' : null;

      setState({
        user,
        role,
        isLoading: false,
        isAuthenticated: !!user,
      });
    };

    fetchUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      const role = user ? parseRole(user.app_metadata?.role) || 'afiliado' : null;

      setState({
        user,
        role,
        isLoading: false,
        isAuthenticated: !!user,
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  return state;
}
