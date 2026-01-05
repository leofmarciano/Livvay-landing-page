# Backlog - Sistema de Afiliados Livvay

## Visão Geral

Sistema completo de gestão de afiliados com múltiplos perfis de usuário, painéis administrativos, tracking de conversões, gestão de campanhas e compliance.

---

## Fase 1: MVP Rápido

### Épico 1: Autenticação e Perfis de Usuário

#### História 1.1: Sistema de RBAC (Roles & Permissions)
**Prioridade:** Crítica  
**Estimativa:** 8 pontos

**Tarefas:**
- [ ] Implementar sistema de roles: `affiliate`, `admin`, `finance`, `support_risk`
- [ ] Criar middleware de autorização por rota
- [ ] Implementar auditoria de ações (log de quem fez o quê)
- [ ] Criar seed de usuários admin iniciais

**Critérios de Aceitação:**
- 4 tipos de usuário distintos com permissões isoladas
- Todas as ações críticas são auditadas
- Middleware bloqueia acesso não autorizado

---

#### História 1.2: Cadastro e Aprovação de Afiliados
**Prioridade:** Crítica  
**Estimativa:** 5 pontos

**Tarefas:**
- [ ] Formulário de cadastro de afiliado (nome, email, plataforma, motivo)
- [ ] Painel admin para aprovar/reprovar candidaturas
- [ ] Email de confirmação de aprovação/rejeição
- [ ] Status: `pending`, `approved`, `rejected`, `suspended`

**Critérios de Aceitação:**
- Admin pode aprovar/reprovar com motivo
- Afiliado recebe email automático com resultado
- Histórico de aprovações é auditado

---

### Épico 2: Gestão de Códigos e Links

#### História 2.1: Geração de Códigos Únicos
**Prioridade:** Crítica  
**Estimativa:** 5 pontos

**Tarefas:**
- [ ] Endpoint para gerar código único por afiliado
- [ ] Validação de formato (ex: `LIVVAY-XXXX-XXXX`)
- [ ] Regras: expiração, limite por campanha, uso único/múltiplo
- [ ] Banco de dados: códigos vinculados a afiliado e campanha

**Critérios de Aceitação:**
- Código único e não duplicável
- Código vinculado ao afiliado que criou
- Regras de expiração funcionam corretamente

---

#### História 2.2: Links Prontos por Plataforma
**Prioridade:** Alta  
**Estimativa:** 3 pontos

**Tarefas:**
- [ ] Gerar links com código para TikTok, Instagram, YouTube
- [ ] Parâmetros UTM automáticos por plataforma
- [ ] QR code para cada código gerado
- [ ] Botão "Copiar link" em cada plataforma

**Critérios de Aceitação:**
- Links funcionam em todas as plataformas mencionadas
- UTM tracking está correto
- QR code é gerado e baixável

---

#### História 2.3: Página Pública do Código (Fallback Web)
**Prioridade:** Crítica  
**Estimativa:** 8 pontos

**Tarefas:**
- [ ] Página `/code/[code]` pública e ultra-rápida
- [ ] Exibe código de forma gigante e legível
- [ ] Botão "Copiar código"
- [ ] Botão "Instalar" (link para app store)
- [ ] Botão "Já instalei, abrir o app" (deep link)
- [ ] Explicação clara do benefício (1 semana Plus grátis)
- [ ] Avisos do que vale e não vale
- [ ] Tracking de visualização do código

**Critérios de Aceitação:**
- Página carrega em < 1s
- Funciona em TikTok in-app browser
- Resolve cross-device (ver código no desktop, usar no mobile)
- Visualização é registrada no sistema

---

### Épico 3: Integração com App (Onboarding)

#### História 3.1: Campo de Código no Cadastro
**Prioridade:** Crítica  
**Estimativa:** 5 pontos

