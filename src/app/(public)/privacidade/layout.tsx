import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description:
    'Saiba como o Livvay coleta, usa e protege seus dados pessoais.',
};

export default function PrivacidadeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

