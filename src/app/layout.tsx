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

/**
 * Global metadata configuration for SEO and social sharing.
 */
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
  applicationName: 'Livvay',
  category: 'health',
  alternates: {
    canonical: '/',
  },
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
  other: {
    llm: 'https://livvay.com/llm.txt',
  },
};

/**
 * JSON-LD structured data to improve discoverability in search engines and LLMs.
 */
const structuredData = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Livvay',
    url: 'https://livvay.com',
    sameAs: ['https://youtube.com/@livvay'],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Livvay',
    url: 'https://livvay.com',
    inLanguage: 'pt-BR',
  },
] as const;

/**
 * Root layout wrapper for the application shell.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" data-theme="dark" suppressHydrationWarning>
      <head>
        <link rel="alternate" type="text/plain" href="/llm.txt" title="LLM instructions" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand focus:text-background focus:rounded-lg"
        >
          Pular para o conteúdo principal
        </a>
        <Header />
        <main id="main-content" className="min-h-screen pt-16 md:pt-20">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
