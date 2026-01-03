# Livvay - Landing Page

> Um assistente de longevidade que transforma tudo que você come, dorme e faz em um plano simples, ajustado em tempo real. Rumo à vida eterna, com método.

## 🚀 Quick Start

```bash
# Instalar dependências
bun install

# Rodar em desenvolvimento
bun run dev

# Build para produção
bun run build

# Rodar build de produção
bun run start
```

O site estará disponível em [http://localhost:3000](http://localhost:3000).

## 📁 Estrutura do Projeto

```
src/
├── app/                    # App Router (Next.js 15)
│   ├── api/               # API Routes
│   │   └── lead/          # Captura de leads
│   ├── blog/              # Blog com posts
│   ├── contato/           # Formulário de contato
│   ├── foundation/        # LLL Foundation
│   ├── imprensa/          # Press kit
│   ├── liga/              # Liga Livvay
│   ├── manifesto/         # Manifesto
│   ├── plus/              # Livvay Plus
│   ├── privacidade/       # Política de privacidade
│   ├── score/             # Quiz do Livvay Score
│   ├── termos/            # Termos de uso
│   ├── globals.css        # Estilos globais
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Landing page
├── components/
│   ├── forms/             # Formulários
│   ├── layout/            # Header, Footer
│   └── ui/                # Componentes reutilizáveis
└── data/                  # Dados locais (leads)
```

## 🎨 Stack

- **Framework**: [Next.js 15](https://nextjs.org/) com App Router
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animações**: [Framer Motion](https://www.framer.com/motion/)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Formulários**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Runtime**: [Bun](https://bun.sh/)

## 📄 Páginas

| Rota | Descrição |
|------|-----------|
| `/` | Landing page principal com todas as seções |
| `/score` | Quiz interativo para calcular o Livvay Score |
| `/plus` | Detalhes do plano Plus com equipe médica |
| `/liga` | Liga Livvay - gamificação e ranking |
| `/foundation` | LLL - Livvay Life Foundation |
| `/manifesto` | Manifesto "Não quero morrer" |
| `/imprensa` | Press kit para jornalistas |
| `/blog` | Blog com artigos sobre saúde |
| `/privacidade` | Política de privacidade |
| `/termos` | Termos de uso |
| `/contato` | Formulário de contato |

## 🔌 API Routes

### POST `/api/lead`

Captura leads (lista de espera, quiz, contato).

**Body:**
```json
{
  "email": "user@example.com",
  "source": "hero" | "score" | "plus" | "liga" | "contato" | "manifesto",
  "answers": {} // opcional, para respostas do quiz
}
```

**Response:**
```json
{
  "message": "Lead cadastrado com sucesso",
  "id": "1234567890-abc123"
}
```

Os leads são salvos em `data/leads.json`.

## 🎯 Funcionalidades

### Quiz do Livvay Score

O quiz em `/score` coleta:
1. Objetivo principal (sono, energia, emagrecimento, etc.)
2. Tipo de rotina
3. Principal sabotador
4. Uso de wearable
5. Interesse no Plus

O score é calculado com base em:
- Goal selection: +50-100 pontos
- Routine organization: +20-80 pontos
- Self-awareness bonus: +30 pontos
- Wearable advantage: +40 pontos
- Plus commitment: +0-30 pontos

### Captura de Leads

Formulários de captura em:
- Hero da landing page
- Final da landing page
- Resultado do quiz
- Páginas Plus, Liga, Manifesto
- Formulário de contato

## 🎨 Design System

### Cores

```css
--color-primary: #00E676        /* Verde Livvay */
--color-bg-dark: #0A0A0B        /* Fundo principal */
--color-bg-card: #111113        /* Fundo dos cards */
--color-text-primary: #FFFFFF   /* Texto principal */
--color-text-secondary: #A1A1AA /* Texto secundário */
```

### Componentes

- `Button` - Botões com variantes (primary, secondary, outline, ghost)
- `Card` - Cards com variantes (default, highlight, glass)
- `Badge` - Badges para status e categorias
- `Section` - Wrapper para seções com animação
- `FAQ` - Acordeão para perguntas frequentes
- `Leaderboard` - Ranking da Liga
- `ComparisonTable` - Tabela comparativa de planos

## 📱 Responsividade

O site é mobile-first, com breakpoints:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

## ♿ Acessibilidade

- Semântica HTML adequada
- Focus visível em elementos interativos
- ARIA labels onde necessário
- Contraste de cores adequado
- Suporte a navegação por teclado

## 🔍 SEO

- Metadata por página
- Open Graph tags
- Twitter Cards
- Sitemap automático (`/sitemap.xml`)
- Robots.txt (`/robots.txt`)

## 📝 Notas de Compliance

O copy segue diretrizes de:
- "Vida eterna" como **ambição**, não promessa
- Disclaimers em menções a equipe médica
- Estimativas são probabilísticas, não diagnósticos
- Tom acessível, sem jargão médico

## 🚢 Deploy

O projeto está pronto para deploy em:
- [Vercel](https://vercel.com/) (recomendado)
- [Netlify](https://netlify.com/)
- Qualquer servidor Node.js

```bash
# Build
bun run build

# Rodar
bun run start
```

## 📄 Licença

Projeto proprietário - Livvay © 2026
