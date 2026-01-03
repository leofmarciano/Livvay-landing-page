'use client';

import { motion } from 'framer-motion';
import {
  Microscope,
  FlaskConical,
  Dna,
  BookOpen,
  Users,
  Shield,
  FileText,
  Globe,
  Heart,
  ArrowRight,
  Mail,
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Section, SectionHeader } from '@/components/ui/Section';

const researchAreas = [
  {
    icon: FlaskConical,
    title: 'Nutrição e Metabolismo',
    description:
      'Pesquisa sobre como diferentes padrões alimentares afetam longevidade e marcadores de saúde em populações diversas.',
  },
  {
    icon: Dna,
    title: 'Genética e Epigenética',
    description:
      'Estudos sobre como fatores ambientais e comportamentais influenciam a expressão genética relacionada ao envelhecimento.',
  },
  {
    icon: Microscope,
    title: 'Biomarcadores de Longevidade',
    description:
      'Desenvolvimento de painéis de biomarcadores acessíveis para monitoramento de healthspan.',
  },
  {
    icon: BookOpen,
    title: 'Ciência Comportamental',
    description:
      'Pesquisa sobre aderência a hábitos saudáveis e estratégias de mudança de comportamento sustentáveis.',
  },
];

const governance = [
  {
    title: 'Conselho Científico',
    description: 'Pesquisadores independentes revisam e aprovam linhas de pesquisa.',
  },
  {
    title: 'Comitê de Ética',
    description: 'Toda pesquisa segue protocolos éticos rigorosos.',
  },
  {
    title: 'Auditoria Externa',
    description: 'Prestação de contas anual por auditores independentes.',
  },
  {
    title: 'Publicação Aberta',
    description: 'Resultados publicados em periódicos de acesso aberto.',
  },
];

const timeline = [
  { year: '2024', event: 'Fundação da LLL' },
  { year: '2025', event: 'Primeiras linhas de pesquisa definidas' },
  { year: '2026', event: 'Primeiro relatório anual público' },
  { year: '2027+', event: 'Expansão para parcerias universitárias' },
];

