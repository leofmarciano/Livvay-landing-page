import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Imprensa - Press Kit',
  description:
    'Recursos para jornalistas: informações sobre o Livvay, números, assets e contato para imprensa.',
  openGraph: {
    title: 'Imprensa - Press Kit | Livvay',
    description:
      'Recursos e informações para veículos de comunicação.',
  },
};

export default function ImprensaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

