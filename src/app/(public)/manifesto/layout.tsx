import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Manifesto - Não Quero Morrer',
  description:
    'Vida eterna não é promessa. É direção. O manifesto do Livvay sobre longevidade, consistência e ciência aplicada.',
  openGraph: {
    title: 'Manifesto Livvay - Não Quero Morrer',
    description:
      'Vida eterna não é promessa. É direção. Conheça o manifesto do Livvay.',
  },
};

export default function ManifestoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

