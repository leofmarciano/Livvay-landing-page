import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Você foi convidado para o Livvay',
  description:
    'Você recebeu um convite especial para o Livvay. Use seu código de convite ao criar sua conta e ative benefícios exclusivos.',
  openGraph: {
    title: 'Você foi convidado para o Livvay',
    description:
      'Você recebeu um convite especial para o Livvay. Use seu código de convite ao criar sua conta e ative benefícios exclusivos.',
    type: 'website',
    locale: 'pt_BR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Você foi convidado para o Livvay',
    description:
      'Você recebeu um convite especial para o Livvay. Use seu código de convite ao criar sua conta e ative benefícios exclusivos.',
  },
};

export default function ConviteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