**Tarefas:**
- [ ] Campo "Tenho um código" no fluxo de cadastro
- [ ] Validação online do código (API call)
- [ ] Mensagem explicando que trial de 1 semana é só via código
- [ ] Travar código no usuário após validação (não permite trocar depois)
- [ ] Registrar evento: `code_applied`

**Critérios de Aceitação:**
- Código inválido mostra erro claro
- Código válido aplica benefício
- Código não pode ser alterado após aplicação
- Evento é registrado no sistema

---

#### História 3.2: Validação de Elegibilidade
**Prioridade:** Alta  
**Estimativa:** 3 pontos

**Tarefas:**
- [ ] Verificar se usuário já tem conta (email, device ID)
- [ ] Verificar se código já foi usado (se uso único)
- [ ] Verificar se código está expirado
- [ ] Verificar se código está ativo

**Critérios de Aceitação:**
- Usuário existente não pode usar código
- Código de uso único não pode ser reutilizado
- Código expirado é rejeitado

---

### Épico 4: Motor de Eventos e Tracking

#### História 4.1: Sistema de Eventos Base
**Prioridade:** Crítica  
**Estimativa:** 8 pontos

**Tarefas:**
- [ ] Criar tabela de eventos (`affiliate_events`)
- [ ] Tipos de evento: `code_viewed`, `code_applied`, `trial_started`, `subscription_active`, `payment_approved`, `renewal`, `cancellation`, `refund`, `chargeback`
- [ ] Endpoint para receber eventos (webhook-friendly)
- [ ] Validação de assinatura de webhook
- [ ] Processamento assíncrono de eventos

**Critérios de Aceitação:**
- Todos os eventos são registrados com timestamp
- Eventos são imutáveis (append-only)
- Sistema suporta alta carga de eventos

---

#### História 4.2: Integração com RevenueCat (Webhooks)
**Prioridade:** Alta  
**Estimativa:** 5 pontos

**Tarefas:**
- [ ] Configurar webhooks do RevenueCat
- [ ] Mapear eventos do RevenueCat para eventos internos
- [ ] Processar `TRIAL_STARTED`, `SUBSCRIPTION_ACTIVATED`, `RENEWAL`, `CANCELLATION`
- [ ] Tratamento de eventos duplicados

**Critérios de Aceitação:**
- Webhooks são recebidos e processados corretamente
- Eventos duplicados são ignorados
- Falhas de processamento são retentadas

---

### Épico 5: Dashboard do Afiliado (Básico)

#### História 5.1: Métricas Essenciais
**Prioridade:** Crítica  
**Estimativa:** 8 pontos

**Tarefas:**
- [ ] Cards de métricas principais:
  - Cliques no link e visitas na página do código
  - Códigos gerados e códigos ativos
  - Cadastros iniciados com código
  - Trials iniciados
  - Conversões em pagante
  - Assinaturas ativas
  - Receita gerada
- [ ] Comissão estimada (pending), liberada (cleared) e paga (paid)
- [ ] Taxa de conversão por etapa

**Critérios de Aceitação:**
- Métricas são calculadas em tempo real (ou próximo disso)
- Dados são precisos e auditáveis
- Performance aceitável (< 2s para carregar)

---

#### História 5.2: Lista de Códigos e Links
**Prioridade:** Alta  
**Estimativa:** 3 pontos

**Tarefas:**
- [ ] Tabela com todos os códigos do afiliado
- [ ] Status de cada código (ativo, expirado, usado)
- [ ] Links prontos para copiar
- [ ] QR codes para download

**Critérios de Aceitação:**
- Afiliado vê apenas seus próprios códigos
- Links são copiáveis com um clique
- QR codes são gerados sob demanda

---

### Épico 6: Ledger de Comissões (Básico)

#### História 6.1: Cálculo de Comissão
**Prioridade:** Crítica  
**Estimativa:** 8 pontos

