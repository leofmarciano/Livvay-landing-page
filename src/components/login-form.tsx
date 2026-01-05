'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { getDefaultDashboard } from '@/lib/rbac/config';
import { parseRole, DEFAULT_ROLE } from '@/lib/rbac/types';

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const _next = searchParams.get('next');
  // Prevent open redirect: only allow relative paths starting with / but not //
  const hasExplicitNext = _next?.startsWith('/') && !_next.startsWith('//');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      // Get user role and determine destination
      const userRole = parseRole(data.user?.app_metadata?.role) || DEFAULT_ROLE;
      const destination = hasExplicitNext ? _next! : getDefaultDashboard(userRole);

      // Use hard navigation to ensure middleware runs with fresh session
      router.refresh();
      window.location.href = destination;
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card hover={false}>
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">Entrar</h1>
          <p className="text-foreground-light text-sm mt-2">
            Entre com seu email e senha para acessar
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
              <input
                id="email"
                type="email"
                placeholder="seu@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-foreground-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Senha
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-sm text-brand hover:underline"
              >
                Esqueceu a senha?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-foreground-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-xl">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          <Button
            htmlType="submit"
            loading={isLoading}
            className="w-full"
            size="large"
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Button>

          <p className="text-center text-sm text-foreground-light">
            Não tem uma conta?{' '}
            <Link href="/auth/sign-up" className="text-brand hover:underline">
              Cadastre-se
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
}
