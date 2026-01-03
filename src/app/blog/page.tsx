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
  const otherPosts = posts.filter((p) => !p.featured);

  return (
    <>
      {/* Hero */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-[#0A0A0B] to-[#111113]">
        <Container>
          <div className="max-w-2xl">
            <Badge variant="premium" className="mb-4">Blog</Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Conhecimento que funciona
            </h1>
            <p className="text-xl text-[#A1A1AA]">
              Artigos práticos sobre sono, nutrição, hábitos e longevidade. 
              Sem jargão, com ciência.
            </p>
          </div>
        </Container>
      </section>

      {/* Featured Post */}
      {featuredPost && (
        <section className="py-12 bg-[#0A0A0B]">
          <Container>
            <Link href={`/blog/${featuredPost.slug}`}>
              <Card variant="highlight" className="p-8 hover:border-[#00E676]/50 transition-colors">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <Badge variant="premium">{featuredPost.category}</Badge>
                      <span className="text-[#71717A] text-sm flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {featuredPost.readTime}
                      </span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                      {featuredPost.title}
                    </h2>
                    <p className="text-[#A1A1AA] mb-6">{featuredPost.excerpt}</p>
                    <span className="text-[#00E676] font-medium flex items-center gap-2">
                      Ler artigo
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="md:w-64 h-48 md:h-auto bg-gradient-to-br from-[#00E676]/20 to-[#00E676]/5 rounded-xl" />
                </div>
              </Card>
            </Link>
          </Container>
        </section>
      )}

      {/* Other Posts */}
      <section className="py-12 md:py-16 bg-[#0A0A0B]">
        <Container>
          <h2 className="text-2xl font-bold text-white mb-8">Todos os artigos</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}>
                <Card className="h-full hover:border-[#3F3F46] transition-colors">
                  <div className="h-32 bg-gradient-to-br from-[#1A1A1D] to-[#111113] rounded-lg mb-4" />
                  <div className="flex items-center gap-3 mb-3">
                    <Badge>{post.category}</Badge>
                    <span className="text-[#71717A] text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{post.title}</h3>
                  <p className="text-sm text-[#A1A1AA] line-clamp-2">{post.excerpt}</p>
                  <p className="text-xs text-[#71717A] mt-4">{post.date}</p>
                </Card>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}