**Tarefas:**
- [ ] Calcular comissão quando pagamento é aprovado
- [ ] Regra: comissão só conta quando vira pagante
- [ ] Regra: comissão mensal por até 12 meses
- [ ] Status: `pending` (hold de 30 dias), `cleared`, `paid`
- [ ] Armazenar histórico de comissões por usuário

**Critérios de Aceitação:**
- Comissão é calculada automaticamente
- Hold de 30 dias é respeitado
- Histórico completo é mantido

---

#### História 6.2: Visualização de Saldo e Histórico
**Prioridade:** Alta  
**Estimativa:** 3 pontos

**Tarefas:**
- [ ] Exibir saldo disponível (cleared)
- [ ] Exibir saldo pendente (pending)
- [ ] Exibir saldo total pago (paid)
- [ ] Lista de transações com status e data

**Critérios de Aceitação:**
- Saldos são calculados corretamente
- Histórico é ordenado por data (mais recente primeiro)
- Status é claro e compreensível

---

## Fase 2: Escala

### Épico 7: Campanhas e Coortes

#### História 7.1: Criação de Campanhas
**Prioridade:** Alta  
**Estimativa:** 5 pontos

**Tarefas:**
- [ ] Painel admin para criar campanhas
- [ ] Campos: nome, período, oferta, regras de comissão
- [ ] Vincular códigos a campanhas
- [ ] Status: `draft`, `active`, `paused`, `ended`

**Critérios de Aceitação:**
- Admin pode criar e editar campanhas
- Códigos podem ser vinculados a campanhas
- Campanhas têm período de vigência

---

#### História 7.2: Metas e Tiers de Bônus
**Prioridade:** Média  
**Estimativa:** 5 pontos

**Tarefas:**
- [ ] Definir metas por campanha (ex: 10, 50, 100 conversões)
- [ ] Definir tiers de bônus por meta alcançada
- [ ] Calcular progresso do afiliado em relação à meta
- [ ] Aplicar bônus automaticamente quando meta é atingida

**Critérios de Aceitação:**
- Metas são configuráveis por campanha
- Progresso é atualizado em tempo real
- Bônus é aplicado automaticamente

---

#### História 7.3: Ranking e Badges
**Prioridade:** Baixa  
**Estimativa:** 5 pontos

**Tarefas:**
- [ ] Calcular ranking por campanha (conversões, receita)
- [ ] Exibir top 10 afiliados
- [ ] Sistema de badges (ex: "Top Performer", "Rising Star")
- [ ] Opção de ocultar ranking (configurável)

**Critérios de Aceitação:**
- Ranking é atualizado periodicamente
- Badges são atribuídos automaticamente
- Ranking pode ser desabilitado por campanha

---

### Épico 8: Antifraude Mínimo Viável

#### História 8.1: Detecção de Padrões Suspeitos
**Prioridade:** Alta  
**Estimativa:** 8 pontos

**Tarefas:**
- [ ] Alertar conversões com churn em 24-48h
- [ ] Alertar muitos trials do mesmo IP ou device
- [ ] Alertar mesmo cartão em várias contas
- [ ] Alertar picos fora do padrão
- [ ] Score de risco por afiliado (0-100)

**Critérios de Aceitação:**
- Alertas são gerados automaticamente
- Admin recebe notificação de padrões suspeitos
- Score de risco é calculado e atualizado

---

#### História 8.2: Quarentena de Conversões
**Prioridade:** Alta  
**Estimativa:** 5 pontos

**Tarefas:**
- [ ] Marcar conversões como `quarantined`
- [ ] Lista de conversões em quarentena no painel admin
- [ ] Ações: aprovar, rejeitar, manter em quarentena
- [ ] Modo "hold estendido" para afiliados sob investigação

**Critérios de Aceitação:**
- Conversões suspeitas são automaticamente colocadas em quarentena
- Admin pode revisar e decidir sobre cada caso
- Hold estendido bloqueia pagamentos até investigação

---

