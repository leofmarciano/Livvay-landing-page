'use client';

import { motion } from 'framer-motion';
import {
  Trophy,
  Medal,
  Star,
  TrendingUp,
  Gift,
  Target,
  Flame,
  Crown,
  ArrowRight,
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Section, SectionHeader } from '@/components/ui/Section';
import { Leaderboard } from '@/components/ui/Leaderboard';
import { EmailCaptureForm } from '@/components/forms/EmailCaptureForm';

const leaderboardData = [
  { rank: 1, name: 'Marina Silva', score: 9847, city: 'São Paulo, SP' },
  { rank: 2, name: 'Carlos Eduardo', score: 9652, city: 'Rio de Janeiro, RJ' },
  { rank: 3, name: 'Ana Beatriz', score: 9438, city: 'Belo Horizonte, MG' },
  { rank: 4, name: 'Pedro Henrique', score: 9215, city: 'Curitiba, PR' },
  { rank: 5, name: 'Juliana Costa', score: 9103, city: 'Porto Alegre, RS' },
  { rank: 6, name: 'Rafael Mendes', score: 8987, city: 'Salvador, BA' },
  { rank: 7, name: 'Fernanda Lima', score: 8854, city: 'Brasília, DF' },
  { rank: 8, name: 'Lucas Oliveira', score: 8721, city: 'Recife, PE' },
  { rank: 9, name: 'Camila Santos', score: 8598, city: 'Fortaleza, CE' },
  { rank: 10, name: 'Bruno Almeida', score: 8465, city: 'Florianópolis, SC' },
];

// Using CSS variables for tier colors
const tiers = [
  {
    name: 'Bronze',
    icon: Medal,
    colorClass: 'text-amber-600',
    bgClass: 'bg-amber-600/10',
    borderClass: 'border-amber-600/30',
    scoreRange: '0 - 2.999',
    benefits: [
      'Acesso ao app completo',
      'Livvay Score atualizado',
      'Ranking municipal',
      '5% desconto em parceiros selecionados',
    ],
  },
  {
    name: 'Prata',
    icon: Medal,
    colorClass: 'text-gray-400',
    bgClass: 'bg-gray-400/10',
    borderClass: 'border-gray-400/30',
    scoreRange: '3.000 - 5.999',
    benefits: [
      'Todos os benefícios Bronze',
      '10% desconto em academias parceiras',
      'Cashback em mercados saudáveis',
      'Ranking estadual',
    ],
  },
  {
    name: 'Ouro',
    icon: Trophy,
    colorClass: 'text-warning',
    bgClass: 'bg-warning/10',
    borderClass: 'border-warning/30',
    scoreRange: '6.000 - 8.499',
    benefits: [
      'Todos os benefícios Prata',
      '20% desconto em suplementos',
      'Acesso a conteúdo exclusivo',
      'Desconto em planos de saúde parceiros',
      'Ranking nacional',
    ],
  },
  {
    name: 'Platina',
    icon: Crown,
    colorClass: 'text-brand',
    bgClass: 'bg-brand/10',
    borderClass: 'border-brand/30',
    scoreRange: '8.500+',
    benefits: [
      'Todos os benefícios Ouro',
      'Consultas bônus no Plus',
      'Acesso VIP a eventos',
      'Badge exclusivo no perfil',
      'Prioridade em novos recursos',
    ],
  },
];

const howItWorks = [
  {
    icon: Target,
    title: 'Registre seus hábitos',
    description: 'Alimentação, sono, exercício, humor. Quanto mais consistente, mais pontos.',
  },
  {
    icon: TrendingUp,
    title: 'Acumule pontos',
    description: 'Cada dia de registro e cada meta batida aumenta seu Score.',
  },
  {
    icon: Flame,
    title: 'Mantenha a streak',
    description: 'Dias consecutivos dão bônus. Não quebre a sequência!',
  },
  {
    icon: Gift,
    title: 'Destrave benefícios',
    description: 'Quanto maior seu Score, mais recompensas você libera.',
  },
];

const rewards = [
  { icon: '🏋️', title: 'Academias', desc: 'Rede parceira em todo Brasil' },
  { icon: '💊', title: 'Suplementos', desc: 'Até 30% de desconto' },
  { icon: '🥗', title: 'Mercados', desc: 'Cashback em compras saudáveis' },
  { icon: '🍽️', title: 'Restaurantes', desc: 'Descontos em opções fit' },
  { icon: '🏥', title: 'Planos de saúde', desc: 'Desconto na mensalidade' },
  { icon: '📚', title: 'Cursos', desc: 'Conteúdo exclusivo grátis' },
];

