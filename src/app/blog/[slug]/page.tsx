import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Clock, ArrowLeft, ArrowRight } from 'lucide-react';

// Blog posts content (would typically come from MDX files)
const posts: Record<string, {
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  content: string;
}> = {
  'sono-qualidade-vs-quantidade': {
    title: 'Sono: qualidade importa mais que quantidade?',
    excerpt: 'Você pode dormir 8 horas e acordar cansado. Entenda por que a qualidade do sono é tão importante quanto a quantidade.',
    category: 'Sono',
    readTime: '5 min',
    date: '2 Jan 2026',
    content: `
## A pergunta de 8 horas

"Dormi 8 horas e ainda estou cansado."

Você já disse isso. Todo mundo já disse isso. E a resposta geralmente é: não é só sobre quanto tempo você dorme, mas **como** você dorme.

## O que é qualidade de sono?

Qualidade de sono tem a ver com:

- **Ciclos completos**: Passamos por 4-5 ciclos de sono por noite, cada um com ~90 minutos
- **Sono profundo suficiente**: É quando o corpo realmente se recupera
- **Mínimas interrupções**: Acordar várias vezes fragmenta os ciclos
- **Ambiente adequado**: Temperatura, luz, barulho

## Por que você acorda cansado

Os principais motivos:

1. **Acordar no meio de um ciclo** — Se você acorda nos primeiros 30 minutos de um ciclo, vai se sentir grogue
2. **Pouco sono profundo** — Álcool, estresse e luz azul reduzem sono profundo
3. **Apneia ou ronco** — Interrupções que você nem percebe
4. **Horário inconsistente** — Dormir em horários diferentes todo dia

## O que você pode fazer amanhã

Não precisa de wearable caro ou app complicado. Comece com:

1. **Horário fixo para acordar** — Mesmo no fim de semana, variando no máximo 1 hora
2. **Telas fora do quarto** — Ou pelo menos modo noturno 1 hora antes
3. **Quarto frio** — Entre 18-21°C é ideal para a maioria das pessoas
4. **Cafeína até 14h** — A meia-vida da cafeína é ~6 horas

## O Livvay ajuda nisso

O Livvay monitora seus padrões de sono e sugere ajustes pequenos mas efetivos. Sem complicação.

---

*Nota: Este artigo é informativo e não substitui orientação médica. Se você tem problemas crônicos de sono, consulte um especialista.*
    `,
  },
  'fibras-guia-pratico': {
    title: 'Fibras: o nutriente mais ignorado (e mais importante)',
    excerpt: 'A maioria das pessoas come menos da metade das fibras recomendadas. Veja por que isso importa e como resolver.',
    category: 'Nutrição',
    readTime: '7 min',
    date: '28 Dez 2025',
    content: `
## O número que ninguém olha

Quando alguém fala de nutrição, logo pensa em proteína, carboidrato, gordura. Talvez calorias.

Fibras? Quase ninguém menciona.

E no entanto, a maioria dos brasileiros come **menos de 15g por dia** — quando a recomendação é **25-35g**.

## Por que fibras importam

Fibras fazem muito mais que "regular o intestino":

- **Saciedade**: Você come menos sem perceber
- **Microbioma**: Alimentam as bactérias boas do seu intestino
- **Açúcar no sangue**: Reduzem picos de glicose após refeições
- **Colesterol**: Ajudam a reduzir LDL
- **Longevidade**: Estudos associam maior consumo de fibras a menor mortalidade

## Onde encontrar fibras (sem PDF)

Esqueça tabelas complicadas. Aqui vai o prático:

| Alimento | Fibras |
|----------|--------|
| 1 banana | 3g |
| 1 maçã com casca | 4g |
| 1 xícara de feijão | 15g |
| 1 prato de brócolis | 5g |
| 30g de aveia | 4g |

## Como chegar em 25g por dia

Uma estratégia simples:

1. **Café da manhã**: Aveia com banana = 7g
2. **Almoço**: Feijão + salada = 10g
3. **Lanche**: Maçã = 4g
4. **Jantar**: Legumes no prato = 5g

Total: **26g** — sem suplemento, sem complicação.

## O truque do Livvay

Quando você registra uma refeição no Livvay, ele já mostra quanto de fibra você comeu e quanto falta. Se faltou, sugere o que adicionar no próximo lanche.

Simples assim.

---

*Nota: Aumente fibras gradualmente para evitar desconforto intestinal. E beba água.*
    `,
  },
  'consistencia-vs-intensidade': {
    title: 'Consistência bate intensidade. Sempre.',
    excerpt: 'Por que treinar todo dia 15 minutos funciona melhor que 2 horas no fim de semana.',
    category: 'Hábitos',
    readTime: '6 min',
    date: '20 Dez 2025',
    content: `
## O mito da intensidade

"Vou malhar pesado no fim de semana pra compensar a semana."

Essa frase é uma armadilha. E a ciência explica por quê.

## O que a pesquisa mostra

Estudos consistentemente demonstram:

- **Exercício regular moderado** > Exercício intenso esporádico
- **15-20 min diários** produz mais resultados que 2h no domingo
- O corpo se adapta melhor a **estímulos frequentes** que a choques ocasionais

## Por que consistência ganha

1. **Recuperação**: Exercício diário leve permite recuperação adequada
2. **Hábito**: É mais fácil manter algo que você faz todo dia
3. **Metabolismo**: Efeitos acumulativos ao longo do tempo
4. **Lesões**: Menos risco quando não força demais de uma vez

## O problema do "guerreiro de fim de semana"

Quem só treina pesado no fim de semana:

- Maior risco de lesão
- Fadiga extrema nos dias seguintes
- Mais difícil criar hábito
- Resultados inconsistentes

## Como aplicar isso

A regra é simples: **faça algo todos os dias, mesmo que pequeno**.

- Segunda: 15 min caminhada
- Terça: 10 min alongamento
- Quarta: 20 min treino
- Quinta: 15 min caminhada
- Sexta: 10 min mobilidade
- Sábado: Treino mais longo se quiser
- Domingo: Caminhada leve

Total na semana: Muito mais efetivo que 2h no domingo.

## O papel do Livvay

O Livvay não te cobra treinos malucos. Ele te lembra de se mover todo dia, registra seu progresso, e celebra a consistência — não a intensidade.

Porque consistência bate intensidade. Sempre.

---

*Nota: Consulte um profissional de educação física para treinos específicos.*
    `,
  },
};

