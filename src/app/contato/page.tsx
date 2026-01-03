'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Mail, User, MessageSquare, Send, Check } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const schema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().min(1, 'Email é obrigatório').email('Email inválido'),
  message: z.string().min(10, 'Mensagem deve ter pelo menos 10 caracteres'),
});

type FormData = z.infer<typeof schema>;

export default function ContatoPage() {
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
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          message: data.message,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao enviar');
      }

      setIsSuccess(true);
      reset();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao enviar mensagem. Tente novamente.';
      setServerError(message);
    }
  };

  return (
    <>
      {/* Header */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-background to-surface-100">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            <Badge variant="premium" className="mb-4">Contato</Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Fale com a gente
            </h1>
            <p className="text-xl text-foreground-light">
              Dúvidas, sugestões ou parcerias? Estamos aqui.
            </p>
          </div>
        </Container>
      </section>

      {/* Form */}
      <section className="py-12 md:py-16 bg-background">
        <Container>
          <div className="max-w-xl mx-auto">
            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                role="status"
                aria-live="polite"
              >
                <Card variant="highlight" className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/20 flex items-center justify-center">
                    <Check className="w-10 h-10 text-success" aria-hidden="true" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    Mensagem enviada!
                  </h2>
                  <p className="text-foreground-light mb-6">
                    Obrigado pelo contato. Responderemos em até 48 horas úteis.
                  </p>
                  <Button onClick={() => setIsSuccess(false)} type="default">
                    Enviar outra mensagem
                  </Button>
                </Card>
              </motion.div>
            ) : (
              <Card>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                      Nome
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" aria-hidden="true" />
                      <input
                        type="text"
                        id="name"
                        placeholder="Seu nome"
                        {...register('name')}
                        className={`
                          w-full pl-12 pr-4 py-3 
                          bg-background border rounded-xl
                          text-foreground placeholder-foreground-muted
                          focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent
                          ${errors.name ? 'border-destructive' : 'border-border'}
                        `}
                        aria-invalid={errors.name ? 'true' : 'false'}
                        aria-describedby={errors.name ? 'name-error' : undefined}
                      />
                    </div>
                    {errors.name && (
                      <p id="name-error" className="text-destructive text-sm mt-1" role="alert">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" aria-hidden="true" />
                      <input
                        type="email"
                        id="email"
                        placeholder="seu@email.com"
                        {...register('email')}
                        className={`
                          w-full pl-12 pr-4 py-3 
                          bg-background border rounded-xl
                          text-foreground placeholder-foreground-muted
                          focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent
                          ${errors.email ? 'border-destructive' : 'border-border'}
                        `}
                        aria-invalid={errors.email ? 'true' : 'false'}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                      />
                    </div>
                    {errors.email && (
                      <p id="email-error" className="text-destructive text-sm mt-1" role="alert">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                      Mensagem
                    </label>
                    <div className="relative">
                      <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-foreground-muted" aria-hidden="true" />
                      <textarea
                        id="message"
                        rows={5}
                        placeholder="Como podemos ajudar?"
                        {...register('message')}
                        className={`
                          w-full pl-12 pr-4 py-3 
                          bg-background border rounded-xl
                          text-foreground placeholder-foreground-muted
                          focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent
                          resize-none
                          ${errors.message ? 'border-destructive' : 'border-border'}
                        `}
                        aria-invalid={errors.message ? 'true' : 'false'}
                        aria-describedby={errors.message ? 'message-error' : undefined}
                      />
                    </div>
                    {errors.message && (
                      <p id="message-error" className="text-destructive text-sm mt-1" role="alert">
                        {errors.message.message}
                      </p>
                    )}
                  </div>

                  {serverError && (
                    <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl" role="alert">
                      <p className="text-destructive text-sm">{serverError}</p>
                    </div>
                  )}

                  <Button
                    htmlType="submit"
                    loading={isSubmitting}
                    className="w-full"
                    size="large"
                    icon={isSubmitting ? undefined : <Send />}
                  >
                    {isSubmitting ? 'Enviando...' : 'Enviar mensagem'}
                  </Button>
                </form>
              </Card>
            )}

            {/* Alternative contacts */}
            <div className="mt-12 text-center">
              <p className="text-foreground-muted mb-4">Ou entre em contato diretamente:</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:contato@livvay.com"
                  className="inline-flex items-center gap-2 text-foreground-light hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded"
                >
                  <Mail className="w-4 h-4" aria-hidden="true" />
                  <span>contato@livvay.com</span>
                </a>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