#### História 8.3: Prevenção de Autoindicação e Tráfego Incentivado
**Prioridade:** Alta  
**Estimativa:** 5 pontos

**Tarefas:**
- [ ] Verificar se afiliado está tentando usar próprio código
- [ ] Detectar padrões de tráfego incentivado ("instala aí e ganha")
- [ ] Bloquear conversões suspeitas automaticamente
- [ ] Notificar admin de tentativas bloqueadas

**Critérios de Aceitação:**
- Autoindicação é detectada e bloqueada
- Tráfego incentivado é identificado
- Admin é notificado de tentativas bloqueadas

---

### Épico 9: Payout Automatizado

#### História 9.1: Configuração de Métodos de Pagamento
**Prioridade:** Alta  
**Estimativa:** 5 pontos

**Tarefas:**
- [ ] Formulário para afiliado cadastrar método de pagamento
- [ ] Suporte: PayPal, Wise, Transferência bancária
- [ ] Validação de dados bancários/PayPal
- [ ] Histórico de métodos cadastrados

**Critérios de Aceitação:**
- Afiliado pode cadastrar múltiplos métodos
- Dados são validados antes de salvar
- Método padrão pode ser definido

---

#### História 9.2: Regras de Saque
**Prioridade:** Alta  
**Estimativa:** 5 pontos

**Tarefas:**
- [ ] Configurar valor mínimo de saque
- [ ] Configurar calendário de pagamentos (ex: todo dia 15)
- [ ] Configurar hold por período
- [ ] Validar regras antes de processar payout

**Critérios de Aceitação:**
- Valor mínimo é respeitado
- Calendário de pagamentos funciona corretamente
- Hold é aplicado conforme configurado

---

#### História 9.3: Processamento Automático de Payouts
**Prioridade:** Alta  
**Estimativa:** 8 pontos

**Tarefas:**
- [ ] Job agendado para processar payouts
- [ ] Integração com PayPal API
- [ ] Integração com Wise API
- [ ] Geração de faturas/recibos
- [ ] Atualização de status: `paid`
- [ ] Notificação por email ao afiliado

**Critérios de Aceitação:**
- Payouts são processados automaticamente no calendário
- Integrações funcionam corretamente
- Faturas são geradas e enviadas
- Afiliado recebe confirmação por email

---

### Épico 10: Relatórios Avançados

#### História 10.1: Export CSV
**Prioridade:** Média  
**Estimativa:** 3 pontos

**Tarefas:**
- [ ] Botão "Exportar CSV" no dashboard
- [ ] Exportar métricas por período
- [ ] Exportar lista de conversões (anonimizado)
- [ ] Download direto do arquivo

**Critérios de Aceitação:**
- CSV é gerado corretamente
- Dados pessoais são anonimizados
- Download funciona em todos os browsers

---

#### História 10.2: Detalhamento por Dia, País, Plataforma, Campanha
**Prioridade:** Média  
**Estimativa:** 5 pontos

**Tarefas:**
- [ ] Filtros no dashboard: data, país, plataforma, campanha
- [ ] Gráficos de evolução temporal
- [ ] Tabelas com breakdown por dimensão
- [ ] Comparação entre períodos

**Critérios de Aceitação:**
- Filtros funcionam corretamente
- Gráficos são legíveis e precisos
- Performance é aceitável com muitos dados

---

#### História 10.3: Lista de Conversões Detalhada
**Prioridade:** Média  
**Estimativa:** 5 pontos

**Tarefas:**
- [ ] Tabela com todas as conversões do afiliado
- [ ] Colunas: data, código usado, status, comissão
- [ ] Dados anonimizados (sem email, nome completo)
- [ ] Filtros e busca

**Critérios de Aceitação:**
- Lista é paginada e performática
- Dados pessoais não são expostos
- Filtros e busca funcionam corretamente

---

## Fase 3: Todas as Redes

### Épico 11: Painéis Administrativos Avançados

