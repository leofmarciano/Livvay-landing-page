'use client';

/**
 * RBAC Client-Side Hooks
 *
 * React hooks for accessing user role and authentication state.
 */

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { parseRole, hasRoleAccess, getRoleLabel, type RoleName, DEFAULT_ROLE } from './types';
import type { User } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  role: RoleName | null;
  roleLabel: string | null;
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
    roleLabel: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    const supabase = createClient();

    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const role = user ? parseRole(user.app_metadata?.role) || DEFAULT_ROLE : null;

      setState({
        user,
        role,
        roleLabel: role ? getRoleLabel(role) : null,
        isLoading: false,
        isAuthenticated: !!user,
      });
    };

    fetchUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      const role = user ? parseRole(user.app_metadata?.role) || DEFAULT_ROLE : null;

      setState({
        user,
        role,
        roleLabel: role ? getRoleLabel(role) : null,
        isLoading: false,
        isAuthenticated: !!user,
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  return state;
}

/**
 * Hook to check if current user has access to a required role.
 */
export function useHasAccess(requiredRole: RoleName): boolean {
  const { role } = useAuth();
  return hasRoleAccess(role, requiredRole);
}

/**
 * Hook to check if current user has a specific permission.
 * Note: This queries the database, so it's async.
 */
export function usePermission(permission: string): {
  hasPermission: boolean;
  isLoading: boolean;
} {
  const [state, setState] = useState({
    hasPermission: false,
    isLoading: true,
  });
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setState({ hasPermission: false, isLoading: false });
      return;
    }

    const checkPermission = async () => {
      const supabase = createClient();
      const { data } = await supabase.rpc('has_permission', {
        p_user_id: user.id,
        p_permission: permission,
      });

      setState({
        hasPermission: data ?? false,
        isLoading: false,
      });
    };

    checkPermission();
  }, [user, permission, authLoading]);

  return state;
}
