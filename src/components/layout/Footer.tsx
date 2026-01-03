'use client';

import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Instagram, Twitter, Linkedin, Youtube } from 'lucide-react';

const footerLinks = {
  product: {
    title: 'Produto',
    links: [
      { href: '/score', label: 'Calcular Score' },
      { href: '/plus', label: 'Livvay Plus' },
      { href: '/liga', label: 'Liga Livvay' },
      { href: '/blog', label: 'Blog' },
    ],
  },
  company: {
    title: 'Empresa',
    links: [
      { href: '/manifesto', label: 'Manifesto' },
      { href: '/foundation', label: 'L3 Research' },
      { href: '/imprensa', label: 'Imprensa' },
      { href: '/contato', label: 'Contato' },
    ],
  },
  legal: {
    title: 'Legal',
    links: [
      { href: '/privacidade', label: 'Privacidade' },
      { href: '/termos', label: 'Termos de uso' },
    ],
  },
};

const socialLinks = [
  { href: 'https://instagram.com/livvay', icon: Instagram, label: 'Instagram' },
  { href: 'https://twitter.com/livvay', icon: Twitter, label: 'Twitter' },
  { href: 'https://linkedin.com/company/livvay', icon: Linkedin, label: 'LinkedIn' },
  { href: 'https://youtube.com/@livvay', icon: Youtube, label: 'YouTube' },
];

export function Footer() {
  return (
    <footer className="bg-alternative border-t border-border" role="contentinfo">
      <Container>
        <div className="py-12 md:py-16">
          {/* Main Footer Content */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Brand Column */}
            <div className="col-span-2 md:col-span-1">
              <Link 
                href="/" 
                className="flex items-center gap-2 text-foreground font-bold text-xl mb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-lg"
                aria-label="Livvay - Página inicial"
              >
                <svg 
                  width="32" 
                  height="32" 
                  viewBox="0 0 32 32" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <rect width="32" height="32" rx="8" className="fill-brand"/>
                  <path d="M8 16L12 22L24 10" className="stroke-background" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Livvay</span>
              </Link>
              <p className="text-foreground-muted text-sm mb-4 max-w-xs">
                Um assistente de longevidade que transforma tudo que você come, dorme e faz em um plano para você viver pra sempre.
              </p>
              {/* Social Links */}
              <div className="flex gap-3" role="list" aria-label="Redes sociais">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-surface-100 flex items-center justify-center text-foreground-light hover:bg-brand hover:text-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    aria-label={`${social.label} (abre em nova janela)`}
                    role="listitem"
                  >
                    <social.icon className="w-5 h-5" aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>

            {/* Links Columns */}
            {Object.entries(footerLinks).map(([key, section]) => (
              <nav key={key} aria-label={section.title}>
                <h3 className="text-foreground font-semibold mb-4">{section.title}</h3>
                <ul className="space-y-3" role="list">
                  {section.links.map((link) => (
                    <li key={link.href} role="listitem">
                      <Link
                        href={link.href}
                        className="text-foreground-muted hover:text-foreground transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-foreground-muted text-sm">
              © {new Date().getFullYear()} Livvay. Todos os direitos reservados.
            </p>
            <p className="text-foreground-muted text-xs">
              Livvay não substitui avaliação médica. Resultados variam de pessoa para pessoa.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
