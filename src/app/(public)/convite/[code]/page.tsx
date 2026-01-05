import type { Metadata } from 'next';
import { InvitePageClient } from './InvitePageClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const codeUpper = code?.toUpperCase() || '';

  return {
    title: `Você foi convidado para o Livvay - Código ${codeUpper}`,
    description: `Você recebeu um convite especial para o Livvay. Use o código ${codeUpper} ao criar sua conta e ative benefícios exclusivos.`,
    openGraph: {
      title: `Você foi convidado para o Livvay - Código ${codeUpper}`,
      description: `Você recebeu um convite especial para o Livvay. Use o código ${codeUpper} ao criar sua conta e ative benefícios exclusivos.`,
      type: 'website',
      locale: 'pt_BR',
      url: `https://livvay.com/convite/${codeUpper}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `Você foi convidado para o Livvay - Código ${codeUpper}`,
      description: `Você recebeu um convite especial para o Livvay. Use o código ${codeUpper} ao criar sua conta e ative benefícios exclusivos.`,
    },
  };
}

export default function InvitePage() {
  return <InvitePageClient />;
}
