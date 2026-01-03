'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const COOKIE_CONSENT_KEY = 'livvay-cookie-consent';

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const hasConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!hasConsent) {
      // Small delay to avoid layout shift on initial load
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    setIsVisible(false);
  };

  const handleDismiss = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'dismissed');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
          role="dialog"
          aria-label="Aviso de cookies"
          aria-describedby="cookie-description"
        >
          <div className="max-w-4xl mx-auto">
            <div className="bg-surface-100 border border-border rounded-xl shadow-lg p-4 md:p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                {/* Icon */}
                <div className="hidden md:flex w-10 h-10 rounded-lg bg-brand/10 items-center justify-center flex-shrink-0">
                  <Cookie className="w-5 h-5 text-brand" aria-hidden="true" />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <p id="cookie-description" className="text-sm text-foreground-light">
                    Usamos cookies para melhorar sua experiência, analisar o tráfego e personalizar conteúdo.
                    Ao continuar navegando, você concorda com nossa{' '}
                    <a
                      href="/privacidade"
                      className="text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded"
                    >
                      Política de Privacidade
                    </a>
                    .
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <Button
                    onClick={handleAccept}
                    size="small"
                    className="flex-1 md:flex-none"
                  >
                    Aceitar
                  </Button>
                  <button
                    onClick={handleDismiss}
                    className="p-2 text-foreground-muted hover:text-foreground hover:bg-surface-200 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    aria-label="Fechar aviso de cookies"
                  >
                    <X className="w-5 h-5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
