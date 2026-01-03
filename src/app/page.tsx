'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  Zap,
  Brain,
  Users,
  Trophy,
  Heart,
  Moon,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Target,
  Shield,
  Clock,
  Award,
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Section, SectionHeader } from '@/components/ui/Section';
import { FAQ } from '@/components/ui/FAQ';
import { ComparisonTable } from '@/components/ui/ComparisonTable';
import { Leaderboard } from '@/components/ui/Leaderboard';
import { EmailCaptureForm } from '@/components/forms/EmailCaptureForm';

// FAQ Data
const faqItems = [
  {
    question: 'Isso é para iniciante total?',
    answer:
      'Sim! O Livvay foi feito para qualquer pessoa, independente de conhecimento prévio. Explicamos tudo de forma simples, sem termos técnicos. Se você sabe usar um celular, sabe usar o Livvay.',
  },
  {
    question: 'Preciso de relógio/smartwatch?',
    answer:
      'Não é obrigatório. Wearables ajudam a capturar dados automaticamente (sono, passos, frequência cardíaca), mas você pode usar o Livvay só com o celular, registrando manualmente.',
  },
  {
    question: 'O Plus substitui médico?',
    answer:
      'Não. O Livvay Plus complementa seu acompanhamento de saúde. Nossa equipe médica orienta, pede exames quando faz sentido e pode prescrever quando indicado, mas não substitui emergências ou seu médico de referência.',
  },
  {
    question: 'Vocês prometem vida eterna?',
    answer:
      'Vida eterna é nossa missão e direção. O que entregamos é método, acompanhamento e consistência para aumentar qualidade e tempo de vida ao máximo possível. Sem promessas mágicas.',
  },
  {
    question: 'Como funciona o Livvay Score?',
    answer:
      'O Score é uma métrica que combina seus hábitos diários (alimentação, sono, exercício, estresse) com dados de saúde. Ele sobe quando você é consistente e ajuda a gamificar sua jornada de longevidade.',
  },
  {
    question: 'Quando lança?',
    answer:
      'Estamos em construção pública. Entre na lista de espera para ter acesso antecipado e ajudar a moldar o produto. Lançamento previsto para o primeiro semestre de 2026.',
  },
];

// Comparison features
const comparisonFeatures = [
  { name: 'AI de ajuste em tempo real', free: true, plus: true },
  { name: 'Registro de refeições', free: true, plus: true },
  { name: 'Estimativas de nutrientes', free: true, plus: true },
  { name: 'Livvay Score', free: true, plus: true },
  { name: 'Liga Livvay (ranking)', free: true, plus: true },
  { name: 'Nutricionista dedicado', free: false, plus: true },
  { name: 'Médico clínico', free: false, plus: true },
  { name: 'Psicólogo comportamental', free: false, plus: true },
  { name: 'Consultas mensais', free: false, plus: 'Ilimitadas' },
  { name: 'Pedido de exames', free: false, plus: true },
  { name: 'Prescrição quando indicada', free: false, plus: true },
  { name: 'Plano personalizado avançado', free: false, plus: true },
];