export async function generateStaticParams() {
  return Object.keys(posts).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = posts[slug];
  
  if (!post) {
    return { title: 'Post não encontrado' };
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: `${post.title} | Blog Livvay`,
      description: post.excerpt,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = posts[slug];

  if (!post) {
    notFound();
  }

  // Simple markdown-like rendering (in production, use MDX)
  const renderContent = (content: string) => {
    const lines = content.trim().split('\n');
    const elements: React.ReactNode[] = [];
    let inList = false;
    let inTable = false;
    let tableRows: string[][] = [];

    lines.forEach((line, i) => {
      const trimmedLine = line.trim();

      // Headers
      if (trimmedLine.startsWith('## ')) {
        if (inList) { inList = false; }
        elements.push(
          <h2 key={i} className="text-2xl font-bold text-foreground mt-10 mb-4">
            {trimmedLine.slice(3)}
          </h2>
        );
      }
      // Bold list items
      else if (trimmedLine.startsWith('- **')) {
        if (!inList) {
          inList = true;
        }
        const match = trimmedLine.match(/- \*\*(.+?)\*\*:?\s*(.*)$/);
        if (match) {
          elements.push(
            <li key={i} className="flex items-start gap-2 text-foreground-light mb-2">
              <span className="text-brand mt-1">•</span>
              <span>
                <strong className="text-foreground">{match[1]}</strong>
                {match[2] && `: ${match[2]}`}
              </span>
            </li>
          );
        }
      }
      // Regular list items
      else if (trimmedLine.startsWith('- ')) {
        if (!inList) {
          inList = true;
        }
        elements.push(
          <li key={i} className="flex items-start gap-2 text-foreground-light mb-2">
            <span className="text-brand mt-1">•</span>
            <span>{trimmedLine.slice(2)}</span>
          </li>
        );
      }
      // Numbered list
      else if (/^\d+\.\s/.test(trimmedLine)) {
        const match = trimmedLine.match(/^(\d+)\.\s\*\*(.+?)\*\*\s*—?\s*(.*)$/);
        if (match) {
          elements.push(
            <div key={i} className="flex items-start gap-3 mb-3">
              <span className="w-6 h-6 rounded-full bg-brand/20 flex items-center justify-center text-brand text-sm font-bold flex-shrink-0">
                {match[1]}
              </span>
              <span className="text-foreground-light">
                <strong className="text-foreground">{match[2]}</strong>
                {match[3] && ` — ${match[3]}`}
              </span>
            </div>
          );
        } else {
          const simpleMatch = trimmedLine.match(/^(\d+)\.\s(.+)$/);
          if (simpleMatch) {
            elements.push(
              <div key={i} className="flex items-start gap-3 mb-3">
                <span className="w-6 h-6 rounded-full bg-brand/20 flex items-center justify-center text-brand text-sm font-bold flex-shrink-0">
                  {simpleMatch[1]}
                </span>
                <span className="text-foreground-light">{simpleMatch[2]}</span>
              </div>
            );
          }
        }
      }
      // Table
      else if (trimmedLine.startsWith('|')) {
        if (!inTable) {
          inTable = true;
          tableRows = [];
        }
        if (!trimmedLine.includes('---')) {
          const cells = trimmedLine.split('|').filter(c => c.trim()).map(c => c.trim());
          tableRows.push(cells);
        }
      }
      // Horizontal rule
      else if (trimmedLine === '---') {
        if (inTable) {
          elements.push(
            <table key={i} className="w-full my-6 border-collapse">
              <thead>
                <tr className="border-b border-border">
                  {tableRows[0]?.map((cell, j) => (
                    <th key={j} className="text-left py-2 px-4 text-foreground font-medium">{cell}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.slice(1).map((row, ri) => (
                  <tr key={ri} className="border-b border-border/50">
                    {row.map((cell, j) => (
                      <td key={j} className="py-2 px-4 text-foreground-light">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          );
          inTable = false;
          tableRows = [];
        } else {
          elements.push(<hr key={i} className="border-border my-8" />);
        }
      }
      // Italic note
      else if (trimmedLine.startsWith('*') && trimmedLine.endsWith('*')) {
        elements.push(
          <p key={i} className="text-sm text-foreground-muted italic mt-6">
            {trimmedLine.slice(1, -1)}
          </p>
        );
      }
      // Regular paragraph
      else if (trimmedLine.length > 0) {
        if (inList) { inList = false; }
        // Handle inline bold
        const parts = trimmedLine.split(/(\*\*[^*]+\*\*)/);
        elements.push(
          <p key={i} className="text-foreground-light mb-4 leading-relaxed">
            {parts.map((part, pi) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={pi} className="text-foreground">{part.slice(2, -2)}</strong>;
              }
              return part;
            })}
          </p>
        );
      }
    });

    return elements;
  };

  return (
    <>
      {/* Header */}
      <section className="py-12 md:py-20 bg-gradient-to-b from-background to-surface-100">
        <Container>
          <Link 
            href="/blog" 
            className="inline-flex items-center gap-2 text-foreground-light hover:text-foreground transition-colors mb-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Voltar ao blog</span>
          </Link>
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="premium">{post.category}</Badge>
              <span className="text-foreground-muted text-sm flex items-center gap-1">
                <Clock className="w-4 h-4" aria-hidden="true" />
                <span>{post.readTime}</span>
              </span>
              <span className="text-foreground-muted text-sm">{post.date}</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              {post.title}
            </h1>
            <p className="text-xl text-foreground-light">{post.excerpt}</p>
          </div>
        </Container>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16 bg-background">
        <Container>
          <article className="max-w-2xl mx-auto">
            {renderContent(post.content)}
          </article>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-16 bg-alternative">
        <Container>
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Quer aplicar isso na prática?
            </h2>
            <p className="text-foreground-light mb-6">
              O Livvay te ajuda a transformar conhecimento em ação diária.
            </p>
            <Button href="/score" size="large" iconRight={<ArrowRight />}>
              Calcular meu Score
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
