import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Artigos práticos sobre sono, nutrição, hábitos e longevidade. Conhecimento que funciona, sem jargão.',
  openGraph: {
    title: 'Blog | Livvay',
    description:
      'Artigos práticos sobre saúde e longevidade.',
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

