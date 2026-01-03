'use client';

import { motion } from 'framer-motion';
import {
  Microscope,
  FlaskConical,
  Dna,
  BookOpen,
  Shield,
  FileText,
  Building2,
  ArrowRight,
  Mail,
  Users,
  GraduationCap,
  Scale,
  Database,
  Brain,
  LineChart,
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Section, SectionHeader } from '@/components/ui/Section';

const researchAreas = [
  {
    icon: FlaskConical,
    title: 'Nutrigenomics',
    description:
      'Investigamos a interação entre nutrientes e expressão gênica em diferentes fenótipos populacionais brasileiros.',
  },
  {
    icon: Dna,
    title: 'Epigenetic aging',
    description:
      'Desenvolvimento de protocolos para mensuração de idade biológica via metilação de DNA em amostras de sangue periférico.',
  },
  {
    icon: Microscope,
    title: 'Biomarkers',
    description:
      'Validação de painéis de biomarcadores acessíveis para predição de healthspan em populações de baixa e média renda.',
  },
  {
    icon: BookOpen,
    title: 'Behavioral science',
    description:
      'Estudos longitudinais sobre aderência a protocolos de intervenção e determinantes sociais de mudança comportamental.',
  },
];

const governance = [
  {
    icon: Users,
    title: 'Scientific advisory board',
    description: 'Pesquisadores independentes com publicações em periódicos Q1 revisam e aprovam as linhas de pesquisa.',
  },
  {
    icon: Scale,
    title: 'Ethics committee',
    description: 'Protocolos de pesquisa seguem diretrizes CONEP e declaração de Helsinki.',
  },
  {
    icon: Building2,
    title: 'External audit',
    description: 'Demonstrações financeiras auditadas anualmente por firma de auditoria independente.',
  },
  {
    icon: GraduationCap,
    title: 'Open access',
    description: 'Resultados publicados em periódicos com revisão por pares sob licença Creative Commons.',
  },
];

const timeline = [
  { year: '2024', event: 'Constituição do L3 como entidade sem fins lucrativos' },
  { year: '2025', event: 'Definição do portfólio inicial de pesquisa pelo advisory board' },
  { year: '2026', event: 'Publicação do primeiro relatório de atividades e demonstrações financeiras' },
  { year: '2027+', event: 'Estabelecimento de parcerias com instituições de pesquisa' },
];

