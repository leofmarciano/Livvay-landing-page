import { Container } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';

export default function TermosPage() {
  return (
    <>
      {/* Header */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-background to-surface-100">
        <Container>
          <div className="max-w-2xl">
            <Badge variant="info" className="mb-4">Legal</Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Termos de Uso
            </h1>
            <p className="text-xl text-foreground-light">
              Última atualização: Janeiro de 2026
            </p>
          </div>
        </Container>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16 bg-background">
        <Container>
          <article className="max-w-2xl mx-auto">
            <div className="space-y-8 text-foreground-light">
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">1. Aceitação dos termos</h2>
                <p>
                  Ao acessar ou usar o Livvay, você concorda com estes Termos de Uso. 
                  Se não concordar, não use nossos serviços.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">2. Descrição do serviço</h2>
                <p>
                  O Livvay é um assistente de longevidade que oferece ferramentas para 
                  monitoramento de hábitos, cálculo de score de saúde e, no plano Plus, 
                  acompanhamento por profissionais de saúde.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">3. Não substituímos médicos</h2>
                <div className="bg-surface-100 p-4 rounded-lg border border-border mb-4">
                  <p className="text-foreground font-medium mb-2">⚠️ Importante:</p>
                  <p>
                    O Livvay não substitui atendimento médico, diagnóstico ou tratamento. 
                    Nossas ferramentas e orientações são de caráter informativo e educacional. 
                    Em caso de emergência, procure um pronto-socorro.
                  </p>
                </div>
                <p>
                  O Livvay Score e as estimativas nutricionais são probabilísticas, baseadas 
                  em seus registros, e não constituem diagnóstico médico.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">4. Cadastro e conta</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Você é responsável por manter a confidencialidade de sua conta</li>
                  <li>Deve fornecer informações verdadeiras</li>
                  <li>Deve ter pelo menos 18 anos de idade</li>
                  <li>Uma conta por pessoa</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">5. Uso aceitável</h2>
                <p className="mb-4">Você concorda em não:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Usar o serviço para fins ilegais</li>
                  <li>Tentar acessar sistemas ou dados de outros usuários</li>
                  <li>Interferir no funcionamento do serviço</li>
                  <li>Criar contas falsas ou compartilhar sua conta</li>
                  <li>Usar automação não autorizada</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">6. Propriedade intelectual</h2>
                <p>
                  Todo o conteúdo do Livvay (textos, imagens, código, marca) é propriedade 
                  do Livvay ou seus licenciadores. Você não pode copiar, modificar ou 
                  distribuir sem autorização.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">7. Conteúdo do usuário</h2>
                <p>
                  Você mantém a propriedade dos dados que insere (registros de alimentação, 
                  etc). Ao usar o serviço, você nos concede licença para processar esses 
                  dados conforme necessário para fornecer o serviço.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">8. Plano Plus</h2>
                <p className="mb-4">O Livvay Plus inclui acompanhamento profissional:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Consultas são agendadas conforme disponibilidade</li>
                  <li>Orientações médicas dependem de avaliação individual</li>
                  <li>Resultados variam de pessoa para pessoa</li>
                  <li>Não inclui atendimento de emergência</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">9. Pagamentos e reembolsos</h2>
                <p>
                  Termos de pagamento específicos serão apresentados no momento da contratação 
                  de planos pagos. Política de reembolso segue o Código de Defesa do Consumidor.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">10. Limitação de responsabilidade</h2>
                <p>
                  O Livvay não se responsabiliza por decisões de saúde tomadas com base 
                  exclusivamente em nossas ferramentas. Sempre consulte profissionais 
                  qualificados para questões de saúde.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">11. Modificações</h2>
                <p>
                  Podemos modificar estes termos a qualquer momento. Mudanças significativas 
                  serão comunicadas com antecedência. O uso continuado após modificações 
                  constitui aceitação.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">12. Encerramento</h2>
                <p>
                  Você pode encerrar sua conta a qualquer momento. Podemos suspender ou 
                  encerrar contas que violem estes termos.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">13. Lei aplicável</h2>
                <p>
                  Estes termos são regidos pelas leis brasileiras. Disputas serão resolvidas 
                  no foro da comarca de São Paulo, SP.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">14. Contato</h2>
                <p>
                  Dúvidas sobre estes termos:{' '}
                  <a 
                    href="mailto:legal@livvay.com" 
                    className="text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded"
                  >
                    legal@livvay.com
                  </a>
                </p>
              </section>

              <div className="pt-8 border-t border-border">
                <p className="text-sm text-foreground-muted">
                  Ao usar o Livvay, você declara ter lido e concordado com estes termos 
                  e com nossa Política de Privacidade.
                </p>
              </div>
            </div>
          </article>
        </Container>
      </section>
    </>
  );
}