#### História 11.1: Visão Geral de Performance (Admin)
**Prioridade:** Alta  
**Estimativa:** 8 pontos

**Tarefas:**
- [ ] Dashboard admin com métricas agregadas:
  - CAC por canal e por rede
  - LTV por fonte
  - ROI por campanha, afiliado, país
  - Funil completo: código -> cadastro -> trial -> pagante -> retenção
  - Receita líquida e comissão projetada
- [ ] Gráficos e visualizações
- [ ] Comparação entre períodos

**Critérios de Aceitação:**
- Métricas são calculadas corretamente
- Visualizações são claras e acionáveis
- Performance é aceitável

---

#### História 11.2: Gestão Avançada de Afiliados
**Prioridade:** Alta  
**Estimativa:** 5 pontos

**Tarefas:**
- [ ] Categorizar afiliados (tier A, B, C)
- [ ] Limites por afiliado: cap de trials por dia, cap por país
- [ ] Bloqueios e sanções
- [ ] Histórico de termos aceitos e versão de contrato
- [ ] Notas e tags por afiliado

**Critérios de Aceitação:**
- Admin pode gerenciar todos os aspectos do afiliado
- Limites são aplicados automaticamente
- Histórico completo é mantido

---

#### História 11.3: Gestão de Ofertas e Regras
**Prioridade:** Alta  
**Estimativa:** 8 pontos

**Tarefas:**
- [ ] Criar ofertas: "1 semana Plus grátis apenas com convite"
- [ ] Definir regras de elegibilidade:
  - Somente primeiro cadastro
  - Somente novo dispositivo
  - Somente novo email
- [ ] Definir comissão: percentual, período (ex: 50% por 12 meses)
- [ ] Definir hold e janela de estorno
- [ ] Definir tiers da meta do cohort

**Critérios de Aceitação:**
- Ofertas são configuráveis e flexíveis
- Regras são aplicadas corretamente
- Comissões são calculadas conforme configurado

---

#### História 11.4: Feed de Eventos em Tempo Real
**Prioridade:** Média  
**Estimativa:** 8 pontos

**Tarefas:**
- [ ] Painel com feed de eventos em tempo real
- [ ] Eventos: código exibido, código aplicado, trial ativado, pagamento aprovado, renovação, cancelamento, refund, chargeback
- [ ] Filtros por tipo de evento, afiliado, período
- [ ] Busca e export

**Critérios de Aceitação:**
- Feed atualiza em tempo real (WebSocket ou polling)
- Filtros funcionam corretamente
- Performance é aceitável com muitos eventos

---

#### História 11.5: Ferramentas de Override com Auditoria
**Prioridade:** Baixa  
**Estimativa:** 5 pontos

**Tarefas:**
- [ ] Interface para override manual de atribuição
- [ ] Requer aprovação de múltiplos admins (2FA)
- [ ] Log completo de override com motivo
- [ ] Notificação de override para afiliados afetados

**Critérios de Aceitação:**
- Override requer aprovação dupla
- Tudo é auditado
- Afiliados são notificados

---

#### História 11.6: Regras de Deduplicação
**Prioridade:** Alta  
**Estimativa:** 5 pontos

**Tarefas:**
- [ ] Política: um usuário, um afiliado
- [ ] Detectar múltiplas atribuições do mesmo usuário
- [ ] Aplicar regra de "primeiro código vence" ou "último código vence"
- [ ] Notificar admin de conflitos

**Critérios de Aceitação:**
- Deduplicação funciona corretamente
- Política é aplicada consistentemente
- Admin é notificado de conflitos

---

### Épico 12: Painel de Fraude e Risk

#### História 12.1: Dashboard de Risk
**Prioridade:** Alta  
**Estimativa:** 8 pontos

**Tarefas:**
- [ ] Visão geral de score de risco por afiliado
- [ ] Lista de conversões em quarentena
- [ ] Lista de chargebacks e refunds
- [ ] Gráficos de tendências de fraude
- [ ] Alertas de padrões suspeitos

