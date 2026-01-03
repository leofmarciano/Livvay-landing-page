import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calcular meu Livvay Score',
  description:
    'Descubra seu Livvay Score em 1 minuto. Um diagnóstico rápido para entender onde você está e receber um plano personalizado de longevidade.',
  openGraph: {
    title: 'Calcular meu Livvay Score | Livvay',
    description:
      'Descubra seu Livvay Score em 1 minuto e receba um plano personalizado.',
  },
};

export default function ScoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

