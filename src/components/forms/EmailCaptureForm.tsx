'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const schema = z.object({
  email: z.string().min(1, 'Email é obrigatório').email('Email inválido'),
});

type FormData = z.infer<typeof schema>;

interface EmailCaptureFormProps {
  source: string;
  buttonText?: string;
  placeholder?: string;
  className?: string;
  onSuccess?: () => void;
  variant?: 'inline' | 'stacked';
}

export function EmailCaptureForm({
  source,
  buttonText = 'Entrar na lista',
  placeholder = 'seu@email.com',
  className = '',
  onSuccess,
  variant = 'inline',
}: EmailCaptureFormProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, source }),
      });

      if (!response.ok) {
        throw new Error('Erro ao cadastrar');
      }

      setIsSuccess(true);
      reset();
      onSuccess?.();

      // Reset success state after 5 seconds
      setTimeout(() => setIsSuccess(false), 5000);
    } catch {
      setServerError('Ocorreu um erro. Tente novamente.');
    }
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`flex items-center gap-3 p-4 bg-success-200 border border-success/30 rounded-xl ${className}`}
        role="status"
        aria-live="polite"
      >
        <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
          <Check className="w-5 h-5 text-success" aria-hidden="true" />
        </div>
        <div>
          <p className="text-foreground font-medium">Você está dentro!</p>
          <p className="text-foreground-light text-sm">Avisaremos quando lançar.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`${variant === 'inline' ? 'flex flex-col sm:flex-row sm:items-start gap-3' : 'space-y-3'} ${className}`}
      noValidate
    >
      <div className="flex-1">
        <label htmlFor={`email-${source}`} className="sr-only">
          Email
        </label>
        <div className="relative">
          <Mail 
            className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted" 
            size={18}
            aria-hidden="true" 
          />
          <input
            type="email"
            id={`email-${source}`}
            placeholder={placeholder}
            {...register('email')}
            className={`
              w-full h-[38px] pl-11 pr-4
              bg-surface-100 border rounded-md
              text-sm text-foreground placeholder-foreground-muted
              focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent
              transition-colors
              ${errors.email ? 'border-destructive' : 'border-border'}
            `}
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? `email-error-${source}` : undefined}
          />
        </div>
        <AnimatePresence>
          {(errors.email || serverError) && (
            <motion.p
              id={`email-error-${source}`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-destructive text-sm mt-1.5"
              role="alert"
            >
              {errors.email?.message || serverError}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
      <Button
        htmlType="submit"
        loading={isSubmitting}
        className={variant === 'stacked' ? 'w-full' : 'sm:w-auto shrink-0'}
      >
        {buttonText}
      </Button>
    </form>
  );
}