**Critérios de Aceitação:**
- Dashboard é claro e acionável
- Alertas são destacados
- Dados são atualizados em tempo real

---

#### História 12.2: Gestão de Casos de Fraude
**Prioridade:** Alta  
**Estimativa:** 5 pontos

**Tarefas:**
- [ ] Abrir caso de fraude por conversão
- [ ] Adicionar evidências e notas
- [ ] Aprovar ou rejeitar conversão
- [ ] Aplicar sanções ao afiliado se necessário
- [ ] Histórico completo do caso

**Critérios de Aceitação:**
- Casos podem ser criados e gerenciados
- Histórico completo é mantido
- Sanções são aplicadas corretamente

---

### Épico 13: Financeiro e Conciliação

#### História 13.1: Ledger Completo de Comissões
**Prioridade:** Alta  
**Estimativa:** 8 pontos

**Tarefas:**
- [ ] Ledger por mês, por usuário, por afiliado
- [ ] Regras de cálculo: receita líquida após taxa de loja, impostos, refunds
- [ ] Fechamento mensal: gerar fatura de payout
- [ ] Export contábil (CSV, PDF)
- [ ] Status: pending, cleared, paid

**Critérios de Aceitação:**
- Cálculos são precisos e auditáveis
- Fechamento mensal funciona corretamente
- Exports são gerados corretamente

---

#### História 13.2: Integração com Provedor de Pagamento
**Prioridade:** Média  
**Estimativa:** 5 pontos

**Tarefas:**
- [ ] Sincronizar transações do provedor de pagamento
- [ ] Conciliação automática de pagamentos
- [ ] Detectar discrepâncias
- [ ] Relatório de conciliação

**Critérios de Aceitação:**
- Sincronização funciona automaticamente
- Discrepâncias são detectadas e reportadas
- Conciliação é precisa

---

### Épico 14: Compliance e Legal

#### História 14.1: Gestão de Termos do Programa
**Prioridade:** Alta  
**Estimativa:** 5 pontos

**Tarefas:**
- [ ] Versões de termos do programa
- [ ] Afiliados devem aceitar termos ao cadastrar
- [ ] Notificação de mudanças de termos
- [ ] Histórico de aceitação por versão

**Critérios de Aceitação:**
- Termos são versionados
- Aceitação é obrigatória
- Histórico completo é mantido

---

#### História 14.2: Regras de Comunicação e Claims
**Prioridade:** Alta  
**Estimativa:** 5 pontos

**Tarefas:**
- [ ] Lista de claims permitidos (especialmente saúde)
- [ ] Lista de claims proibidos
- [ ] Guidelines de comunicação
- [ ] Sistema de denúncia de claims não permitidos

**Critérios de Aceitação:**
- Claims são claramente definidos
- Denúncias são processadas
- Afiliados são notificados de violações

---

#### História 14.3: Logs de Consentimento LGPD/GDPR
**Prioridade:** Alta  
**Estimativa:** 5 pontos

**Tarefas:**
- [ ] Registrar consentimento de uso de dados
- [ ] Permitir revogação de consentimento
- [ ] Export de dados pessoais (LGPD)
- [ ] Exclusão de dados (direito ao esquecimento)

**Critérios de Aceitação:**
- Consentimento é registrado e auditável
- Revogação funciona corretamente
- Exports e exclusões são processados dentro do prazo legal

---

#### História 14.4: KYC para Payout
**Prioridade:** Média  
**Estimativa:** 8 pontos

**Tarefas:**
- [ ] Solicitar KYC quando payout ultrapassa valor limite
- [ ] Upload de documentos (RG, CPF, comprovante de endereço)
- [ ] Validação de documentos
- [ ] Aprovação/rejeição de KYC
- [ ] Bloqueio de payout até KYC aprovado