export default function FoundationPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-surface-100" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]" />

        <Container className="relative z-10">
          <div className="max-w-3xl">
            <Badge variant="info" className="mb-4">
              <Building2 className="w-4 h-4 mr-1" aria-hidden="true" />
              <span>L3 - Livvay Longevity Labs</span>
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-foreground">
              Financiamento de{' '}
              <span className="gradient-text">pesquisa em longevidade</span>
            </h1>
            <p className="text-xl text-foreground-light mb-8">
              O L3 destina parte do lucro líquido da Livvay para financiar pesquisa
              científica em healthspan e longevidade. Atuamos com governança independente,
              metodologia rigorosa e compromisso com a publicação de resultados.
            </p>
          </div>
        </Container>
      </section>

      {/* Mission */}
      <Section>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <Badge variant="premium" className="mb-4">Missão institucional</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Expandir o conhecimento científico sobre healthspan
            </h2>
            <p className="text-foreground-light mb-6">
              Healthspan representa o período de vida livre de doenças crônicas e
              limitações funcionais. O L3 financia pesquisas que investigam os
              determinantes biológicos, comportamentais e ambientais desse período.
            </p>
            <p className="text-foreground-light">
              Operamos exclusivamente no campo científico. Não promovemos intervenções
              não validadas nem fazemos afirmações sobre resultados não comprovados
              por metodologia científica adequada.
            </p>
          </div>
          <Card variant="glass" className="p-8">
            <div className="grid grid-cols-2 gap-6">
              {[
                { value: '10%', label: 'do lucro líquido alocado' },
                { value: '4', label: 'linhas de pesquisa ativas' },
                { value: '100%', label: 'resultados publicados' },
                { value: 'Q1', label: 'periódicos indexados' },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-3xl font-bold text-brand mb-1">{stat.value}</p>
                  <p className="text-sm text-foreground-muted">{stat.label}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </Section>

      {/* Data & AI Integration */}
      <Section background="darker">
        <SectionHeader
          title="Ciência aplicada ao produto"
          subtitle="As descobertas do L3 melhoram diretamente os planos e algoritmos do Livvay."
          badge="Integration"
        />
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Database,
              title: 'Dados agregados',
              description:
                'Dados anonimizados e agregados dos usuários geram insights para validação de hipóteses e identificação de padrões populacionais.',
            },
            {
              icon: Brain,
              title: 'IA baseada em evidências',
              description:
                'Resultados das pesquisas do L3 são integrados aos modelos de machine learning, garantindo recomendações atualizadas e cientificamente fundamentadas.',
            },
            {
              icon: LineChart,
              title: 'Melhoria contínua',
              description:
                'Simulações e testes A/B validam a eficácia das intervenções antes de serem incorporadas aos planos personalizados.',
            },
          ].map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-brand/10 flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-brand" aria-hidden="true" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-foreground-muted">{item.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
        <p className="text-center text-sm text-foreground-muted mt-8">
          O uso de dados segue as diretrizes da LGPD e nossa política de privacidade.
        </p>
      </Section>

      {/* Research Areas */}
      <Section>
        <SectionHeader
          title="Portfólio de pesquisa"
          subtitle="Áreas de investigação definidas pelo advisory board científico."
          badge="Research"
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
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <area.icon className="w-6 h-6 text-blue-500" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-2">{area.title}</h3>
                    <p className="text-foreground-light">{area.description}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
        <p className="text-center text-sm text-foreground-muted mt-8">
          O portfólio de pesquisa é revisado anualmente pelo scientific advisory board.
        </p>
      </Section>

      {/* Governance */}
      <Section background="darker">
        <SectionHeader
          title="Estrutura de governança"
          subtitle="Mecanismos que garantem independência e accountability."
          badge="Governance"
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
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-brand/10 flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-brand" aria-hidden="true" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-foreground-muted">{item.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Timeline */}
      <Section>
        <SectionHeader
          title="Roadmap institucional"
          badge="Timeline"
        />
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            {/* Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-brand to-border" />

            {timeline.map((item, index) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative pl-20 pb-8 last:pb-0"
              >
                <div className="absolute left-4 w-8 h-8 rounded-full bg-brand flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-background" />
                </div>
                <div className="bg-surface-100 border border-border rounded-xl p-4">
                  <p className="text-brand font-bold mb-1">{item.year}</p>
                  <p className="text-foreground">{item.event}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* Annual Report */}
      <Section background="darker">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-blue-500/10 flex items-center justify-center">
            <FileText className="w-10 h-10 text-blue-500" aria-hidden="true" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Relatório de atividades
          </h2>
          <p className="text-foreground-light mb-8">
            Publicamos anualmente um relatório detalhando: recursos alocados, projetos
            financiados, resultados obtidos, publicações geradas e planejamento para
            o exercício seguinte.
          </p>
          <Card variant="glass" className="inline-block">
            <div className="flex items-center gap-4 px-6 py-4">
              <FileText className="w-8 h-8 text-foreground-muted" aria-hidden="true" />
              <div className="text-left">
                <p className="text-foreground font-medium">Relatório de atividades 2025</p>
                <p className="text-sm text-foreground-muted">Previsão: Q1 2026</p>
              </div>
              <Badge variant="info">Em elaboração</Badge>
            </div>
          </Card>
        </div>
      </Section>

      {/* Contact */}
      <Section>
        <div className="max-w-2xl mx-auto text-center">
          <Badge variant="info" className="mb-4">Contato institucional</Badge>
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Parcerias e colaborações
          </h2>
          <p className="text-foreground-light mb-8">
            Pesquisadores, instituições de pesquisa e organizações interessadas
            em colaborar com o L3 podem entrar em contato através dos canais abaixo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button href="mailto:research@livvay.com" type="outline" icon={<Mail />}>
              research@livvay.com
            </Button>
            <Button href="/contato" type="default" iconRight={<ArrowRight />}>
              Formulário institucional
            </Button>
          </div>
        </div>
      </Section>

      {/* Disclaimer */}
      <Section>
        <div className="max-w-3xl mx-auto">
          <Card variant="glass" className="p-8">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" aria-hidden="true" />
              <span>Declaração de princípios</span>
            </h3>
            <div className="space-y-4 text-foreground-light">
              <p>
                O L3 opera exclusivamente no campo da pesquisa científica. Não financiamos,
                promovemos ou endossamos intervenções sem validação por estudos clínicos
                adequados e aprovação regulatória.
              </p>
              <p>
                Todas as pesquisas financiadas pelo L3 seguem protocolos aprovados por
                comitês de ética, utilizam metodologia científica rigorosa e têm seus
                resultados submetidos a periódicos com revisão por pares.
              </p>
              <p>
                Nossa missão é contribuir para o avanço do conhecimento científico sobre
                longevidade e healthspan, com foco em pesquisa translacional que possa
                beneficiar populações diversas.
              </p>
            </div>
          </Card>
        </div>
      </Section>
    </>
  );
}
