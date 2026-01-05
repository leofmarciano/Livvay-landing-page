import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Clock, ArrowRight } from 'lucide-react';

// Blog posts data (would typically come from MDX/CMS)
const posts = [
  {
    slug: 'sono-qualidade-vs-quantidade',
    title: 'Sono: qualidade importa mais que quantidade?',
    excerpt:
      'Você pode dormir 8 horas e acordar cansado. Entenda por que a qualidade do sono é tão importante quanto a quantidade — e como melhorar.',
    category: 'Sono',
    readTime: '5 min',
    date: '2 Jan 2026',
    featured: true,
  },
  {
    slug: 'fibras-guia-pratico',
    title: 'Fibras: o nutriente mais ignorado (e mais importante)',
    excerpt:
      'A maioria das pessoas come menos da metade das fibras recomendadas. Veja por que isso importa e como resolver sem complicação.',
    category: 'Nutrição',
    readTime: '7 min',
    date: '28 Dez 2025',
    featured: false,
  },
  {
    slug: 'consistencia-vs-intensidade',
    title: 'Consistência bate intensidade. Sempre.',
    excerpt:
      'Por que treinar todo dia 15 minutos funciona melhor que 2 horas no fim de semana. A ciência por trás da consistência.',
    category: 'Hábitos',
    readTime: '6 min',
    date: '20 Dez 2025',
    featured: false,
  },
];

export default function BlogPage() {
  const featuredPost = posts.find((p) => p.featured);

  return (
    <>
      {/* Hero */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-background to-surface-100">
        <Container>
          <div className="max-w-2xl">
            <Badge variant="premium" className="mb-4">Blog</Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Conhecimento que funciona
            </h1>
            <p className="text-xl text-foreground-light">
              Artigos práticos sobre sono, nutrição, hábitos e longevidade. 
              Sem jargão, com ciência.
            </p>
          </div>
        </Container>
      </section>

      {/* Featured Post */}
      {featuredPost && (
        <section className="py-12 bg-background">
          <Container>
            <Link href={`/blog/${featuredPost.slug}`} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-2xl">
              <Card variant="highlight" className="p-8 hover:border-brand/50 transition-colors">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <Badge variant="premium">{featuredPost.category}</Badge>
                      <span className="text-foreground-muted text-sm flex items-center gap-1">
                        <Clock className="w-4 h-4" aria-hidden="true" />
                        <span>{featuredPost.readTime}</span>
                      </span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                      {featuredPost.title}
                    </h2>
                    <p className="text-foreground-light mb-6">{featuredPost.excerpt}</p>
                    <span className="text-brand font-medium flex items-center gap-2">
                      <span>Ler artigo</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </span>
                  </div>
                  <div className="md:w-64 h-48 md:h-auto bg-gradient-to-br from-brand/20 to-brand/5 rounded-xl" aria-hidden="true" />
                </div>
              </Card>
            </Link>
          </Container>
        </section>
      )}

      {/* Other Posts */}
      <section className="py-12 md:py-16 bg-background">
        <Container>
          <h2 className="text-2xl font-bold text-foreground mb-8">Todos os artigos</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link 
                key={post.slug} 
                href={`/blog/${post.slug}`}
                className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-2xl"
              >
                <Card className="h-full hover:border-border-strong transition-colors">
                  <div className="h-32 bg-gradient-to-br from-surface-200 to-surface-100 rounded-lg mb-4" aria-hidden="true" />
                  <div className="flex items-center gap-3 mb-3">
                    <Badge>{post.category}</Badge>
                    <span className="text-foreground-muted text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" aria-hidden="true" />
                      <span>{post.readTime}</span>
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{post.title}</h3>
                  <p className="text-sm text-foreground-light line-clamp-2">{post.excerpt}</p>
                  <p className="text-xs text-foreground-muted mt-4">{post.date}</p>
                </Card>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