export default function LigaPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-surface-100" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-warning/5 rounded-full blur-[120px]" />

        <Container className="relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="warning" className="mb-4">
              <Trophy className="w-4 h-4 mr-1" aria-hidden="true" />
              <span>Liga Livvay</span>
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-foreground">
              A competição mais{' '}
              <span className="gradient-text">saudável</span> do país
            </h1>
            <p className="text-xl text-foreground-light mb-8">
              Sua saúde vira jogo. Com ranking municipal, estadual e nacional. 
              Quanto mais consistente você for, mais benefícios desbloqueia.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button href="#join-liga" size="lg">
                <span>Entrar na Liga</span>
                <Trophy className="w-5 h-5" aria-hidden="true" />
              </Button>
              <Button href="/score" variant="secondary" size="lg">
                Calcular meu Score
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* How It Works */}
      <Section>
        <SectionHeader
          title="Como funciona"
          subtitle="Transforme consistência em recompensas reais."
          badge="Mecânica"
        />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {howItWorks.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="text-center h-full">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-brand/10 flex items-center justify-center">
                  <step.icon className="w-7 h-7 text-brand" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-foreground-muted">{step.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Leaderboard */}
      <Section background="darker">
        <SectionHeader
          title="Ranking Nacional"
          subtitle="Os 10 melhores Scores do Brasil. Você pode ser o próximo."
          badge="Top 10"
        />
        <div className="max-w-2xl mx-auto">
          <Leaderboard entries={leaderboardData} />
          <p className="text-center text-sm text-foreground-muted mt-4">
            * Ranking exemplo. Dados reais após o lançamento.
          </p>
        </div>
      </Section>

      {/* Tiers */}
      <Section>
        <SectionHeader
          title="Níveis e benefícios"
          subtitle="Suba de nível e desbloqueie recompensas exclusivas."
          badge="Níveis"
        />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`h-full border-2 ${tier.borderClass}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl ${tier.bgClass} flex items-center justify-center`}>
                    <tier.icon className={`w-6 h-6 ${tier.colorClass}`} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${tier.colorClass}`}>{tier.name}</h3>
                    <p className="text-xs text-foreground-muted">{tier.scoreRange} pts</p>
                  </div>
                </div>
                <ul className="space-y-2" role="list">
                  {tier.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground-light" role="listitem">
                      <Star className={`w-4 h-4 ${tier.colorClass} flex-shrink-0 mt-0.5`} aria-hidden="true" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Rewards */}
      <Section background="darker">
        <SectionHeader
          title="Recompensas disponíveis"
          subtitle="Benefícios reais que fazem diferença no dia a dia."
          badge="Parceiros"
        />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {rewards.map((reward, index) => (
            <motion.div
              key={reward.title}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="text-center p-4">
                <span className="text-3xl mb-2 block" aria-hidden="true">{reward.icon}</span>
                <h4 className="font-semibold text-foreground mb-1 text-sm">{reward.title}</h4>
                <p className="text-xs text-foreground-muted">{reward.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
        <p className="text-center text-sm text-foreground-muted mt-6">
          * Lista de parceiros em expansão. Novos benefícios a cada mês.
        </p>
      </Section>

      {/* Score Breakdown */}
      <Section>
        <SectionHeader
          title="Como o Score é calculado"
          subtitle="Transparência total sobre o que conta."
          badge="Cálculo"
        />
        <div className="max-w-2xl mx-auto">
          <Card variant="glass">
            <div className="space-y-4" role="list">
              {[
                { label: 'Registro diário de alimentação', points: '+50 pts/dia' },
                { label: 'Registro de sono', points: '+30 pts/dia' },
                { label: 'Registro de exercício', points: '+40 pts/dia' },
                { label: 'Bater meta de proteína', points: '+20 pts/dia' },
                { label: 'Bater meta de fibras', points: '+15 pts/dia' },
                { label: 'Streak de 7 dias', points: '+100 pts bônus' },
                { label: 'Streak de 30 dias', points: '+500 pts bônus' },
                { label: 'Consulta no Plus realizada', points: '+200 pts' },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0"
                  role="listitem"
                >
                  <span className="text-foreground-light">{item.label}</span>
                  <span className="text-brand font-mono font-semibold">{item.points}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </Section>

      {/* CTA */}
      <section id="join-liga" className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-warning/10 via-background to-background" />
        <Container className="relative z-10">
          <div className="max-w-xl mx-auto text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-warning/10 flex items-center justify-center">
              <Trophy className="w-10 h-10 text-warning" aria-hidden="true" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Entre na Liga
            </h2>
            <p className="text-foreground-light mb-8">
              Seja avisado quando a competição começar e garanta seu lugar.
            </p>
            <EmailCaptureForm
              source="liga"
              buttonText="Entrar na Liga"
              variant="stacked"
            />
          </div>
        </Container>
      </section>
    </>
  );
}