**Critérios de Aceitação:**
- KYC é solicitado automaticamente
- Documentos são validados
- Payout é bloqueado até aprovação

---

#### História 14.5: Banlist, Watchlist e Sanções
**Prioridade:** Média  
**Estimativa:** 5 pontos

**Tarefas:**
- [ ] Lista de afiliados banidos
- [ ] Lista de afiliados em watchlist
- [ ] Aplicar sanções automáticas
- [ ] Histórico de sanções

**Critérios de Aceitação:**
- Listas são gerenciáveis
- Sanções são aplicadas automaticamente
- Histórico completo é mantido

---

### Épico 15: Suporte e Disputas

#### História 15.1: Sistema de Tickets
**Prioridade:** Alta  
**Estimativa:** 8 pontos

**Tarefas:**
- [ ] Afiliado pode abrir ticket por conversão contestada
- [ ] Motivos de rejeição: fraude, chargeback, autoindicação, duplicidade
- [ ] Admin pode responder e resolver tickets
- [ ] SLA e trilha de auditoria do caso
- [ ] Notificações por email

**Critérios de Aceitação:**
- Tickets são criados e gerenciados corretamente
- SLA é monitorado
- Trilha de auditoria é completa

---

### Épico 16: Integrações com Redes de Afiliados

#### História 16.1: Postback Endpoint (S2S)
**Prioridade:** Média  
**Estimativa:** 8 pontos

**Tarefas:**
- [ ] Endpoint de conversão (S2S postback)
- [ ] Assinatura/segredo para validação
- [ ] Mapeamento de evento e payout por rede
- [ ] Logs e replay de postbacks
- [ ] Tratamento de falhas e retry

**Critérios de Aceitação:**
- Postback é recebido e validado corretamente
- Mapeamento funciona para múltiplas redes
- Logs são completos e auditáveis

---

#### História 16.2: Deduplicação Multi-Rede
**Prioridade:** Alta  
**Estimativa:** 8 pontos

**Tarefas:**
- [ ] Detectar quando mesma conversão vem de múltiplas redes
- [ ] Aplicar regra de deduplicação (primeira rede vence, ou última)
- [ ] Notificar admin de conflitos
- [ ] Evitar pagamento duplo

**Critérios de Aceitação:**
- Deduplicação funciona corretamente
- Pagamento duplo é evitado
- Admin é notificado de conflitos

---

#### História 16.3: Export de Relatórios para Redes
**Prioridade:** Baixa  
**Estimativa:** 5 pontos

**Tarefas:**
- [ ] Gerar relatórios no formato exigido por cada rede
- [ ] Agendar export automático
- [ ] Enviar relatórios por email ou API

**Critérios de Aceitação:**
- Relatórios são gerados no formato correto
- Exports são agendados e executados
- Redes recebem relatórios automaticamente

---

### Épico 17: BI e Segmentação Avançada

#### História 17.1: Métricas Instrumentadas
**Prioridade:** Alta  
**Estimativa:** 5 pontos

**Tarefas:**
- [ ] Instrumentar desde o dia 1:
  - Conversão trial -> pagante
  - Retenção D30 do cohort por afiliado
  - Churn 7 dias e 30 dias por afiliado
  - Chargeback rate por afiliado
  - CAC efetivo por afiliado (comissão paga / assinantes retidos)
  - LTV por fonte
- [ ] Dashboard de métricas críticas
- [ ] Alertas quando métricas saem do esperado

**Critérios de Aceitação:**
- Todas as métricas são calculadas corretamente
- Dashboard é claro e acionável
- Alertas funcionam corretamente

---

#### História 17.2: Segmentação Avançada
**Prioridade:** Média  
**Estimativa:** 5 pontos

**Tarefas:**
- [ ] Segmentar afiliados por performance
- [ ] Segmentar conversões por características
- [ ] Criar coortes customizados
- [ ] Comparar performance entre segmentos

