'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export function ForgotPasswordForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/confirm?next=/auth/update-password`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Erro ao enviar email');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className={cn('flex flex-col gap-6', className)} {...props}>
        <Card hover={false}>
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-brand/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-brand" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Verifique seu email
            </h1>
            <p className="text-foreground-light text-sm mb-6">
              Enviamos um link para redefinir sua senha para <strong>{email}</strong>
            </p>
            <Button href="/auth/login" type="outline" className="w-full">
              Voltar para login
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card hover={false}>
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">Esqueceu a senha?</h1>
          <p className="text-foreground-light text-sm mt-2">
            Digite seu email e enviaremos um link para redefinir
          </p>
        </div>

        <form onSubmit={handleForgotPassword} className="space-y-4">
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
            {isLoading ? 'Enviando...' : 'Enviar link de redefinição'}
          </Button>

          <p className="text-center text-sm text-foreground-light">
            Lembrou a senha?{' '}
            <Link href="/auth/login" className="text-brand hover:underline">
              Entrar
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
}
