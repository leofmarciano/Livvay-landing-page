import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://livvay.com'),
  title: {
    default: 'Livvay - Assistente de Longevidade | Rumo à vida eterna, com método',
    template: '%s | Livvay',
  },
  description:
    'Um assistente de longevidade que transforma tudo que você come, dorme e faz em um plano simples, ajustado em tempo real. Sem termos difíceis. Só direção clara.',
  keywords: [
    'longevidade',
    'saúde',
    'bem-estar',
    'nutrição',
    'sono',
    'assistente de saúde',
    'healthtech',
    'vida saudável',
  ],
  authors: [{ name: 'Livvay' }],
  creator: 'Livvay',
  publisher: 'Livvay',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://livvay.com',
    siteName: 'Livvay',
    title: 'Livvay - Assistente de Longevidade',
    description:
      'Um assistente de longevidade que transforma tudo que você come, dorme e faz em um plano simples, ajustado em tempo real.',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Livvay - Rumo à vida eterna, com método',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Livvay - Assistente de Longevidade',
    description:
      'Um assistente de longevidade que transforma tudo que você come, dorme e faz em um plano simples.',
    images: ['/og-image.svg'],
    creator: '@livvay',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0A0A0B] text-white`}
      >
        <Header />
        <main className="min-h-screen pt-16 md:pt-20">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