// Leaderboard mock data
const leaderboardData = [
  { rank: 1, name: 'Marina Silva', score: 9847, city: 'São Paulo, SP' },
  { rank: 2, name: 'Carlos Eduardo', score: 9652, city: 'Rio de Janeiro, RJ' },
  { rank: 3, name: 'Ana Beatriz', score: 9438, city: 'Belo Horizonte, MG' },
  { rank: 4, name: 'Pedro Henrique', score: 9215, city: 'Curitiba, PR' },
  { rank: 5, name: 'Juliana Costa', score: 9103, city: 'Porto Alegre, RS' },
];

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0B] via-[#0A0A0B] to-[#111113]" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#00E676]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#00E676]/3 rounded-full blur-[100px]" />

        <Container className="relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column - Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Status Badges */}
              <div className="flex flex-wrap gap-3 mb-6">
                <Badge variant="premium">Em construção pública</Badge>
                <Badge variant="info">Acesso antecipado</Badge>
              </div>

              {/* Headline */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Você não quer morrer.{' '}
                <span className="gradient-text">O Livvay também não.</span>
              </h1>

              {/* Subheadline */}
              <p className="text-lg md:text-xl text-[#A1A1AA] mb-4 max-w-xl">
                Um assistente de longevidade que transforma tudo que você come, dorme e faz em um plano simples, ajustado em tempo real.{' '}
                <span className="text-white font-medium">Rumo à vida eterna, com método.</span>
              </p>

              {/* Microcopy */}
              <p className="text-[#71717A] mb-8">
                Sem termos difíceis. Sem terrorismo. Só direção clara.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button href="/score" size="lg">
                  Calcular meu Livvay Score
                  <ArrowRight className="w-5 h-5" />
                </Button>
                <Button href="#waitlist" variant="secondary" size="lg">
                  Entrar na lista de espera
                </Button>
              </div>

              {/* Email Capture */}
              <div className="pt-6 border-t border-[#27272A]">
                <p className="text-sm text-[#71717A] mb-3">
                  Ou entre direto na lista de espera:
                </p>
                <EmailCaptureForm source="hero" buttonText="Quero acesso" />
              </div>
            </motion.div>

            {/* Right Column - Phone Mock */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative flex justify-center lg:justify-end"
            >
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute -inset-4 bg-[#00E676]/10 rounded-[50px] blur-2xl" />
        <Image
                  src="/mock-phone.svg"
                  alt="Livvay App mostrando o painel do dia com Score, registro de comida e progresso"
                  width={280}
                  height={560}
                  className="relative z-10"
          priority
                />
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* Section 1: A Dor (Pain Points) */}
      <Section background="darker">
        <SectionHeader
          title="O problema não é saber. É fazer todo dia."
          badge="A realidade"
        />
        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              text: 'Você começa segunda. Desiste quarta.',
              bg: 'bg-gradient-to-br from-[#EF4444]/10 to-transparent',
            },
            {
              text: 'Você tem dados. Mas não tem decisão.',
              bg: 'bg-gradient-to-br from-[#F97316]/10 to-transparent',
            },
            {
              text: "Você tenta 'ser saudável'. Sem um sistema, vira sorte.",
              bg: 'bg-gradient-to-br from-[#EAB308]/10 to-transparent',
            },
            {
              text: 'Você não quer morrer. Mas vive como se desse tempo.',
              bg: 'bg-gradient-to-br from-[#8B5CF6]/10 to-transparent',
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`p-8 rounded-2xl border border-[#27272A] ${item.bg}`}
            >
              <p className="text-xl md:text-2xl font-semibold text-white">
                {item.text}
              </p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Section 2: O que é o Livvay */}
      <Section>
        <SectionHeader
          title="Livvay é um copiloto para a eternidade"
          subtitle="Você registra o básico. A AI e o time te guiam no resto."
          badge="A solução"
        />
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Brain,
              title: 'AI em tempo real',
              description: 'Registrou comida, o dia inteiro recalcula.',
              example: 'Exemplo: almoçou pouca proteína? O jantar já sugere compensar.',
            },
            {
              icon: Users,
              title: 'Time humano no Plus',
              description: 'Médico, nutri, psicólogo comportamental.',
              example: 'Exemplo: compulsão por doce? O psicólogo trabalha a causa.',
            },
            {
              icon: Trophy,
              title: 'Liga Livvay',
              description: 'Saúde vira jogo, com ranking e benefícios.',
              example: 'Exemplo: seu Score subiu? Desconto na academia liberado.',
            },
          ].map((pillar, index) => (
            <Card key={index} variant="highlight" className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#00E676]/10 flex items-center justify-center">
                <pillar.icon className="w-8 h-8 text-[#00E676]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{pillar.title}</h3>
              <p className="text-[#A1A1AA] mb-4">{pillar.description}</p>
              <p className="text-sm text-[#00E676] bg-[#00E676]/10 px-4 py-2 rounded-lg">
                {pillar.example}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      {/* Section 3: Como funciona (4 passos) */}
      <Section background="darker">
        <SectionHeader
          title="4 passos. Sem palavras difíceis."
          badge="Como funciona"
        />
        <div className="max-w-3xl mx-auto">
          {[
            {
              step: 1,
              title: 'Você registra',
              description: 'Comida, sono, treino, humor (do seu jeito).',
              icon: Target,
            },
            {
              step: 2,
              title: 'A AI ajusta',
              description:
                'Estima micro e macro, projeta lacunas do dia, sugere próximos passos.',
              icon: Brain,
              cta: true,
            },
            {
              step: 3,
              title: 'O Plus acompanha',
              description:
                'Equipe revisa, pede exames quando faz sentido, ajusta compulsões, orienta e prescreve quando indicado.',
              icon: Users,
              note: true,
            },
            {
              step: 4,
              title: 'Você sobe de liga',
              description:
                'Livvay Score melhora, benefícios destravam, consistência vira vitória.',
              icon: Trophy,
            },
          ].map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative pl-20 pb-12 last:pb-0"
            >
              {/* Timeline line */}
              {index < 3 && (
                <div className="absolute left-[39px] top-16 w-0.5 h-full bg-gradient-to-b from-[#00E676] to-[#27272A]" />
              )}
              {/* Step number */}
              <div className="absolute left-0 top-0 w-20 h-20 rounded-2xl bg-[#00E676]/10 border border-[#00E676]/30 flex items-center justify-center">
                <span className="text-3xl font-bold text-[#00E676]">{item.step}</span>
              </div>
              {/* Content */}
              <div className="pt-2">
                <div className="flex items-center gap-3 mb-2">
                  <item.icon className="w-5 h-5 text-[#00E676]" />
                  <h3 className="text-xl font-bold text-white">{item.title}</h3>
                </div>
                <p className="text-[#A1A1AA] mb-4">{item.description}</p>
                {item.cta && (
                  <Button href="/score" size="sm">
                    Quero meu Score
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
                {item.note && (
                  <p className="text-xs text-[#71717A] mt-4 p-3 bg-[#1A1A1D] rounded-lg border border-[#27272A]">
                    ⚠️ Nota: O Livvay Plus não substitui emergências médicas. Condutas dependem de avaliação clínica individualizada. Resultados variam de pessoa para pessoa.
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Section 4: AI do Livvay */}
      <Section>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <Badge variant="premium" className="mb-4">Tecnologia</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              A AI do Livvay não é chat.{' '}
              <span className="gradient-text">É motor de decisão.</span>
            </h2>
            <ul className="space-y-4">
              {[
                'Registrou um alimento, o restante do dia se ajusta.',
                'Estimativas de micronutrientes e "painel do sangue" probabilístico, para orientar escolhas, não para diagnosticar.',
                'Sugestões de treino, descanso e rotina com base no seu contexto real.',
                'Sem termos técnicos. Modo simples para qualquer pessoa.',
              ].map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle className="w-5 h-5 text-[#00E676] flex-shrink-0 mt-0.5" />
                  <span className="text-[#A1A1AA]">{item}</span>
                </motion.li>
              ))}
            </ul>
          </div>
          {/* AI Panel Mock */}
          <div className="bg-[#111113] rounded-2xl border border-[#27272A] p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#00E676]" />
              Painel do dia
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Proteína', value: 78, color: 'bg-[#00E676]' },
                { label: 'Fibras', value: 50, color: 'bg-[#EAB308]' },
                { label: 'Sono', value: 90, color: 'bg-[#8B5CF6]' },
                { label: 'Hidratação', value: 65, color: 'bg-[#3B82F6]' },
                { label: 'Estresse', value: 30, color: 'bg-[#22C55E]', inverted: true },
              ].map((metric) => (
                <div key={metric.label} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white">{metric.label}</span>
                    <span className="text-[#71717A]">{metric.value}%</span>
                  </div>
                  <div className="h-2 bg-[#27272A] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${metric.value}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className={`h-full rounded-full ${metric.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Section 5: Livvay Plus */}
      <Section background="darker" id="plus">
        <SectionHeader
          title="Livvay Plus: você + AI + equipe médica"
          subtitle="Você não precisa virar especialista. Você precisa ser acompanhado."
          badge="Plus"
        />
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Features List */}
          <div className="space-y-4">
            {[
              { icon: Heart, text: 'Nutricionista dedicado' },
              { icon: Shield, text: 'Médico clínico' },
              { icon: Brain, text: 'Psicólogo comportamental' },
              { icon: Clock, text: 'Consultas mensais focadas em performance' },
              { icon: TrendingUp, text: 'Revisão de dieta, ajustes de compulsão, pedido de exames' },
              { icon: Zap, text: 'Prescrição e ajustes terapêuticos quando indicado' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-4 p-4 bg-[#111113] rounded-xl border border-[#27272A]"
              >
                <div className="w-10 h-10 rounded-lg bg-[#00E676]/10 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-[#00E676]" />
                </div>
                <span className="text-white">{item.text}</span>
              </motion.div>
            ))}
            <div className="pt-4">
              <Button href="/plus" variant="outline" className="w-full sm:w-auto">
                Conhecer o Plus
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Comparison Table */}
          <Card variant="glass">
            <h3 className="text-xl font-bold text-white mb-6">Grátis vs Plus</h3>
            <ComparisonTable features={comparisonFeatures.slice(0, 8)} />
            <Link href="/plus" className="block mt-4 text-center text-[#00E676] hover:underline text-sm">
              Ver comparação completa →
            </Link>
          </Card>
        </div>
      </Section>

      {/* Section 6: Liga Livvay */}
      <Section id="liga">
        <SectionHeader
          title="Liga Livvay: a competição mais saudável do país"
          subtitle="Sua saúde vira jogo. Com ranking municipal, estadual e nacional."
          badge="Liga"
        />
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Leaderboard */}
          <Leaderboard entries={leaderboardData} />

          {/* Rewards */}
          <div>
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Award className="w-5 h-5 text-[#EAB308]" />
              Benefícios destravados pelo Score
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: '🏋️', title: 'Academias', desc: 'Acesso a rede parceira' },
                { icon: '💊', title: 'Suplementos', desc: 'Descontos exclusivos' },
                { icon: '🥗', title: 'Mercados', desc: 'Cashback em saudáveis' },
                { icon: '🏥', title: 'Planos de saúde', desc: 'Desconto na mensalidade' },
              ].map((reward, index) => (
                <Card key={index} className="text-center p-4">
                  <span className="text-3xl mb-2 block">{reward.icon}</span>
                  <h4 className="font-semibold text-white mb-1">{reward.title}</h4>
                  <p className="text-sm text-[#71717A]">{reward.desc}</p>
                </Card>
              ))}
            </div>
            <div className="mt-6">
              <Button href="/liga" variant="secondary" className="w-full">
                Entrar na Liga
                <Trophy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Section>

      {/* Section 7: LLL Foundation */}
      <Section background="darker" id="foundation">
        <div className="max-w-3xl mx-auto text-center">
          <Badge variant="info" className="mb-4">LLL</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Parte do lucro vira pesquisa de verdade
          </h2>
          <p className="text-lg text-[#A1A1AA] mb-8">
            A LLL (Livvay Life Foundation) financia um laboratório focado em longevidade, biohacking e pesquisa científica de longo prazo.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[
              'A missão é acelerar ciência aplicada para ampliar healthspan.',
              'Inclui linhas de pesquisa avançadas, como biotecnologia e genética, sempre no campo científico e regulatório.',
              'Transparência anual: relatório público do que foi financiado.',
            ].map((text, index) => (
              <div
                key={index}
                className="p-6 bg-[#111113] rounded-xl border border-[#27272A]"
              >
                <p className="text-[#A1A1AA]">{text}</p>
              </div>
            ))}
          </div>
          <Button href="/foundation" variant="outline">
            Conhecer a LLL
          </Button>
          <p className="text-sm text-[#71717A] mt-4">
            Relatório anual (em breve)
          </p>
        </div>
      </Section>

      {/* Section 8: Acessível de verdade */}
      <Section>
        <SectionHeader
          title="O Livvay explica como se você fosse meu pai ou minha avó"
          subtitle="Sem siglas. Sem dieta maluca. Sem humilhação."
          badge="Acessibilidade"
        />
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: 'Proteína?',
              description: 'A gente mostra com comida de verdade.',
              example: '"2 ovos = 14g de proteína"',
            },
            {
              title: 'Fibras?',
              description: 'A gente mostra no prato, não no PDF.',
              example: '"Adiciona uma banana e você bate a meta"',
            },
            {
              title: 'Sono?',
              description: 'A gente melhora com passos pequenos.',
              example: '"Desliga a tela 30min antes"',
            },
          ].map((item, index) => (
            <Card key={index}>
              <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
              <p className="text-[#A1A1AA] mb-4">{item.description}</p>
              <div className="p-3 bg-[#00E676]/10 rounded-lg border border-[#00E676]/20">
                <p className="text-sm text-[#00E676]">{item.example}</p>
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Badge variant="success">✓ Modo simples ativado</Badge>
        </div>
      </Section>

      {/* Section 9: FAQ */}
      <Section background="darker">
        <SectionHeader
          title="Perguntas frequentes"
          badge="FAQ"
        />
        <div className="max-w-3xl mx-auto">
          <FAQ items={faqItems} />
        </div>
      </Section>

      {/* Section 10: CTA Final */}
      <section
        id="waitlist"
        className="relative py-24 md:py-32 overflow-hidden"
      >
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#00E676]/20 via-[#0A0A0B] to-[#0A0A0B]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#00E676]/10 rounded-full blur-[120px]" />

        <Container className="relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Se você não quer morrer,{' '}
                <span className="gradient-text">entra agora</span>
              </h2>
              <p className="text-lg text-[#A1A1AA] mb-8">
                Faça o diagnóstico e receba seu plano base.
              </p>
              <Button href="/score" size="lg" className="animate-pulse-glow">
                Calcular meu Score
                <ArrowRight className="w-5 h-5" />
              </Button>
              <div className="mt-8 pt-8 border-t border-[#27272A]/50">
                <p className="text-sm text-[#71717A] mb-4">
                  Ou entre na lista de espera:
                </p>
                <EmailCaptureForm
                  source="cta-final"
                  buttonText="Entrar na lista"
                  className="max-w-md mx-auto"
                />
              </div>
            </motion.div>
    </div>
        </Container>
      </section>
    </>
  );
}