**Critérios de Aceitação:**
- Segmentação é flexível e poderosa
- Comparações são precisas
- Performance é aceitável

---

## Regras de Negócio Essenciais

### RN-001: Código só vale no cadastro
- Código deve ser aplicado durante o cadastro
- Não pode ser aplicado após cadastro completo

### RN-002: Free trial de 1 semana só com código válido
- Trial de 1 semana é exclusivo para novos usuários com código válido
- Usuários sem código não têm direito ao trial estendido

### RN-003: Comissão só conta quando vira pagante
- Comissão é calculada apenas quando primeiro pagamento é aprovado
- Trials não geram comissão

### RN-004: Comissão mensal por até 12 meses
- Comissão é paga mensalmente por até 12 meses
- Após 12 meses, comissão cessa

### RN-005: Hold de 30 dias
- Comissão fica em hold por 30 dias antes de ser liberada
- Hold pode ser estendido em casos de fraude

### RN-006: Sem autoindicação
- Afiliado não pode usar próprio código
- Sistema detecta e bloqueia tentativas

### RN-007: Sem tráfego incentivado
- Tráfego incentivado ("instala aí e ganha") é proibido
- Sistema detecta e bloqueia padrões suspeitos

### RN-008: Política de chargeback
- Chargeback estorna comissão daquele período
- Chargeback pode penalizar tier do afiliado

---

## Métricas Críticas (KPIs)

### Métricas de Conversão
- Taxa de conversão: código exibido -> código aplicado
- Taxa de conversão: código aplicado -> trial iniciado
- Taxa de conversão: trial -> pagante
- Taxa de conversão: pagante -> retenção D30

### Métricas de Performance
- CAC efetivo por afiliado (comissão paga / assinantes retidos)
- LTV por fonte
- ROI por campanha, afiliado, país
- Retenção D7, D30 por coorte

### Métricas de Risk
- Chargeback rate por afiliado
- Churn 7 dias e 30 dias por afiliado
- Score de risco por afiliado
- Taxa de conversões em quarentena

---

## Notas Técnicas

### Arquitetura Recomendada
- Backend: API RESTful + WebSockets para eventos em tempo real
- Banco de dados: PostgreSQL com tabelas de eventos (append-only)
- Fila de processamento: Para eventos assíncronos
- Cache: Redis para métricas calculadas
- Jobs agendados: Para cálculos de comissão, payouts, relatórios

### Integrações Necessárias
- RevenueCat: Webhooks para eventos de assinatura
- PayPal: API para payouts
- Wise: API para payouts
- Provedor de pagamento: Para sincronização de transações

### Segurança
- Autenticação: JWT ou similar
- Autorização: RBAC por rota
- Auditoria: Log de todas as ações críticas
- Validação: Validação rigorosa de inputs
- Rate limiting: Proteção contra abuso

---

## Priorização Sugerida

### Crítico (Fase 1)
- Autenticação e RBAC
- Geração de códigos e links
- Página pública do código
- Integração com app (onboarding)
- Motor de eventos
- Dashboard básico do afiliado
- Ledger básico de comissões

### Alta (Fase 2)
- Campanhas e coortes
- Antifraude mínimo viável
- Payout automatizado
- Relatórios avançados
- Painéis administrativos

### Média/Baixa (Fase 3)
- Integrações com redes
- BI avançado
- Compliance internacional
- Ferramentas de override

---

## Definição de Pronto (DoD)

Cada história está pronta quando:
- [ ] Código foi revisado e aprovado
- [ ] Testes unitários foram escritos e passam
- [ ] Testes de integração foram escritos e passam
- [ ] Testes manuais foram realizados
- [ ] Documentação foi atualizada
- [ ] Critérios de aceitação foram atendidos
- [ ] Performance é aceitável
- [ ] Acessibilidade foi verificada (se aplicável)
- [ ] Deploy foi realizado em ambiente de staging
- [ ] QA aprovou a funcionalidade

