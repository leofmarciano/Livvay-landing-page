import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Liga Livvay - A Competição Mais Saudável do País',
  description:
    'Transforme sua saúde em jogo. Ranking municipal, estadual e nacional com benefícios reais: academias, suplementos, planos de saúde e mais.',
  openGraph: {
    title: 'Liga Livvay - A Competição Mais Saudável do País',
    description:
      'Ranking de saúde com benefícios reais. Quanto mais consistente, mais você ganha.',
  },
};

export default function LigaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

