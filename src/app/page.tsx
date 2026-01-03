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

// FAQ Data - linguagem acessível para todas as idades e níveis de educação
const faqItems = [
  {
    question: 'Nunca fiz dieta. Consigo usar?',
    answer:
      'Consegue. O Livvay explica tudo como se fosse pro seu avô. Foto da comida, ele entende. Sem conta, sem fórmula.',
  },
  {
    question: 'Preciso de relógio smart?',
    answer:
      'Não. Ajuda, mas não precisa. Só o celular resolve. Você registra, a gente calcula.',
  },
  {
    question: 'O Plus substitui meu médico?',
    answer:
      'Não substitui. Complementa. Nossa equipe orienta, pede exame quando faz sentido, prescreve quando indicado. Emergência? Vai pro hospital.',
  },
  {
    question: 'Vida eterna é promessa?',
    answer:
      'É direção, não promessa. O que entregamos: método, acompanhamento, consistência. Você vive mais e melhor. Sem mágica.',
  },
  {
    question: 'O que é o Score?',
    answer:
      'Um número que mostra como você está. Come bem, dorme bem, se mexe? Sobe. Relaxa demais? Desce. Simples assim.',
  },
  {
    question: 'Quando posso usar?',
    answer:
      'Estamos construindo em público. Entra na lista, ganha acesso antes de todo mundo. Previsão: primeiro semestre de 2026.',
  },
];

