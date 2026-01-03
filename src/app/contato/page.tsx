'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Mail, User, MessageSquare, Send, Check, Loader2 } from 'lucide-react';
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
      // Using the lead API with source=contato
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          source: 'contato',
          answers: {
            name: data.name,
            message: data.message,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar');
      }

      setIsSuccess(true);
      reset();
    } catch {
      setServerError('Erro ao enviar mensagem. Tente novamente.');
    }
  };

  return (
    <>
      {/* Header */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-[#0A0A0B] to-[#111113]">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            <Badge variant="premium" className="mb-4">Contato</Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Fale com a gente
            </h1>
            <p className="text-xl text-[#A1A1AA]">
              Dúvidas, sugestões ou parcerias? Estamos aqui.
            </p>
          </div>
        </Container>
      </section>

      {/* Form */}
      <section className="py-12 md:py-16 bg-[#0A0A0B]">
        <Container>
          <div className="max-w-xl mx-auto">
            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card variant="highlight" className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#22C55E]/20 flex items-center justify-center">
                    <Check className="w-10 h-10 text-[#22C55E]" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4">
                    Mensagem enviada!
                  </h2>
                  <p className="text-[#A1A1AA] mb-6">
                    Obrigado pelo contato. Responderemos em até 48 horas úteis.
                  </p>
                  <Button onClick={() => setIsSuccess(false)} variant="secondary">
                    Enviar outra mensagem
                  </Button>
                </Card>
              </motion.div>
            ) : (
              <Card>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                      Nome
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#71717A]" />
                      <input
                        type="text"
                        id="name"
                        placeholder="Seu nome"
                        {...register('name')}
                        className={`
                          w-full pl-12 pr-4 py-3 
                          bg-[#0A0A0B] border rounded-xl
                          text-white placeholder-[#71717A]
                          focus:outline-none focus:ring-2 focus:ring-[#00E676] focus:border-transparent
                          ${errors.name ? 'border-[#EF4444]' : 'border-[#27272A]'}
                        `}
                      />
                    </div>
                    {errors.name && (
                      <p className="text-[#EF4444] text-sm mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#71717A]" />
                      <input
                        type="email"
                        id="email"
                        placeholder="seu@email.com"
                        {...register('email')}
                        className={`
                          w-full pl-12 pr-4 py-3 
                          bg-[#0A0A0B] border rounded-xl
                          text-white placeholder-[#71717A]
                          focus:outline-none focus:ring-2 focus:ring-[#00E676] focus:border-transparent
                          ${errors.email ? 'border-[#EF4444]' : 'border-[#27272A]'}
                        `}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-[#EF4444] text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-white mb-2">
                      Mensagem
                    </label>
                    <div className="relative">
                      <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-[#71717A]" />
                      <textarea
                        id="message"
                        rows={5}
                        placeholder="Como podemos ajudar?"
                        {...register('message')}
                        className={`
                          w-full pl-12 pr-4 py-3 
                          bg-[#0A0A0B] border rounded-xl
                          text-white placeholder-[#71717A]
                          focus:outline-none focus:ring-2 focus:ring-[#00E676] focus:border-transparent
                          resize-none
                          ${errors.message ? 'border-[#EF4444]' : 'border-[#27272A]'}
                        `}
                      />
                    </div>
                    {errors.message && (
                      <p className="text-[#EF4444] text-sm mt-1">{errors.message.message}</p>
                    )}
                  </div>

                  {serverError && (
                    <div className="p-4 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl">
                      <p className="text-[#EF4444] text-sm">{serverError}</p>
                    </div>
                  )}

                  <Button type="submit" isLoading={isSubmitting} className="w-full" size="lg">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Enviar mensagem
                      </>
                    )}
                  </Button>
                </form>
              </Card>
            )}

            {/* Alternative contacts */}
            <div className="mt-12 text-center">
              <p className="text-[#71717A] mb-4">Ou entre em contato diretamente:</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:contato@livvay.com"
                  className="inline-flex items-center gap-2 text-[#A1A1AA] hover:text-white transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  contato@livvay.com
                </a>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

