'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Heart } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmailCaptureForm } from '@/components/forms/EmailCaptureForm';

export default function ManifestoPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0B] via-[#0A0A0B] to-[#111113]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#00E676]/5 rounded-full blur-[150px]" />

        <Container className="relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="premium" className="mb-6">Manifesto</Badge>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-8"
            >
              Não quero morrer.
            </motion.h1>
          </div>
        </Container>
      </section>

      {/* Content */}
      <section className="py-16 md:py-24">
        <Container>
          <article className="max-w-2xl mx-auto prose prose-invert prose-lg">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-8 text-[#A1A1AA]"
            >
              <p className="text-2xl text-white font-medium leading-relaxed">
                Essa frase não é drama. É honestidade.
              </p>

              <p>
                Eu não quero morrer. Você provavelmente também não. 
                E ainda assim, vivemos como se o tempo não existisse.
              </p>

              <p>
                Comemos o que aparece. Dormimos quando sobra. 
                Deixamos o corpo pra depois. 
                E depois vira "tarde demais".
              </p>

              <div className="border-l-4 border-[#00E676] pl-6 my-8">
                <p className="text-xl text-white italic">
                  "Vida eterna não é promessa. É direção."
                </p>
              </div>

              <p>
                O Livvay nasceu de uma obsessão: 
                como fazer o máximo possível para viver mais — e melhor?
              </p>

              <p>
                Não com fórmulas mágicas. 
                Não com suplementos milagrosos. 
                Não com terrorismo nutricional.
              </p>

              <p className="text-white text-xl">
                Com método. Com consistência. Com ciência aplicada.
              </p>

              <h2 className="text-3xl font-bold text-white mt-12 mb-6">
                O problema não é informação
              </h2>

              <p>
                Você sabe que precisa dormir melhor. 
                Você sabe que precisa comer mais proteína. 
                Você sabe que precisa se mexer.
              </p>

              <p>
                O problema é fazer isso todo dia. 
                Sem um sistema, vira força de vontade. 
                E força de vontade acaba.
              </p>

              <h2 className="text-3xl font-bold text-white mt-12 mb-6">
                O que o Livvay faz diferente
              </h2>

              <p>
                A gente transforma tudo que você come, dorme e faz 
                em um plano simples que se ajusta em tempo real.
              </p>

              <p>
                Sem jargão. Sem PDF. Sem app que você abandona em uma semana.
              </p>

              <p>
                Um copiloto que te lembra, te orienta, te mostra o caminho — 
                e celebra quando você avança.
              </p>

              <h2 className="text-3xl font-bold text-white mt-12 mb-6">
                Vida eterna é a direção
              </h2>

              <p>
                Não prometemos que você vai viver para sempre. 
                Ninguém pode prometer isso (ainda).
              </p>

              <p>
                O que prometemos é o máximo esforço, com o melhor método disponível, 
                para você viver mais tempo com mais qualidade.
              </p>

              <p>
                E parte do que ganhamos vai para pesquisa de verdade — 
                a LLL financia ciência de longevidade, com transparência total.
              </p>

              <div className="bg-[#111113] border border-[#27272A] rounded-2xl p-8 my-12">
                <p className="text-xl text-white mb-4">
                  Se você não quer morrer, você é um de nós.
                </p>
                <p className="text-[#71717A]">
                  Não é sobre ter medo da morte. 
                  É sobre ter respeito pela vida.
                </p>
              </div>

              <h2 className="text-3xl font-bold text-white mt-12 mb-6">
                Isso é um convite
              </h2>

              <p>
                Para quem quer parar de deixar a saúde pra depois. 
                Para quem quer um sistema que funciona. 
                Para quem acredita que dá pra fazer melhor.
              </p>

              <p className="text-white text-xl">
                Rumo à vida eterna. Com método.
              </p>

              <div className="flex items-center gap-4 mt-12 pt-8 border-t border-[#27272A]">
                <div className="w-12 h-12 rounded-full bg-[#00E676] flex items-center justify-center">
                  <Heart className="w-6 h-6 text-[#0A0A0B]" />
                </div>
                <div>
                  <p className="text-white font-medium">Equipe Livvay</p>
                  <p className="text-sm text-[#71717A]">Janeiro de 2026</p>
                </div>
              </div>
            </motion.div>
          </article>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[#050506]">
        <Container>
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Se você não quer morrer, entra agora
            </h2>
            <p className="text-[#A1A1AA] mb-8">
              Faça o diagnóstico e receba seu plano base.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button href="/score" size="lg">
                Calcular meu Score
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
            <div className="pt-8 border-t border-[#27272A]">
              <p className="text-sm text-[#71717A] mb-4">
                Ou entre na lista de espera:
              </p>
              <EmailCaptureForm
                source="manifesto"
                buttonText="Entrar na lista"
              />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

