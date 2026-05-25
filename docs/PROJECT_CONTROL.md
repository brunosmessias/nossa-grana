# PROJECT CONTROL - Nossa Grana V2

## 1) North Star (Onde queremos chegar)
Entregar um sistema financeiro familiar com arquitetura escalável, rastreabilidade de decisões e regras de negócio totalmente cobertas por testes, com UX moderna e consistente.

Arquitetura alvo de referência:
- `docs/SDD_NOSSA_GRANA_V2.md` (seção de arquitetura alvo)
- origem conceitual: `Pessoal/nossa-grana/ARQUITETURA_FINAL_NOSSA_GRANA.md`

## 2) Objetivos finais obrigatórios
- Domínios completos: families, accounts, transactions, transfers, budgets, goals, categories, settings, ai-assistant.
- Auditoria completa por evento de negócio.
- 100% das regras de negócio críticas com testes unitários + integração.
- Fluxos críticos com e2e.
- Documentação viva por feature no padrão TLC.
- Convergência para arquitetura final: contas como entidade central, transferências explícitas, categorias semânticas flexíveis, budgets e goals nativos.

## 3) Regras de engenharia permanentes
- Sem `any` explícito.
- Arquivos com no máximo 500 linhas.
- Sem duplicação estrutural e sem re-export inútil.
- Sem prop drilling excessivo.
- Formularios usando TanStack Form + Zod compartilhado.
- UI de criação/edição por modal.

## 4) Estado atual (baseline)
Data: 2026-05-11

Concluído:
- Projeto `nossa-grana-v2` criado do zero.
- Stack base: Next 16 + React 19 + BetterAuth (dependência) + tRPC + Drizzle + Zod + TanStack Form.
- Estrutura inicial por domínio criada.
- Primeiros schemas compartilhados (`account`).
- Base de auditoria criada (`auditEvents`, `AuditRecord`, persistência em `audit_logs`).
- Configuração de testes: Vitest + Playwright (smoke).
- Governança TLC inicial criada em `.specs`.
- Auth implementado: OTP por e-mail + Google + auto-registro.
- Família implementado: criação no onboarding, convite por e-mail e aceite por token.

Pendente imediato:
- Rodar geração/migrations do Better Auth + Drizzle no banco PostgreSQL real.
- Fechar telas de gestão de família (listar membros, reenviar/cancelar convite).
- Implementar persistência real de contas/transações com auditoria.
- Implementar design-system base (componentes core em shadcn/ui).
- Ampliar cobertura de testes por regra.

## 5) Controle de entregas

### Entrega 001 - Bootstrap V2
- Status: Concluída
- Objetivo: Criar fundação técnica e documental.
- Evidências:
  - `package.json`, `tsconfig.json`, `.eslintrc.cjs`
  - `src/shared/schemas/account.ts`
  - `src/server/audit/*`
  - `.specs/project/*`


### Entrega 002 - Auth + Family Bootstrap
- Status: Concluída (código base)
- Objetivo: Implementar autenticação passwordless/social e onboarding de família com convites.
- Evidências:
  - `src/server/auth/*`, `src/app/api/auth/[...all]/route.ts`
  - `src/app/sign-in/*`, `src/app/onboarding/*`
  - `src/app/api/family/**`, `src/server/services/family-service.ts`
  - `src/server/email/*`, `src/server/db/schema.ts`

### Próxima entrega sugerida (003)
- Objetivo: Vertical slice de `accounts` (listagem + modal create/edit + persistência + auditoria + testes).
- Critérios de pronto:
  - API tRPC real + Drizzle PostgreSQL
  - Evento `account.created` e `account.updated`
  - Testes unitários/integration/e2e mínimos
  - Docs TLC da feature atualizados

### Entrega 004 - Transferências e consistência de saldos
- Status: Planejada
- Objetivo: implementar `transfers` com rastreabilidade e impacto consistente no saldo.
- Critérios de pronto:
  - Modelo de transferência definido (entidade própria ou composição de 2 transações)
  - Auditoria de `transfer.created` e `transfer.reverted` (quando aplicável)
  - Regras de validação (conta origem/destino, saldo, permissão)
  - Testes unitários/integration/e2e mínimos

### Entrega 005 - Budgets e Goals
- Status: Planejada
- Objetivo: adicionar planejamento financeiro com orçamentos e metas.
- Critérios de pronto:
  - Budget por período/categoria
  - Goal com progresso calculado sobre contas/transações
  - Feedback visual no dashboard (cards, progresso, alertas)
  - Testes de regras críticas

### Entrega 006 - Convergência avançada (automação + base para IA)
- Status: Planejada
- Objetivo: preparar domínio para automações e entrada assistida sem quebrar o core.
- Critérios de pronto:
  - contratos de entrada extensíveis (texto/voz estruturável)
  - trilha de auditoria para ações automatizadas
  - guardrails de permissão e validação para automações
  - documentação de decisões e limites da fase

## 6.1 Decisões abertas que impactam roadmap
- D01: granularidade final de RBAC por perfil e ação em produção
- D02: estratégia final de transferências (entidade própria vs composição de transações)
- D03: rollout de categorias flexíveis (`suggestedType`) sem regressão de UX
- D04: ordem de priorização entre `budgets`, `goals` e automação assistida

## 6) Como manter este documento vivo
- Toda entrega deve atualizar:
  - seção "Estado atual"
  - seção "Controle de entregas"
  - próximos passos do ciclo seguinte
