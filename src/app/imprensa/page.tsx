'use client';

import { motion } from 'framer-motion';
import {
  Download,
  Mail,
  FileText,
  Image as ImageIcon,
  Users,
  Calendar,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import { useState } from 'react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Section, SectionHeader } from '@/components/ui/Section';

const stats = [
  { label: 'Usuários na lista de espera', value: '10.000+', note: '* Número exemplo' },
  { label: 'Países com interesse', value: '15+', note: '* Número exemplo' },
  { label: 'Score médio dos usuários beta', value: '724', note: '* Número exemplo' },
  { label: 'Taxa de retenção', value: '78%', note: '* Número exemplo' },
];

const assets = [
  { name: 'Logo SVG (colorido)', file: '/logo.svg', type: 'SVG' },
  { name: 'Logo PNG (alta resolução)', file: '/logo.svg', type: 'PNG' },
  { name: 'Mock do app', file: '/mock-phone.svg', type: 'SVG' },
  { name: 'Kit de marca completo', file: '#', type: 'ZIP', soon: true },
];

const timeline = [
  { date: 'Jan 2025', event: 'Fundação do Livvay' },
  { date: 'Mar 2025', event: 'Lançamento da lista de espera' },
  { date: 'Jun 2025', event: 'Beta fechado com 500 usuários' },
  { date: 'Jan 2026', event: 'Lançamento público previsto' },
];

export default function ImprensaPage() {
  const [copiedEmail, setCopiedEmail] = useState(false);

  const copyEmail = () => {
    navigator.clipboard.writeText('imprensa@livvay.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <>
      {/* Hero */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0B] via-[#0A0A0B] to-[#111113]" />

        <Container className="relative z-10">
          <div className="max-w-3xl">
            <Badge variant="info" className="mb-4">Press Kit</Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Imprensa
            </h1>
            <p className="text-xl text-[#A1A1AA] mb-8">
              Recursos, informações e contatos para jornalistas e veículos de comunicação.
            </p>
          </div>
        </Container>
      </section>

      {/* About */}
      <Section>
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div>
            <Badge variant="premium" className="mb-4">Sobre o Livvay</Badge>
            <h2 className="text-3xl font-bold text-white mb-6">
              Quem somos
            </h2>
            <div className="space-y-4 text-[#A1A1AA]">
              <p>
                O Livvay é um assistente de longevidade que transforma hábitos diários 
                em um plano simples e ajustado em tempo real por inteligência artificial.
              </p>
              <p>
                Fundado em 2025, o Livvay nasceu da missão de democratizar o acesso 
                a ferramentas de saúde preventiva, combinando tecnologia de ponta 
                com acompanhamento humano (no plano Plus).
              </p>
              <p>
                A empresa também mantém a LLL (Livvay Life Foundation), uma fundação 
                que destina parte do lucro para pesquisa científica de longevidade.
              </p>
            </div>
          </div>
          <Card variant="glass">
            <h3 className="text-lg font-bold text-white mb-6">Em 3 bullets</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#00E676] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[#0A0A0B] text-xs font-bold">1</span>
                </div>
                <p className="text-[#A1A1AA]">
                  <strong className="text-white">AI em tempo real:</strong> Registrou algo, 
                  o plano do dia se ajusta automaticamente.
                </p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#00E676] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[#0A0A0B] text-xs font-bold">2</span>
                </div>
                <p className="text-[#A1A1AA]">
                  <strong className="text-white">Equipe médica no Plus:</strong> Nutricionista, 
                  médico e psicólogo dedicados ao usuário.
                </p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#00E676] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[#0A0A0B] text-xs font-bold">3</span>
                </div>
                <p className="text-[#A1A1AA]">
                  <strong className="text-white">Liga Livvay:</strong> Gamificação com ranking 
                  e benefícios reais (academias, descontos, etc).
                </p>
              </li>
            </ul>
          </Card>
        </div>
      </Section>

      {/* Stats */}
      <Section background="darker">
        <SectionHeader
          title="Números"
          subtitle="Dados do projeto (valores de exemplo para demonstração)."
          badge="Métricas"
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-[#00E676] mb-2">
                  {stat.value}
                </p>
                <p className="text-sm text-[#A1A1AA] mb-2">{stat.label}</p>
                <p className="text-xs text-[#71717A]">{stat.note}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Timeline */}
      <Section>
        <SectionHeader
          title="Linha do tempo"
          badge="História"
        />
        <div className="max-w-2xl mx-auto">
          <div className="grid gap-4">
            {timeline.map((item, index) => (
              <motion.div
                key={item.date}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 p-4 bg-[#111113] rounded-xl border border-[#27272A]"
              >
                <div className="w-12 h-12 rounded-xl bg-[#00E676]/10 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-[#00E676]" />
                </div>
                <div>
                  <p className="text-[#00E676] text-sm font-medium">{item.date}</p>
                  <p className="text-white">{item.event}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* Assets */}
      <Section background="darker">
        <SectionHeader
          title="Assets para download"
          subtitle="Logos, screenshots e materiais de marca."
          badge="Downloads"
        />
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {assets.map((asset, index) => (
            <Card key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#1A1A1D] flex items-center justify-center">
                  {asset.type === 'SVG' || asset.type === 'PNG' ? (
                    <ImageIcon className="w-6 h-6 text-[#A1A1AA]" />
                  ) : (
                    <FileText className="w-6 h-6 text-[#A1A1AA]" />
                  )}
                </div>
                <div>
                  <p className="text-white font-medium">{asset.name}</p>
                  <p className="text-sm text-[#71717A]">{asset.type}</p>
                </div>
              </div>
              {asset.soon ? (
                <Badge variant="info">Em breve</Badge>
              ) : (
                <a
                  href={asset.file}
                  download
                  className="p-2 hover:bg-[#1A1A1D] rounded-lg transition-colors"
                  aria-label={`Download ${asset.name}`}
                >
                  <Download className="w-5 h-5 text-[#00E676]" />
                </a>
              )}
            </Card>
          ))}
        </div>
      </Section>

      {/* Contact */}
      <Section>
        <div className="max-w-xl mx-auto text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#00E676]/10 flex items-center justify-center">
            <Mail className="w-10 h-10 text-[#00E676]" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Contato para imprensa
          </h2>
          <p className="text-[#A1A1AA] mb-8">
            Para entrevistas, informações adicionais ou solicitações de material, 
            entre em contato com nossa assessoria.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button href="mailto:imprensa@livvay.com">
              <Mail className="w-5 h-5" />
              imprensa@livvay.com
            </Button>
            <Button onClick={copyEmail} variant="secondary">
              {copiedEmail ? (
                <>
                  <Check className="w-5 h-5" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  Copiar email
                </>
              )}
            </Button>
          </div>
          <p className="text-sm text-[#71717A] mt-6">
            Respondemos em até 24 horas úteis.
          </p>
        </div>
      </Section>
    </>
  );
}

