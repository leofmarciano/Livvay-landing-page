import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Livvay Plus - Você + AI + Equipe Médica',
  description:
    'O Livvay Plus une inteligência artificial com acompanhamento de nutricionista, médico e psicólogo. Resultados reais com suporte profissional.',
  openGraph: {
    title: 'Livvay Plus - Você + AI + Equipe Médica',
    description:
      'Acompanhamento completo com nutricionista, médico e psicólogo dedicados.',
  },
};

export default function PlusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

