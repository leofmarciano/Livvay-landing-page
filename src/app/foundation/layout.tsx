import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'L3 - Livvay Longevity Labs',
  description:
    'Financiamento de pesquisa científica em longevidade e healthspan. Governança independente, metodologia rigorosa, resultados publicados em periódicos revisados por pares.',
  openGraph: {
    title: 'L3 - Livvay Longevity Labs',
    description:
      'Instituto de pesquisa dedicado ao avanço da ciência de longevidade.',
  },
};

export default function FoundationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
