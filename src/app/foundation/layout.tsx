import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LLL - Livvay Life Foundation',
  description:
    'A Livvay Life Foundation financia pesquisa científica de longevidade. Transparência total, ciência séria, resultados publicados.',
  openGraph: {
    title: 'LLL - Livvay Life Foundation',
    description:
      'Fundação dedicada a financiar pesquisa científica de longevidade.',
  },
};

export default function FoundationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