export default function FoundationPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0B] via-[#0A0A0B] to-[#111113]" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#3B82F6]/5 rounded-full blur-[120px]" />

        <Container className="relative z-10">
          <div className="max-w-3xl">
            <Badge variant="info" className="mb-4">
              <Heart className="w-4 h-4 mr-1" />
              Livvay Life Foundation
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Parte do lucro vira{' '}
              <span className="gradient-text">pesquisa de verdade</span>
            </h1>
            <p className="text-xl text-[#A1A1AA] mb-8">
              A LLL (Livvay Life Foundation) é uma fundação sem fins lucrativos dedicada a 
              financiar pesquisa científica de longevidade, com foco em ciência aplicada 
              e resultados que beneficiem a população.
            </p>
          </div>
        </Container>
      </section>

      {/* Mission */}
      <Section>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <Badge variant="premium" className="mb-4">Missão</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Acelerar ciência aplicada para ampliar healthspan
            </h2>
            <p className="text-[#A1A1AA] mb-6">
              Healthspan é o período de vida saudável — não apenas viver mais, mas viver melhor 
              por mais tempo. A LLL financia pesquisas que buscam entender e ampliar esse período.
            </p>
            <p className="text-[#A1A1AA]">
              Diferente de promessas de "reversão de idade" ou "imortalidade", trabalhamos no 
              campo científico e regulatório, com pesquisas sérias e resultados publicados.
            </p>
          </div>
          <Card variant="glass" className="p-8">
            <div className="grid grid-cols-2 gap-6">
              {[
                { value: '10%', label: 'do lucro líquido destinado' },
                { value: '4', label: 'linhas de pesquisa ativas' },
                { value: '100%', label: 'transparência nos relatórios' },
                { value: '∞', label: 'compromisso com a ciência' },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-3xl font-bold text-[#00E676] mb-1">{stat.value}</p>
                  <p className="text-sm text-[#71717A]">{stat.label}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </Section>

      {/* Research Areas */}
      <Section background="darker">
        <SectionHeader
          title="Linhas de pesquisa"
          subtitle="Áreas prioritárias de investigação científica."
          badge="Pesquisa"
        />
        <div className="grid md:grid-cols-2 gap-6">
          {researchAreas.map((area, index) => (
            <motion.div
              key={area.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card variant="highlight" className="h-full">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#3B82F6]/10 flex items-center justify-center flex-shrink-0">
                    <area.icon className="w-6 h-6 text-[#3B82F6]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">{area.title}</h3>
                    <p className="text-[#A1A1AA]">{area.description}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
        <p className="text-center text-sm text-[#71717A] mt-8">
          * As linhas de pesquisa são definidas pelo Conselho Científico e revisadas anualmente.
        </p>
      </Section>

      {/* Governance */}
      <Section>
        <SectionHeader
          title="Governança e transparência"
          subtitle="Como garantimos seriedade e responsabilidade."
          badge="Governança"
        />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {governance.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="text-center h-full">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-[#00E676]/10 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-[#00E676]" />
                </div>
                <h3 className="font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-[#71717A]">{item.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Timeline */}
      <Section background="darker">
        <SectionHeader
          title="Linha do tempo"
          badge="Roadmap"
        />
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            {/* Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#00E676] to-[#27272A]" />
            
            {timeline.map((item, index) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative pl-20 pb-8 last:pb-0"
              >
                <div className="absolute left-4 w-8 h-8 rounded-full bg-[#00E676] flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-[#0A0A0B]" />
                </div>
                <div className="bg-[#111113] border border-[#27272A] rounded-xl p-4">
                  <p className="text-[#00E676] font-bold mb-1">{item.year}</p>
                  <p className="text-white">{item.event}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* Annual Report */}
      <Section>
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#3B82F6]/10 flex items-center justify-center">
            <FileText className="w-10 h-10 text-[#3B82F6]" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Relatório anual
          </h2>
          <p className="text-[#A1A1AA] mb-8">
            Todo ano publicamos um relatório completo detalhando: quanto foi arrecadado, 
            quais pesquisas foram financiadas, resultados alcançados e planos futuros.
          </p>
          <Card variant="glass" className="inline-block">
            <div className="flex items-center gap-4 px-6 py-4">
              <FileText className="w-8 h-8 text-[#71717A]" />
              <div className="text-left">
                <p className="text-white font-medium">Relatório Anual 2025</p>
                <p className="text-sm text-[#71717A]">Em breve</p>
              </div>
              <Badge variant="info">Aguardando</Badge>
            </div>
          </Card>
        </div>
      </Section>

      {/* Contact */}
      <Section background="darker">
        <div className="max-w-2xl mx-auto text-center">
          <Badge variant="info" className="mb-4">Contato institucional</Badge>
          <h2 className="text-3xl font-bold text-white mb-4">
            Quer colaborar com a LLL?
          </h2>
          <p className="text-[#A1A1AA] mb-8">
            Pesquisadores, instituições e parceiros interessados em colaborar 
            com a Livvay Life Foundation podem entrar em contato.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button href="mailto:foundation@livvay.com" variant="outline">
              <Mail className="w-5 h-5" />
              foundation@livvay.com
            </Button>
            <Button href="/contato" variant="secondary">
              Formulário de contato
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Section>

      {/* Disclaimer */}
      <Section>
        <div className="max-w-3xl mx-auto">
          <Card variant="glass" className="p-8">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#3B82F6]" />
              Compromisso com a ciência
            </h3>
            <div className="space-y-4 text-[#A1A1AA]">
              <p>
                A LLL trabalha exclusivamente no campo científico e regulatório. 
                Não fazemos promessas de "reversão de idade", "cura do envelhecimento" 
                ou qualquer tipo de intervenção não comprovada.
              </p>
              <p>
                Todas as pesquisas financiadas seguem protocolos éticos rigorosos, 
                são revisadas por pares e têm resultados publicados em periódicos científicos.
              </p>
              <p>
                Nosso objetivo é expandir o conhecimento científico sobre longevidade 
                e traduzir esse conhecimento em benefícios práticos e acessíveis para a população.
              </p>
            </div>
          </Card>
        </div>
      </Section>
    </>
  );
}

