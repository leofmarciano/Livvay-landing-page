import { Container } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';

export default function PrivacidadePage() {
  return (
    <>
      {/* Header */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-[#0A0A0B] to-[#111113]">
        <Container>
          <div className="max-w-2xl">
            <Badge variant="info" className="mb-4">Legal</Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Política de Privacidade
            </h1>
            <p className="text-xl text-[#A1A1AA]">
              Última atualização: Janeiro de 2026
            </p>
          </div>
        </Container>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16 bg-[#0A0A0B]">
        <Container>
          <article className="max-w-2xl mx-auto prose prose-invert">
            <div className="space-y-8 text-[#A1A1AA]">
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">1. Introdução</h2>
                <p>
                  O Livvay ("nós", "nosso" ou "Livvay") respeita sua privacidade e está 
                  comprometido em proteger seus dados pessoais. Esta política explica 
                  como coletamos, usamos e protegemos suas informações.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">2. Dados que coletamos</h2>
                <p className="mb-4">Coletamos os seguintes tipos de dados:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong className="text-white">Dados de cadastro:</strong> Email, nome 
                    (quando fornecido voluntariamente).
                  </li>
                  <li>
                    <strong className="text-white">Respostas do quiz:</strong> Suas respostas 
                    ao questionário do Livvay Score para personalizar recomendações.
                  </li>
                  <li>
                    <strong className="text-white">Dados de uso:</strong> Como você interage 
                    com nosso site e app (páginas visitadas, tempo de uso).
                  </li>
                  <li>
                    <strong className="text-white">Dados de saúde (futuro):</strong> Quando o 
                    app estiver disponível, poderemos coletar dados de alimentação, sono e 
                    exercícios que você registrar voluntariamente.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">3. Como usamos seus dados</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Fornecer e personalizar nossos serviços</li>
                  <li>Calcular e atualizar seu Livvay Score</li>
                  <li>Enviar comunicações sobre o produto (com seu consentimento)</li>
                  <li>Melhorar nossos serviços com base em padrões agregados</li>
                  <li>Cumprir obrigações legais</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">4. Compartilhamento de dados</h2>
                <p>
                  <strong className="text-white">Não vendemos seus dados.</strong> Podemos 
                  compartilhar dados apenas nas seguintes situações:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li>Com prestadores de serviço essenciais (hospedagem, email)</li>
                  <li>Quando exigido por lei</li>
                  <li>Com seu consentimento explícito</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">5. Retenção de dados</h2>
                <p>
                  Mantemos seus dados enquanto você tiver uma conta ativa ou enquanto for 
                  necessário para fornecer nossos serviços. Você pode solicitar a exclusão 
                  a qualquer momento.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">6. Seus direitos</h2>
                <p className="mb-4">Você tem direito a:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Acessar seus dados pessoais</li>
                  <li>Corrigir dados incorretos</li>
                  <li>Solicitar exclusão de seus dados</li>
                  <li>Revogar consentimento para comunicações</li>
                  <li>Portabilidade de dados</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">7. Segurança</h2>
                <p>
                  Implementamos medidas técnicas e organizacionais para proteger seus dados, 
                  incluindo criptografia em trânsito (HTTPS) e em repouso, controle de acesso 
                  restrito e monitoramento de segurança.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">8. Cookies</h2>
                <p>
                  Usamos cookies essenciais para o funcionamento do site e cookies analíticos 
                  para entender como você usa nosso serviço. Você pode configurar seu navegador 
                  para recusar cookies, mas isso pode afetar a funcionalidade.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">9. Menores de idade</h2>
                <p>
                  Nossos serviços não são destinados a menores de 18 anos. Não coletamos 
                  intencionalmente dados de menores.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">10. Alterações nesta política</h2>
                <p>
                  Podemos atualizar esta política periodicamente. Notificaremos sobre mudanças 
                  significativas por email ou através de aviso no site.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">11. Contato</h2>
                <p>
                  Para questões sobre privacidade, entre em contato:{' '}
                  <a href="mailto:privacidade@livvay.com" className="text-[#00E676] hover:underline">
                    privacidade@livvay.com
                  </a>
                </p>
              </section>

              <div className="pt-8 border-t border-[#27272A]">
                <p className="text-sm text-[#71717A]">
                  Esta política está em conformidade com a Lei Geral de Proteção de Dados (LGPD) 
                  e outras regulamentações aplicáveis.
                </p>
              </div>
            </div>
          </article>
        </Container>
      </section>
    </>
  );
}

