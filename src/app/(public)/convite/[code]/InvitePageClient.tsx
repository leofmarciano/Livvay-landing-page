'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Smartphone, Copy, Check, Download, ExternalLink } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

// App store URLs (replace with actual URLs)
const APP_STORE_URL = 'https://apps.apple.com/app/livvay';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.livvay';
const DEEP_LINK_SCHEME = 'livvay://invite';

type PageState = 'loading' | 'valid' | 'invalid' | 'redirecting';

export function InvitePageClient() {
  const params = useParams();
  const code = (params.code as string)?.toUpperCase();

  const [pageState, setPageState] = useState<PageState>('loading');
  const [copied, setCopied] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  const trackVisit = useCallback(async () => {
    try {
      const response = await fetch('/api/referral/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          referrer: typeof document !== 'undefined' ? document.referrer : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.valid) {
        setPageState('invalid');
        return false;
      }

      setPageState('valid');
      return true;
    } catch {
      setPageState('invalid');
      return false;
    }
  }, [code]);

  const tryDeepLink = useCallback(() => {
    if (typeof window === 'undefined') return;

    setPageState('redirecting');

    // Create deep link URL
    const deepLink = `${DEEP_LINK_SCHEME}/${code}`;

    // Try to open the app
    const startTime = Date.now();

    // Create a hidden iframe to try the deep link
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = deepLink;
    document.body.appendChild(iframe);

    // Also try window.location as a fallback for some browsers
    setTimeout(() => {
      window.location.href = deepLink;
    }, 100);

    // Check if the app opened (if we're still here after 2 seconds, it didn't)
    setTimeout(() => {
      const elapsed = Date.now() - startTime;
      // If we're still on the page after 2.5 seconds, show the fallback
      if (elapsed < 3000 && document.hasFocus()) {
        setShowFallback(true);
        setPageState('valid');
      }
      // Clean up iframe
      document.body.removeChild(iframe);
    }, 2500);
  }, [code]);

  useEffect(() => {
    if (!code) {
      setPageState('invalid');
      return;
    }

    // Track the visit first
    trackVisit().then((valid) => {
      if (valid) {
        // Try deep link after tracking
        tryDeepLink();
      }
    });
  }, [code, trackVisit, tryDeepLink]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const detectOS = (): 'ios' | 'android' | 'other' => {
    if (typeof window === 'undefined') return 'other';
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) return 'ios';
    if (/android/.test(ua)) return 'android';
    return 'other';
  };

  const handleDownload = () => {
    const os = detectOS();
    if (os === 'ios') {
      window.open(APP_STORE_URL, '_blank');
    } else if (os === 'android') {
      window.open(PLAY_STORE_URL, '_blank');
    } else {
      // Desktop - show both options
      setShowFallback(true);
    }
  };

  // Loading state
  if (pageState === 'loading' || pageState === 'redirecting') {
    return (
      <section className="min-h-screen flex items-center justify-center bg-background">
        <Container>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand/10 mb-6">
              <Smartphone className="w-8 h-8 text-brand animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {pageState === 'redirecting' ? 'Abrindo o app...' : 'Carregando...'}
            </h1>
            <p className="text-foreground-light">
              {pageState === 'redirecting'
                ? 'Se o app não abrir, aguarde um momento.'
                : 'Verificando código de convite...'}
            </p>
          </div>
        </Container>
      </section>
    );
  }

  // Invalid code state
  if (pageState === 'invalid') {
    return (
      <section className="min-h-screen flex items-center justify-center bg-background">
        <Container>
          <div className="max-w-md mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-6">
              <ExternalLink className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Código inválido
            </h1>
            <p className="text-foreground-light mb-8">
              O código de convite <code className="font-mono bg-surface-200 px-2 py-1 rounded">{code}</code> não existe ou foi desativado.
            </p>
            <Button href="/" type="primary" iconRight={<ArrowRight />}>
              Ir para o site
            </Button>
          </div>
        </Container>
      </section>
    );
  }

  // Valid code - show invite page
  return (
    <>
      {/* Hero */}
      <section className="relative py-20 md:py-32 overflow-hidden min-h-screen flex items-center">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-surface-100" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand/5 rounded-full blur-[150px]" />

        <Container className="relative z-10">
          <div className="max-w-lg mx-auto text-center">
            <Badge variant="premium" className="mb-6">Convite especial</Badge>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-5xl font-bold leading-tight mb-4 text-foreground"
            >
              Você foi convidado para o Livvay
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-foreground-light mb-8"
            >
              Use o código abaixo ao criar sua conta para ativar benefícios exclusivos.
            </motion.p>

            {/* Code display */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-surface-100 border border-border rounded-2xl p-6 mb-8"
            >
              <p className="text-sm text-foreground-muted mb-2">Seu código de convite:</p>
              <div className="flex items-center justify-center gap-3">
                <code className="text-3xl md:text-4xl font-mono font-bold text-brand tracking-wider">
                  {code}
                </code>
                <button
                  onClick={handleCopyCode}
                  className="p-2 rounded-lg hover:bg-surface-200 transition-colors"
                  title="Copiar código"
                  aria-label="Copiar código"
                >
                  {copied ? (
                    <Check className="w-6 h-6 text-brand" />
                  ) : (
                    <Copy className="w-6 h-6 text-foreground-muted" />
                  )}
                </button>
              </div>
              {copied && (
                <p className="text-sm text-brand mt-2">Código copiado!</p>
              )}
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              {!showFallback ? (
                <Button
                  type="primary"
                  size="large"
                  icon={<Smartphone />}
                  onClick={tryDeepLink}
                  className="w-full sm:w-auto"
                >
                  Abrir no app
                </Button>
              ) : (
                <>
                  <p className="text-sm text-foreground-muted mb-4">
                    Baixe o app e use o código ao criar sua conta:
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      type="primary"
                      size="large"
                      icon={<Download />}
                      href={APP_STORE_URL}
                      className="w-full sm:w-auto"
                    >
                      App Store
                    </Button>
                    <Button
                      type="outline"
                      size="large"
                      icon={<Download />}
                      href={PLAY_STORE_URL}
                      className="w-full sm:w-auto"
                    >
                      Google Play
                    </Button>
                  </div>
                </>
              )}

              {!showFallback && (
                <button
                  onClick={handleDownload}
                  className="text-sm text-foreground-muted hover:text-foreground transition-colors underline underline-offset-4"
                >
                  Não tem o app? Baixe agora
                </button>
              )}
            </motion.div>
          </div>
        </Container>
      </section>

      {/* How it works */}
      <section className="py-16 bg-surface-100">
        <Container>
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground text-center mb-8">
              Como usar seu código
            </h2>
            <div className="grid gap-6">
              {[
                { step: '1', title: 'Baixe o app', desc: 'Disponível na App Store e Google Play' },
                { step: '2', title: 'Crie sua conta', desc: 'Preencha seus dados básicos' },
                { step: '3', title: 'Insira o código', desc: `Use ${code} quando solicitado` },
                { step: '4', title: 'Aproveite!', desc: 'Benefícios ativados automaticamente' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 bg-background p-4 rounded-xl border border-border"
                >
                  <div className="w-8 h-8 rounded-full bg-brand text-background flex items-center justify-center font-bold shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                    <p className="text-sm text-foreground-light">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

