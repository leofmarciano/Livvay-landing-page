'use client';

import { motion } from 'framer-motion';
import {
  Trophy,
  Award,
  Medal,
  Star,
  Zap,
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

const tiers = [
  {
    name: 'Bronze',
    icon: Medal,
    color: 'text-[#CD7F32]',
    bgColor: 'bg-[#CD7F32]/10',
    borderColor: 'border-[#CD7F32]/30',
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
    color: 'text-[#C0C0C0]',
    bgColor: 'bg-[#C0C0C0]/10',
    borderColor: 'border-[#C0C0C0]/30',
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
    color: 'text-[#EAB308]',
    bgColor: 'bg-[#EAB308]/10',
    borderColor: 'border-[#EAB308]/30',
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
    color: 'text-[#00E676]',
    bgColor: 'bg-[#00E676]/10',
    borderColor: 'border-[#00E676]/30',
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
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0B] via-[#0A0A0B] to-[#111113]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#EAB308]/5 rounded-full blur-[120px]" />

        <Container className="relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="warning" className="mb-4">
              <Trophy className="w-4 h-4 mr-1" />
              Liga Livvay
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              A competição mais{' '}
              <span className="gradient-text">saudável</span> do país
            </h1>
            <p className="text-xl text-[#A1A1AA] mb-8">
              Sua saúde vira jogo. Com ranking municipal, estadual e nacional. 
              Quanto mais consistente você for, mais benefícios desbloqueia.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button href="#join-liga" size="lg">
                Entrar na Liga
                <Trophy className="w-5 h-5" />
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
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#00E676]/10 flex items-center justify-center">
                  <step.icon className="w-7 h-7 text-[#00E676]" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-[#71717A]">{step.description}</p>
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
          <p className="text-center text-sm text-[#71717A] mt-4">
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
              <Card className={`h-full border-2 ${tier.borderColor}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl ${tier.bgColor} flex items-center justify-center`}>
                    <tier.icon className={`w-6 h-6 ${tier.color}`} />
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${tier.color}`}>{tier.name}</h3>
                    <p className="text-xs text-[#71717A]">{tier.scoreRange} pts</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {tier.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#A1A1AA]">
                      <Star className={`w-4 h-4 ${tier.color} flex-shrink-0 mt-0.5`} />
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
                <span className="text-3xl mb-2 block">{reward.icon}</span>
                <h4 className="font-semibold text-white mb-1 text-sm">{reward.title}</h4>
                <p className="text-xs text-[#71717A]">{reward.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
        <p className="text-center text-sm text-[#71717A] mt-6">
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
            <div className="space-y-4">
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
                  className="flex items-center justify-between py-3 border-b border-[#27272A] last:border-0"
                >
                  <span className="text-[#A1A1AA]">{item.label}</span>
                  <span className="text-[#00E676] font-mono font-semibold">{item.points}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </Section>

      {/* CTA */}
      <section id="join-liga" className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#EAB308]/10 via-[#0A0A0B] to-[#0A0A0B]" />
        <Container className="relative z-10">
          <div className="max-w-xl mx-auto text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#EAB308]/10 flex items-center justify-center">
              <Trophy className="w-10 h-10 text-[#EAB308]" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Entre na Liga
            </h2>
            <p className="text-[#A1A1AA] mb-8">
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

