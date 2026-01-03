'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Check, Loader2 } from 'lucide-react';
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
        className={`flex items-center gap-3 p-4 bg-[#22C55E]/10 border border-[#22C55E]/30 rounded-xl ${className}`}
      >
        <div className="w-10 h-10 rounded-full bg-[#22C55E]/20 flex items-center justify-center">
          <Check className="w-5 h-5 text-[#22C55E]" />
        </div>
        <div>
          <p className="text-white font-medium">Você está dentro!</p>
          <p className="text-[#A1A1AA] text-sm">Avisaremos quando lançar.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`${variant === 'inline' ? 'flex flex-col sm:flex-row gap-3' : 'space-y-3'} ${className}`}
    >
      <div className="flex-1">
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#71717A]" />
          <input
            type="email"
            placeholder={placeholder}
            {...register('email')}
            className={`
              w-full pl-12 pr-4 py-3 
              bg-[#111113] border rounded-xl
              text-white placeholder-[#71717A]
              focus:outline-none focus:ring-2 focus:ring-[#00E676] focus:border-transparent
              transition-all
              ${errors.email ? 'border-[#EF4444]' : 'border-[#27272A]'}
            `}
            aria-label="Email"
            aria-invalid={errors.email ? 'true' : 'false'}
          />
        </div>
        <AnimatePresence>
          {(errors.email || serverError) && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-[#EF4444] text-sm mt-1 pl-1"
              role="alert"
            >
              {errors.email?.message || serverError}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
      <Button
        type="submit"
        isLoading={isSubmitting}
        className={variant === 'stacked' ? 'w-full' : 'sm:w-auto'}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Enviando...
          </>
        ) : (
          buttonText
        )}
      </Button>
    </form>
  );
}

