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
      { href: '/foundation', label: 'LLL Foundation' },
      { href: '/imprensa', label: 'Imprensa' },
      { href: '/contato', label: 'Contato' },
    ],
  },
  legal: {
    title: 'Legal',
    links: [
      { href: '/privacidade', label: 'Privacidade' },
      { href: '/termos', label: 'Termos de Uso' },
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
    <footer className="bg-[#050506] border-t border-[#27272A]">
      <Container>
        <div className="py-12 md:py-16">
          {/* Main Footer Content */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Brand Column */}
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 text-white font-bold text-xl mb-4">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="32" height="32" rx="8" fill="#00E676"/>
                  <path d="M8 16L12 22L24 10" stroke="#0A0A0B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Livvay</span>
              </Link>
              <p className="text-[#71717A] text-sm mb-4 max-w-xs">
                Um assistente de longevidade que transforma tudo que você come, dorme e faz em um plano simples.
              </p>
              {/* Social Links */}
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-[#1A1A1D] flex items-center justify-center text-[#A1A1AA] hover:bg-[#00E676] hover:text-[#0A0A0B] transition-colors"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Links Columns */}
            {Object.entries(footerLinks).map(([key, section]) => (
              <div key={key}>
                <h3 className="text-white font-semibold mb-4">{section.title}</h3>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-[#71717A] hover:text-white transition-colors text-sm"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-[#27272A] flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[#71717A] text-sm">
              © {new Date().getFullYear()} Livvay. Todos os direitos reservados.
            </p>
            <p className="text-[#71717A] text-xs">
              Livvay não substitui avaliação médica. Resultados variam de pessoa para pessoa.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}