// Comparison features - linguagem direta e acessível
const comparisonFeatures = [
  { name: 'AI que ajusta seu dia', free: true, plus: true },
  { name: 'Registrar o que come', free: true, plus: true },
  { name: 'Ver nutrientes da comida', free: true, plus: true },
  { name: 'Seu Score de saúde', free: true, plus: true },
  { name: 'Ranking com outros usuários', free: true, plus: true },
  { name: 'Nutricionista só pra você', free: false, plus: true },
  { name: 'Médico só pra você', free: false, plus: true },
  { name: 'Psicólogo só pra você', free: false, plus: true },
  { name: 'Consultas por mês', free: false, plus: 'Sem limite' },
  { name: 'Pedir exames', free: false, plus: true },
  { name: 'Receita médica', free: false, plus: true },
  { name: 'Plano feito pra você', free: false, plus: true },
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
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-surface-100" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand/3 rounded-full blur-[100px]" />

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
                <Badge variant="premium">Build in public</Badge>
                <Badge variant="info">Entre antes de todo mundo</Badge>
              </div>

              {/* Headline */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-foreground">
                Seu coach de saúde{' '}
                <span className="gradient-text">pra vida toda.</span>
              </h1>

              {/* Subheadline */}
              <p className="text-lg md:text-xl text-foreground-light mb-4 max-w-xl">
                AI + médicos de verdade te acompanhando todo dia.{' '}
                <span className="text-foreground font-medium">Pra você viver mais. E melhor.</span>
              </p>

              {/* Microcopy */}
              <p className="text-foreground-muted mb-8">
                Sem termo difícil. Sem dieta maluca. Só o próximo passo certo.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button href="/score" size="large" iconRight={<ArrowRight />}>
                  Ver meu Score grátis
                </Button>
                <Button href="#waitlist" type="default" size="large">
                  Entrar na lista
                </Button>
              </div>

              {/* Email Capture */}
              <div className="pt-6 border-t border-border">
                <p className="text-sm text-foreground-muted mb-3">
                  Deixa seu email e entra na frente:
                </p>
                <EmailCaptureForm source="hero" buttonText="Quero entrar" />
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
                <div className="absolute -inset-4 bg-brand/10 rounded-[50px] blur-2xl" />
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
          title="O problema não é querer. É conseguir."
          badge="A verdade"
        />
        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              icon: Clock,
              text: 'Segunda você começa. Quarta já parou.',
            },
            {
              icon: Brain,
              text: 'Você sabe o que fazer. Mas não faz.',
            },
            {
              icon: Users,
              text: 'Sozinho, todo mundo desiste.',
            },
            {
              icon: Heart,
              text: 'Você quer viver muito. Mas age como se tivesse tempo de sobra.',
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="rounded-md border border-border bg-surface-100 p-6"
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-surface-200">
                  <item.icon size={18} className="text-brand" aria-hidden="true" />
                </div>
                <p className="text-lg md:text-xl font-semibold text-foreground leading-snug">
                  {item.text}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Section 2: A Missão - Imortalidade */}
      <Section>
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="premium" className="mb-6">Nossa missão</Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              A gente quer te tornar{' '}
              <span className="gradient-text">imortal.</span>
            </h2>
            <p className="text-xl md:text-2xl text-foreground-light mb-4 max-w-3xl mx-auto">
              Sério. O objetivo é fazer você viver até o dia em que a ciência consiga parar o envelhecimento.
            </p>
            <p className="text-lg text-foreground-muted mb-8 max-w-2xl mx-auto">
              Quando esse dia chegar, você vai estar lá. Saudável. Jovem. Vivo.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              {[
                {
                  icon: TrendingUp,
                  title: 'Rejuvenescer',
                  description: 'Não é só parar de envelhecer. É voltar atrás.',
                },
                {
                  icon: Target,
                  title: 'Viver mais',
                  description: 'Cada ano saudável é um ano mais perto da cura.',
                },
                {
                  icon: Sparkles,
                  title: 'Ser imortal',
                  description: 'Quando for possível, você vai estar vivo pra ver.',
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 bg-surface-100 rounded-2xl border border-border"
                >
                  <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-brand/10 flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-brand" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-foreground-muted">{item.description}</p>
                </motion.div>
              ))}
            </div>
            <div className="mt-10 max-w-2xl mx-auto p-5 bg-brand/5 rounded-xl border border-brand/20 flex gap-4 items-start">
              <Target className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-foreground-light text-sm">
                A ciência aponta que, nos próximos 50 anos, chegaremos ao ponto em que o envelhecimento para. Mas quando isso acontecer, você precisa estar lá — vivo, saudável, na sua melhor forma. O Livvay existe pra isso.
              </p>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* Section 3: O que é o Livvay */}
      <Section background="darker">
        <SectionHeader
          title="Seu parceiro nessa jornada"
          subtitle="Você registra. A gente cuida do resto."
          badge="Como funciona"
        />
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Brain,
              title: 'AI que aprende você',
              description: 'Comeu algo? O dia inteiro se ajusta.',
              example: 'Pouca proteína no almoço? O jantar já sugere compensar.',
            },
            {
              icon: Users,
              title: 'Médicos de verdade',
              description: 'Nutri, clínico, psicólogo. Todos pra você.',
              example: 'Come doce demais? O psicólogo descobre o porquê.',
            },
            {
              icon: Trophy,
              title: 'Saúde vira jogo',
              description: 'Ranking, prêmios, descontos. Quanto melhor você fica, mais ganha.',
              example: 'Score alto? Academia com desconto.',
            },
          ].map((pillar, index) => (
            <Card key={index} variant="highlight" className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-brand/10 flex items-center justify-center">
                <pillar.icon className="w-8 h-8 text-brand" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{pillar.title}</h3>
              <p className="text-foreground-light mb-4">{pillar.description}</p>
              <p className="text-sm text-brand bg-brand/10 px-4 py-2 rounded-lg">
                {pillar.example}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      {/* Section 3: Como funciona (4 passos) */}
      <Section background="darker">
        <SectionHeader
          title="Funciona assim"
          badge="Passo a passo"
        />
        <div className="max-w-3xl mx-auto">
          {[
            {
              step: 1,
              title: 'Você conta o que fez',
              description: 'Comeu o quê? Dormiu quanto? Se mexeu? Conta pra gente.',
              icon: Target,
            },
            {
              step: 2,
              title: 'A AI monta seu dia',
              description:
                'Ela vê o que falta, o que sobra, e te diz o próximo passo.',
              icon: Brain,
              cta: true,
            },
            {
              step: 3,
              title: 'Médicos te acompanham',
              description:
                'Nutri, clínico, psicólogo. Pedem exame quando precisa. Prescrevem quando faz sentido.',
              icon: Users,
            },
            {
              step: 4,
              title: 'Você ganha recompensas',
              description:
                'Score sobe, desconto na academia, cashback em comida saudável. Saúde que paga.',
              icon: Trophy,
            },
          ].map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative pl-24 pb-8 last:pb-0"
            >
              {/* Timeline line - connects step circles */}
              {index < 3 && (
                <div 
                  className="absolute left-[39px] top-20 w-0.5 bg-gradient-to-b from-brand/50 to-border -z-10" 
                  style={{ height: 'calc(100% - 32px)' }}
                />
              )}
              {/* Step number */}
              <div className="absolute left-0 top-0 w-20 h-20 rounded-2xl bg-brand/10 border border-brand/30 flex items-center justify-center z-10">
                <span className="text-3xl font-bold text-brand">{item.step}</span>
              </div>
              {/* Content */}
              <div className="pt-4">
                <div className="flex items-center gap-3 mb-2">
                  <item.icon size={20} className="text-brand shrink-0" aria-hidden="true" />
                  <h3 className="text-xl font-bold text-foreground">{item.title}</h3>
                </div>
                <p className="text-foreground-light">{item.description}</p>
                {item.cta && (
                  <div className="mt-4">
                    <Button href="/score" size="small" iconRight={<ArrowRight />}>
                      Ver meu Score
                    </Button>
                  </div>
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
            <Badge variant="premium" className="mb-4">Inteligência</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Uma AI que entende{' '}
              <span className="gradient-text">o que você precisa.</span>
            </h2>
            <ul className="space-y-4">
              {[
                'Errou? Ela ajusta tudo na hora: próxima refeição, resto do dia, até a semana.',
                'Mostra o que falta: proteína, fibra, água, vitaminas, minerais.',
                'Sugere o que comer, quando dormir, se deve ou não treinar.',
                'Explica tudo de forma simples e direta.',
              ].map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="text-foreground-light">{item}</span>
                </motion.li>
              ))}
            </ul>
          </div>
          {/* AI Panel Mock */}
          <div className="bg-surface-100 rounded-2xl border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand" aria-hidden="true" />
              <span>Seu dia hoje</span>
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Proteína', value: 78, color: 'bg-brand' },
                { label: 'Fibras', value: 50, color: 'bg-warning' },
                { label: 'Sono', value: 90, color: 'bg-brand-400' },
                { label: 'Água', value: 65, color: 'bg-brand-300' },
                { label: 'Exercícios', value: 85, color: 'bg-brand' },
                { label: 'Alongamentos', value: 40, color: 'bg-warning' },
                { label: 'Higiene', value: 95, color: 'bg-success' },
                { label: 'Hábitos de longevidade', value: 72, color: 'bg-brand-400' },
                { label: 'Estresse', value: 30, color: 'bg-success' },
              ].map((metric) => (
                <div key={metric.label} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground">{metric.label}</span>
                    <span className="text-foreground-muted">{metric.value}%</span>
                  </div>
                  <div className="h-2 bg-surface-300 rounded-full overflow-hidden">
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

      {/* Section 5: Equipe médica */}
      <Section background="darker" id="plus">
        <SectionHeader
          title="Médicos de verdade. Só pra você."
          subtitle="Nutri, clínico, psicólogo. Todos olhando seus dados e te guiando."
          badge="Equipe completa"
        />
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Features List */}
          <div className="space-y-4">
            {[
              { icon: Heart, text: 'Nutricionista que conhece você' },
              { icon: Shield, text: 'Médico que acompanha sua saúde' },
              { icon: Brain, text: 'Psicólogo que entende seus hábitos' },
              { icon: Clock, text: 'Consultas quando você precisar' },
              { icon: TrendingUp, text: 'Exames pedidos quando faz sentido' },
              { icon: Zap, text: 'Receita quando indicado' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-4 p-4 bg-surface-100 rounded-xl border border-border"
              >
                <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-brand" aria-hidden="true" />
                </div>
                <span className="text-foreground">{item.text}</span>
              </motion.div>
            ))}
            <div className="pt-4">
              <Button href="/plus" type="outline" iconRight={<ArrowRight />} className="w-full sm:w-auto">
                Ver como funciona
              </Button>
            </div>
          </div>

          {/* Comparison Table */}
          <Card variant="glass">
            <h3 className="text-xl font-bold text-foreground mb-6">O que você ganha</h3>
            <ComparisonTable features={comparisonFeatures.slice(0, 8)} />
            <Link href="/plus" className="block mt-4 text-center text-brand hover:underline text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded">
              Ver tudo →
            </Link>
          </Card>
        </div>
      </Section>

      {/* Section 6: Liga Livvay */}
      <Section id="liga">
        <SectionHeader
          title="Saúde que dá prêmio"
          subtitle="Ranking com todo mundo. Quanto melhor você fica, mais você ganha."
          badge="Liga Livvay"
        />
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Leaderboard */}
          <Leaderboard entries={leaderboardData} />

          {/* Rewards */}
          <div>
            <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Award className="w-5 h-5 text-warning" aria-hidden="true" />
              <span>Score alto = benefícios</span>
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: '🏋️', title: 'Academia', desc: 'Desconto na mensalidade' },
                { icon: '💊', title: 'Suplementos', desc: 'Preço especial' },
                { icon: '🥗', title: 'Mercado', desc: 'Cashback em comida boa' },
                { icon: '🏥', title: 'Plano de saúde', desc: 'Mensalidade menor' },
              ].map((reward, index) => (
                <Card key={index} className="text-center p-4">
                  <span className="text-3xl mb-2 block" aria-hidden="true">{reward.icon}</span>
                  <h4 className="font-semibold text-foreground mb-1">{reward.title}</h4>
                  <p className="text-sm text-foreground-muted">{reward.desc}</p>
                </Card>
              ))}
            </div>
            <div className="mt-6">
              <Button href="/liga" type="default" iconRight={<Trophy />} className="w-full">
                Ver a Liga
              </Button>
            </div>
          </div>
        </div>
      </Section>

      {/* Section 7: L3 Research */}
      <Section background="darker" id="foundation">
        <div className="max-w-3xl mx-auto text-center">
          <Badge variant="info" className="mb-4">Livvay Longevity Labs</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            A ciência por trás da{' '}
            <span className="gradient-text">sua imortalidade.</span>
          </h2>
          <p className="text-lg text-foreground-light mb-8">
            O L3 é o laboratório de pesquisa do Livvay. A gente estuda o que realmente funciona pra viver mais — e coloca direto no seu app.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[
              {
                icon: TrendingUp,
                title: 'Dados reais',
                text: 'Milhares de pessoas usando. A gente vê o que funciona de verdade.',
              },
              {
                icon: Sparkles,
                title: 'Melhora contínua',
                text: 'Cada descoberta vira uma sugestão melhor pra você.',
              },
              {
                icon: Shield,
                title: 'Transparência total',
                text: 'Tudo público. Você vê onde o dinheiro vai e o que a gente descobre.',
              },
            ].map((item, index) => (
              <div
                key={index}
                className="p-6 bg-surface-100 rounded-xl border border-border"
              >
                <div className="w-10 h-10 mx-auto mb-4 rounded-lg bg-brand/10 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-brand" aria-hidden="true" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-foreground-light">{item.text}</p>
              </div>
            ))}
          </div>
          <Button href="/foundation" type="outline">
            Conhecer o L3
          </Button>
        </div>
      </Section>

      {/* Section 8: Acessível de verdade */}
      <Section>
        <SectionHeader
          title="Feito pra qualquer pessoa entender"
          subtitle="Seu avô entende. Seu filho entende. Você entende."
          badge="Simples de verdade"
        />
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: 'Proteína?',
              description: 'A gente mostra com comida.',
              example: '"2 ovos = 14g de proteína"',
            },
            {
              title: 'Fibras?',
              description: 'A gente mostra no prato.',
              example: '"Come uma banana que bate a meta"',
            },
            {
              title: 'Sono?',
              description: 'A gente dá dicas fáceis.',
              example: '"Desliga o celular 30min antes de dormir"',
            },
          ].map((item, index) => (
            <Card key={index}>
              <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
              <p className="text-foreground-light mb-4">{item.description}</p>
              <div className="p-3 bg-brand/10 rounded-lg border border-brand/20">
                <p className="text-sm text-brand">{item.example}</p>
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Badge variant="success">Sem palavra difícil</Badge>
        </div>
      </Section>

      {/* Section 9: FAQ */}
      <Section background="darker">
        <SectionHeader
          title="Dúvidas comuns"
          badge="Perguntas"
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
        <div className="absolute inset-0 bg-gradient-to-br from-brand/20 via-background to-background" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand/10 rounded-full blur-[120px]" />

        <Container className="relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
                Quer viver mais?{' '}
                <span className="gradient-text">Começa aqui.</span>
              </h2>
              <p className="text-lg text-foreground-light mb-8">
                Descobre seu Score. É grátis. Leva 2 minutos.
              </p>
              <Button href="/score" size="large" iconRight={<ArrowRight />} className="animate-pulse-glow">
                Ver meu Score
              </Button>
              <div className="mt-8 pt-8 border-t border-border/50">
                <p className="text-sm text-foreground-muted mb-4">
                  Ou deixa seu email e entra antes de todo mundo:
                </p>
                <EmailCaptureForm
                  source="cta-final"
                  buttonText="Quero entrar"
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
