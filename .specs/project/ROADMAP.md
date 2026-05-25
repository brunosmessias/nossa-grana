# ROADMAP - Nossa Grana V2

**Current Milestone:** Fase 2 - Core financeiro (avançado)
**Status:** In Progress

---

## Fase 1 - Fundação ✅

**Goal:** Infraestrutura técnica básica funcionando
**Status:** COMPLETE

### Features

**Bootstrap técnico** - COMPLETE
- Next.js 16 + App Router + RSC
- Tailwind CSS v4 + shadcn/ui (base-nova)
- Drizzle ORM + PostgreSQL
- tRPC v11 + Route Handlers dual

**Autenticação** - COMPLETE
- better-auth com Google OAuth + Email OTP
- Onboarding de família com convite por email
- Sessão protegida via `getRequiredSession()`

**Auditoria** - COMPLETE
- `writeAuditLog()` em toda mutação
- Eventos centralizados em `events.ts`
- Snapshots before/after em JSON

**Design-system base** - COMPLETE
- Componentes shadcn/ui (base-nova, @base-ui/react)
- Dark mode default, fonte Inter
- `cn()`, `IconBadge`, `CurrencyInput`

---

## Fase 2 - Core financeiro (avançado)

**Goal:** Decompor o dashboard monolítico em páginas dedicadas com inteligência — gráficos, comparadores, progresso de metas.

### Features

**Contas (com metas)** - PLANNED

- Página dedicada com cards de saldo por conta e totalizadores por tipo
- Contas com meta (GOAL, SAVINGS, INVESTMENT): barra de progresso, cálculo de aporte mensal necessário, projeção de conclusão
- Mini gráfico de evolução do saldo por conta
- Transferência entre contas (fluxo "Guardar dinheiro")
- Criar, editar, arquivar contas

**Categorias (com comparadores)** - PLANNED

- Orçamento mensal por categoria (`monthlyBudgetCents`)
- Comparativo mês atual vs. anterior com trend indicators
- Gráfico de distribuição de gastos (donut) e série temporal por categoria
- Categorias estouradas com destaque visual
- Top 3 que mais cresceram e que mais reduziram
- Criar, editar categorias com ícone, cor e orçamento

**Transações** - PLANNED

- Tabela completa com paginação e busca por descrição
- Filtros avançados: conta, categoria, tipo, período, faixa de valor
- Agrupamento por dia, semana, mês ou categoria
- Resumo lateral com totais filtrados
- Editar e excluir transações

**Família (gestão)** - PLANNED

- Membros com role e badge
- Criar e gerenciar convites
- Editar nome da família
- Remover membros (OWNER/ADMIN only)

---

## Fase 3 - Metas e Orçamentos

**Goal:** Sistema completo de planejamento financeiro

### Features

**Orçamento mensal** - PLANNED

- Orçamento por categoria (via `monthlyBudgetCents`)
- Orçamento geral do mês
- Alertas ao se aproximar do limite
- Barra de progresso no dashboard

**Metas financeiras** - PLANNED

- Progresso visual com projeção
- Celebração ao atingir meta
- Histórico de aportes

**Transferências** - PLANNED

- Transferência entre contas
- Substituir placeholder atual do savings-dialog

---

## Fase 4 - Inteligência e Relatórios

**Goal:** Insights automáticos e relatórios

### Features

**Relatórios mensais** - PLANNED
**Insights automáticos** - PLANNED
**Health score** - PLANNED

---

## Fase 5 - Futuro

- PWA com notificações push
- Exportação (PDF/CSV)
- Transações recorrentes automáticas
- Importação de extrato (OFX/CSV)
- Multi-moeda

---

## Mudanças no banco de dados (Fase 2)

### `accounts` — novas colunas:
- `targetAmountCents` integer nullable — valor alvo para metas
- `targetDate` timestamp nullable — data alvo da meta

### `categories` — nova coluna:
- `monthlyBudgetCents` integer nullable — orçamento mensal

### Lib de gráficos
- Adicionar **Recharts** (`recharts`)
