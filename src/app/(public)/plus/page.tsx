'use client';

import { motion } from 'framer-motion';
import {
  Users,
  Brain,
  Shield,
  TrendingUp,
  Zap,
  CheckCircle,
  ArrowRight,
  Calendar,
  Stethoscope,
  Apple,
  MessageCircle,
  FileText,
  Pill,
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Section, SectionHeader } from '@/components/ui/Section';
import { ComparisonTable } from '@/components/ui/ComparisonTable';
import { EmailCaptureForm } from '@/components/forms/EmailCaptureForm';

const comparisonFeatures = [
  { name: 'AI de ajuste em tempo real', free: true, plus: true },
  { name: 'Registro de refeições e hábitos', free: true, plus: true },
  { name: 'Estimativas de nutrientes', free: true, plus: true },
  { name: 'Livvay Score', free: true, plus: true },
  { name: 'Liga Livvay (ranking e recompensas)', free: true, plus: true },
  { name: 'Nutricionista dedicado', free: false, plus: true },
  { name: 'Médico clínico', free: false, plus: true },
  { name: 'Psicólogo comportamental', free: false, plus: true },
  { name: 'Consultas mensais', free: false, plus: 'Ilimitadas' },
  { name: 'Revisão de dieta registrada', free: false, plus: true },
  { name: 'Ajustes de compulsões', free: false, plus: true },
  { name: 'Pedido de exames quando necessário', free: false, plus: true },
  { name: 'Prescrição quando indicada', free: false, plus: true },
  { name: 'Plano personalizado avançado', free: false, plus: true },
  { name: 'Suporte prioritário', free: false, plus: true },
];

const monthlyTimeline = [
  {
    month: 'Mês 1',
    title: 'Avaliação inicial',
    items: [
      'Consulta com médico para entender seu histórico',
      'Avaliação nutricional completa',
      'Definição de metas realistas',
      'Configuração do app personalizada',
    ],
  },
  {
    month: 'Mês 2',
    title: 'Ajustes e calibragem',
    items: [
      'Revisão do primeiro mês de dados',
      'Ajuste fino do plano alimentar',
      'Sessão com psicólogo (se necessário)',
      'Pedido de exames iniciais',
    ],
  },
  {
    month: 'Mês 3',
    title: 'Consolidação',
    items: [
      'Análise de resultados de exames',
      'Refinamento de suplementação',
      'Avaliação de progresso no Score',
      'Plano para próximo trimestre',
    ],
  },
  {
    month: 'Contínuo',
    title: 'Acompanhamento',
    items: [
      'Check-ins mensais com equipe',
      'Ajustes conforme necessidade',
      'Suporte via chat quando precisar',
      'Evolução constante do plano',
    ],
  },
];

const team = [
  {
    role: 'Nutricionista',
    icon: Apple,
    description: 'Revisa sua alimentação real, ajusta macros e micros, sugere substituições práticas.',
    example: 'Exemplo: "Troca o pão por tapioca só 3x na semana, já melhora sua fibra."',
  },
  {
    role: 'Médico Clínico',
    icon: Stethoscope,
    description: 'Avalia exames, prescreve quando indicado, monitora saúde geral.',
    example: 'Exemplo: "Sua vitamina D está baixa. Vamos suplementar por 3 meses e reavaliar."',
  },
  {
    role: 'Psicólogo Comportamental',
    icon: Brain,
    description: 'Trabalha padrões sabotadores, compulsões, ansiedade que afeta hábitos.',
    example: 'Exemplo: "Quando você come à noite, o gatilho é tédio ou ansiedade?"',
  },
];

export default function PlusPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-surface-100" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand/5 rounded-full blur-[120px]" />

        <Container className="relative z-10">
          <div className="max-w-3xl">
            <Badge variant="premium" className="mb-4">Livvay Plus</Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-foreground">
              Você + AI +{' '}
              <span className="gradient-text">equipe médica</span>
            </h1>
            <p className="text-xl text-foreground-light mb-8">
              Você não precisa virar especialista. Você precisa ser acompanhado por quem entende. 
              O Plus une a inteligência artificial do Livvay com profissionais de saúde dedicados a você.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button href="#waitlist-plus" size="large" iconRight={<ArrowRight />}>
                Entrar na lista do Plus
              </Button>
              <Button href="/score" type="default" size="large">
                Calcular meu Score primeiro
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Team Section */}
      <Section>
        <SectionHeader
          title="Sua equipe dedicada"
          subtitle="Profissionais que revisam seus dados e te guiam com base no seu contexto real."
          badge="Equipe"
        />
        <div className="grid md:grid-cols-3 gap-8">
          {team.map((member, index) => (
            <motion.div
              key={member.role}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card variant="highlight" className="h-full">
                <div className="w-14 h-14 rounded-2xl bg-brand/10 flex items-center justify-center mb-6">
                  <member.icon className="w-7 h-7 text-brand" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{member.role}</h3>
                <p className="text-foreground-light mb-4">{member.description}</p>
                <div className="p-4 bg-background rounded-xl border border-border">
                  <p className="text-sm text-brand">{member.example}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Timeline */}
      <Section background="darker">
        <SectionHeader
          title="O que acontece em cada mês"
          subtitle="Uma jornada estruturada para resultados consistentes."
          badge="Jornada"
        />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {monthlyTimeline.map((phase, index) => (
            <motion.div
              key={phase.month}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-brand" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-brand text-sm font-medium">{phase.month}</p>
                    <h3 className="text-foreground font-semibold">{phase.title}</h3>
                  </div>
                </div>
                <ul className="space-y-2" role="list">
                  {phase.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground-light" role="listitem">
                      <CheckCircle className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          ))}
        </div>
      </Section>


      {/* Comparison */}
      <Section background="darker">
        <SectionHeader
          title="Grátis vs Plus"
          subtitle="Compare os planos e escolha o que faz sentido para você."
          badge="Comparação"
        />
        <div className="max-w-3xl mx-auto">
          <Card variant="glass">
            <ComparisonTable features={comparisonFeatures} />
          </Card>
        </div>
      </Section>

      {/* Features Grid */}
      <Section>
        <SectionHeader
          title="Tudo que você tem no Plus"
          badge="Recursos"
        />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Users, title: 'Equipe dedicada', desc: 'Nutri, médico e psicólogo que conhecem você' },
            { icon: MessageCircle, title: 'Chat com suporte', desc: 'Tire dúvidas quando precisar' },
            { icon: FileText, title: 'Pedido de exames', desc: 'Quando faz sentido clínico' },
            { icon: Pill, title: 'Prescrição', desc: 'Quando indicado pelo médico' },
            { icon: TrendingUp, title: 'Plano avançado', desc: 'Personalizado pro seu contexto' },
            { icon: Zap, title: 'Suporte prioritário', desc: 'Resposta mais rápida' },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-brand" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                  <p className="text-sm text-foreground-muted">{feature.desc}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <section id="waitlist-plus" className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand/10 via-background to-background" />
        <Container className="relative z-10">
          <div className="max-w-xl mx-auto text-center">
            <Badge variant="premium" className="mb-4">Lista de espera</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Entre na lista do Plus
            </h2>
            <p className="text-foreground-light mb-8">
              Seja um dos primeiros a ter acesso ao acompanhamento completo.
            </p>
            <EmailCaptureForm
              source="plus"
              buttonText="Entrar na lista do Plus"
              variant="stacked"
            />
          </div>
        </Container>
      </section>
    </>
  );
}
