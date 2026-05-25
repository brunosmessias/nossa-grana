# SDD - Nossa Grana v2

Status: Ativo
Data base: 2026-05-13
Projeto: `nossa-grana-v2`

## 0. Diretriz de base para novos projetos

- Base oficial obrigatória: `Pessoal/base` (boilerplate Create T3).
- Regra de equipe: novos projetos não começam mais de estrutura vazia ou ad-hoc; começam da base T3 e adaptam via SDD.
- Motivo: padronização arquitetural, aceleração de bootstrap e menor risco de divergência técnica.

### 0.1 Checklist de adaptação inicial (T3 -> padrão SDD)
1. Atualizar nome/identidade do projeto e variáveis de ambiente.
2. Trocar schema placeholder por schema inicial real do domínio.
3. Gerar/aplicar migration inicial e validar ciclo de banco local.
4. Instalar e configurar shadcn/ui + app shell padrão (sidebar inset + header).
5. Configurar RBAC base (rota + ação) e contratos de erro/auditoria.
6. Padronizar formulários com TanStack Form + Zod compartilhado.
7. Garantir gates iniciais de qualidade (`lint`, `typecheck`, unit, smoke E2E).

## 1. Contexto e Escopo

### 1.1 Contexto do produto
- Problema: famílias têm dificuldade de centralizar e operar finanças compartilhadas com rastreabilidade e governança.
- Público-alvo: famílias e grupos domésticos que precisam gerir contas, categorias, transações, orçamentos e metas.
- Objetivo de negócio: substituir o legado com arquitetura moderna, auditável e orientada a regras de negócio.

### 1.2 Escopo in/out
- In scope (fase atual):
  - autenticação (OTP + social)
  - onboarding de família
  - convites de membros
  - dashboard autenticado
  - base de domínios financeiros (accounts/categories/transactions)
  - padronização de layout e UX admin
- Out of scope (fase atual):
  - assistente de IA completo em produção
  - módulos avançados fora dos domínios core sem validação de produto

### 1.3 Stakeholders e papéis
- Product Owner: Bruno
- Tech Lead: Bruno
- Design: definido por especificação interna com referência `shadcn-admin`
- QA: processo guiado por Vitest + Playwright
- Segurança: responsabilidade de arquitetura/backend do projeto

## 2. Requisitos funcionais

### 2.1 Lista de features
- F01: autenticação com Better Auth (OTP por e-mail + Google)
- F02: criação de família no onboarding
- F03: convite por e-mail e aceite por token
- F04: dashboard autenticado com app shell padrão
- F05: CRUD financeiro inicial (accounts/categories/transactions)

### 2.2 Fluxos críticos
- Fluxo 1: usuário autentica -> cria família -> entra no dashboard
- Fluxo 2: owner envia convite -> membro aceita convite -> vínculo com família
- Fluxo 3: usuário cria/edita registros financeiros com auditoria

### 2.3 Regras de negócio-chave
- RN01: toda operação sensível deve gerar auditoria com contexto de usuário e ação
- RN02: criação/edição na UI deve ocorrer por modal
- RN03: permissões devem ser avaliadas por rota e por ação

## 3. Requisitos não funcionais

### 3.1 Segurança
- AuthN/AuthZ com sessão e políticas do Better Auth
- RBAC por rota/página e por ação
- validação de input com Zod (client + server)
- segredos apenas no server e `.env.example` como referência versionada
- auditoria de ações sensíveis com campos mínimos padronizados

### 3.2 Performance
- metas por rota crítica:
  - LCP <= 2.5s
  - INP <= 200ms
- orçamento inicial de bundle por rota autenticada: <= 250KB gzip (JS)

### 3.3 Acessibilidade
- alvo mínimo: WCAG AA
- checklist operacional em PR: teclado, foco visível, aria-label e contraste

### 3.4 Confiabilidade/Operação
- logs mínimos de erro no frontend e backend
- métricas básicas de uso em ações principais
- monitoramento de falhas de fluxos críticos

## 4. Arquitetura e Stack

### 4.1 Stack obrigatória
- Framework: Next.js (App Router) + React + TypeScript
- UI: shadcn/ui (componentes locais) + Radix primitives
- CSS: Tailwind CSS v4 (`@theme`)
- API: tRPC + React Query
- Banco: PostgreSQL + Drizzle ORM
- Auth: Better Auth (OTP + social)
- Formulários: TanStack Form (`@tanstack/react-form`)
- Validação: Zod compartilhado entre front e backend
- Tabelas/Listas: TanStack Table + TanStack Virtual (alto volume)
- Testes: Vitest + Playwright
- Qualidade: ESLint + TypeScript strict
- Dev DX: React Query Devtools em desenvolvimento

### 4.2 Decisões arquiteturais
- ADR-001: criação/edição via modal por padrão.
- ADR-002: RBAC obrigatório por rota e por ação, validado no backend.
- ADR-003: área autenticada usa app shell com sidebar inset + header global (padrão shadcn-admin).
- ADR-004: todas as features implementam estados loading/vazio/erro/sem permissão.
- ADR-005: contrato único de erro para frontend.
- ADR-006: ThemeProvider client-side com script blocking inline para evitar FOUC em dark mode.
- ADR-007: Botões de ação no header/sidebar usam `variant="outline"` para garantir contraste em dark mode.

### 4.3 Estrutura de pastas alvo
```
src/
├── app/
│   ├── (auth)/          # Layout público
│   ├── (dashboard)/     # Layout autenticado
│   ├── api/
│   │   ├── auth/[...all]/route.ts
│   │   └── trpc/[trpc]/route.ts
│   └── layout.tsx       # Root layout (ThemeProvider, TooltipProvider)
├── components/
│   ├── ui/              # shadcn/ui (não editar diretamente)
│   ├── layout/          # AppSidebar, Header
│   ├── data-table/      # Componentes de tabela reutilizáveis
│   ├── theme-provider.tsx
│   ├── theme-switch.tsx
│   ├── search.tsx
│   └── profile-dropdown.tsx
├── features/*           # Feature modules (auth, accounts, transactions, etc.)
├── server/
│   ├── db/              # Drizzle schema + connection
│   ├── api/             # tRPC routers
│   └── better-auth/     # Auth config
├── shared/
│   └── schemas/         # Zod schemas compartilhados
├── trpc/                # tRPC client setup
├── hooks/               # Custom hooks (use-mobile, etc.)
├── lib/                 # Utils e auth-client
├── types/               # Type declarations
└── styles/
    └── globals.css
```

### 4.4 Arquitetura alvo (visão final do produto)
- Referência estratégica: `Pessoal/nossa-grana/ARQUITETURA_FINAL_NOSSA_GRANA.md` (2026-01-20).
- Objetivo: convergir o `nossa-grana-v2` para um modelo financeiro completo, mantendo simplicidade operacional.

Princípios de arquitetura final:
- Separar claramente **contas** (onde o dinheiro está) de **transações** (eventos financeiros).
- Tratar **transferências** como fluxo interno entre contas, com rastreabilidade explícita.
- Usar **categorias com significado semântico**, sem impor rigidamente direção financeira.
- Implementar **orçamentos e metas** como módulos nativos do domínio financeiro.
- Evoluir RBAC para granularidade familiar por perfil e por ação.
- Preparar base para automações e entrada assistida (incluindo IA) sem acoplamento prematuro.

Modelo-alvo de domínio (alto nível):
- `Family` e `FamilyMember` como contexto de colaboração.
- `Account` como entidade financeira principal (checking, savings, cash, investment, card, loan, goal-account).
- `Transaction` com direção explícita (`IN`/`OUT`), vinculada à conta.
- `Transfer` para movimentação entre contas (entidade própria ou composição de duas transações vinculadas).
- `Category` com `suggestedType` opcional (dica de UX), sem travar regra de domínio.
- `Budget` por período/categoria e `Goal` para progresso financeiro orientado a alvo.

## 5. Sistema de design e layout

### 5.1 App shell padrão (padrão shadcn-admin)

O layout autenticado segue o padrão do projeto shadcn-admin com sidebar inset:

**Estrutura hierárquica:**
```
<SidebarProvider>          # Gerencia estado open/collapsed
  <AppSidebar />           # Sidebar com variant="inset" + collapsible="icon"
  <SidebarInset>           # Container do conteúdo principal
    <Header />             # Navbar com trigger + search + ações
    <main />               # Conteúdo da página
  </SidebarInset>
</SidebarProvider>
```

**Sidebar (`AppSidebar`):**
- Componente: `<Sidebar collapsible="icon" variant="inset">`
- `SidebarHeader`: Logo + nome do app com link para home
- `SidebarContent`: Menu de navegação filtrado por role do usuário (`SidebarGroup` + `SidebarMenuButton` com `tooltip` e `isActive`)
- `SidebarFooter`: User button com dropdown (avatar + nome + email + ChevronsUpDown), usar `bg-card text-card-foreground` para contraste no dark mode
- `SidebarRail`: Handle de redimensionamento lateral
- Colapso: ao colapsar, mostra apenas ícones com tooltips
- Mobile: drawer automático via `SidebarProvider` + `Sheet`

**Header/Navbar:**
- Componente: `<Header>` dentro de `<SidebarInset>`
- Altura fixa: `h-16`
- Composição da barra (esquerda → direita):
  1. `SidebarTrigger` (variant="outline") — toggle da sidebar
  2. `Separator` vertical
  3. `Search` — botão de busca com `⌘K` placeholder
  4. `ThemeSwitch` — dropdown Claro/Escuro/Sistema (ícone Sun/Moon animado)
  5. `ProfileDropdown` — avatar com dropdown de perfil e logout
- Suporte a `fixed` com blur backdrop on scroll

**Dashboard page:**
- Grid de 4 cards de métricas (`sm:grid-cols-2 lg:grid-cols-4`)
- Grid de conteúdo adicional (`lg:grid-cols-7`) com áreas de overview e detalhes
- CardHeader com `flex flex-row items-center justify-between` para ícone de métrica

### 5.2 Sistema de tema (dark mode)

Implementação obrigatória:

**ThemeProvider:**
- Context provider client-side que gerencia estado `light | dark | system`
- Persistência em `localStorage`
- Escuta mudanças de `prefers-color-scheme` para tema system
- Aplica/remove classes `light`/`dark` no `<html>`

**Script blocking inline (anti-FOUC):**
- Script no `<head>` que roda ANTES de qualquer CSS/paint
- Garante que a classe `dark` ou `light` já esteja no `<html>` quando o navegador renderizar
- Sem ele, ícones e textos ficam invisíveis no dark mode durante a hidratação

**CSS obrigatório em `globals.css`:**
- `@custom-variant dark (&:is(.dark *));`
- `@layer base { body { @apply bg-background text-foreground; } }` obrigatório para contraste
- Variáveis CSS completas para light/dark no `:root` e `.dark`

**Root layout:**
- `<html suppressHydrationWarning>`
- `<ThemeProvider>` envolvendo todo o app
- `<TooltipProvider>` envolvendo todo o app

### 5.3 Componentes globais

| Componente | Arquivo | Descrição |
|---|---|---|
| `ThemeProvider` | `src/components/theme-provider.tsx` | Context provider de tema (light/dark/system) com localStorage |
| `useTheme()` | hook do theme-provider | Acesso ao tema atual e setter |
| `ThemeSwitch` | `src/components/theme-switch.tsx` | Botão dropdown Sun/Moon, variant="outline", opções Claro/Escuro/Sistema |
| `Search` | `src/components/search.tsx` | Botão de busca com ícone e atalho ⌘K |
| `ProfileDropdown` | `src/components/profile-dropdown.tsx` | Dropdown de perfil com avatar, nome, email e logout, variant="outline" |
| `AppSidebar` | `src/components/layout/app-sidebar.tsx` | Sidebar completa com nav filtrada por role e user button no footer |
| `Header` | `src/components/layout/header.tsx` | Navbar com SidebarTrigger, Search, ThemeSwitch e ProfileDropdown |

### 5.4 Componentes shadcn/ui obrigatórios
- `sidebar` (com `SidebarProvider`, `Sidebar`, `SidebarInset`, `SidebarTrigger`, `SidebarRail`, etc.)
- `sheet` (usado internamente pela sidebar para mobile drawer)
- `separator`
- `breadcrumb`
- `skeleton`
- `button`, `avatar`, `dropdown-menu`, `tooltip`, `input`, `card`

### 5.5 Padrão de página
- header de página com título, subtítulo e ação primária
- barra de busca e filtros
- conteúdo principal sempre em cards
- grid bento para dashboards/analytics
- estados obrigatórios: loading, vazio, erro, sem permissão

### 5.6 Padrão de listagens
- toolbar padrão (busca, filtros, reset, colunas)
- tabela padrão
- paginação padrão
- tratamento de erro consistente no front

### 5.7 Padrão de formulários
- TanStack Form como base
- Zod como schema de verdade
- validação de campo + erro global
- submit com loading e botão desabilitado durante envio

## 6. RBAC e autorização

### 6.0 Decisão arquitetural: RBAC customizado (sem plugin)

O sistema de RBAC é **customizado e gerenciado pelo próprio projeto**, sem dependência de plugins do Better Auth.

**Motivação:**
- O plugin `admin` do Better Auth traz roles/permissões hardcoded, sem suporte a criação dinâmica de perfis.
- Acopla a lógica de autorização ao provedor de autenticação, dificultando evolução.
- Não suporta granularidade por recurso/ação de forma flexível.

**Better Auth é responsável apenas por:** autenticação (login/logout, sessão, tokens).

**Tudo de autorização é gerenciado por:** tabelas próprias + middleware tRPC + guards no frontend.

### 6.1 Modelagem do banco

| Tabela | Descrição |
|--------|-----------|
| `role` | Perfis criados dinamicamente (ex: owner, admin, member). Campos: `id`, `name`, `description`, `createdAt`, `updatedAt` |
| `permission` | Permissões granulares por recurso+ação. Campos: `id`, `resource`, `action`, `description`, `createdAt`. Unique: `(resource, action)` |
| `role_permission` | N:N entre role e permission. Campos: `roleId`, `permissionId`. PK composta |
| `user_role` | N:N entre user e role. Campos: `userId`, `roleId`. PK composta |

**Relacionamentos:**
```
user ──1:N── user_role ──N:1── role ──1:N── role_permission ──N:1── permission
```

**Convenção de permissões:** formato `{resource}.{action}` (ex: `users.read`, `roles.create`).
- Resources sempre no plural, lowercase.
- Actions: `create`, `read`, `update`, `delete` + customizadas (`ban`, `export`, `manage`, etc.).

### 6.2 Matriz de permissões inicial
| Recurso/Página | View | Create | Update | Delete | Ações especiais |
|---|---|---|---|---|---|
| Dashboard | OWNER, ADMIN, MEMBER | - | - | - | - |
| Family / Members | OWNER, ADMIN | OWNER, ADMIN | OWNER, ADMIN | OWNER | reenviar convite: OWNER, ADMIN |
| Accounts | OWNER, ADMIN, MEMBER | OWNER, ADMIN, MEMBER | OWNER, ADMIN, MEMBER | OWNER, ADMIN | arquivar: OWNER, ADMIN |
| Categories | OWNER, ADMIN, MEMBER | OWNER, ADMIN, MEMBER | OWNER, ADMIN, MEMBER | OWNER, ADMIN | - |
| Transactions | OWNER, ADMIN, MEMBER | OWNER, ADMIN, MEMBER | OWNER, ADMIN, MEMBER | OWNER, ADMIN | transferir: OWNER, ADMIN, MEMBER |
| Settings | OWNER, ADMIN, MEMBER | - | OWNER, ADMIN, MEMBER | - | gerenciar família: OWNER |
| Roles / Permissions | OWNER, ADMIN | OWNER, ADMIN | OWNER, ADMIN | OWNER | atribuir perfis: OWNER, ADMIN |

> Os perfis (OWNER, ADMIN, MEMBER) são criados na tabela `role` e as permissões na tabela `permission`. A matriz acima é o estado inicial — perfis e permissões podem ser gerenciados via UI admin.

### 6.3 Regras de front-end
- Sem permissão: não renderiza botão/ação
- Sem `view`: não renderiza a página
- Sidebar/menu respeitam a matriz RBAC
- Permissões carregadas via React Context para evitar múltiplas queries

### 6.4 Regras de back-end
- Middleware tRPC `requirePermission(resource, action)` valida toda procedure protegida
- `getUserPermissions(userId)` cruza `user_role → role_permission → permission` com cache
- Cache de permissões invalidado quando roles/permissões são alteradas
- Nunca confiar na ocultação de UI

### 6.5 Fluxo de operação
1. Admin cria perfis na tabela `role` (ex: "Gerente", "Vendedor")
2. Admin define permissões por recurso e vincula ao perfil via `role_permission`
3. Admin atribui perfis ao usuário via `user_role` (1 ou N perfis por usuário)
4. Middleware tRPC resolve permissões e permite/bloqueia o acesso por ação

### 6.6 Referência de implementação
- Spec detalhada: `.specs/features/rbac-custom/SPEC.md`
- Schema Drizzle: `src/server/db/schema.ts` (tabelas role, permission, role_permission, user_role)
- Middleware: `src/server/auth/requirePermission.ts`
- Resolução de permissões: `src/server/auth/permissions.ts`

## 7. Contratos técnicos

### 7.1 Contrato de estados por feature
- Loading
- Vazio
- Erro
- Sem permissão

### 7.2 Contrato de erro de API
```json
{
  "code": "FORBIDDEN",
  "message": "Você não tem permissão para esta ação",
  "details": null,
  "traceId": "..."
}
```

### 7.3 Contrato de auditoria
- campos mínimos: `userId`, `entity`, `action`, `timestamp`, `result`

### 7.4 Convenção de URL e filtros
- filtros/sort/paginação em querystring
- padrão:
  - `q`, `page`, `pageSize`, `sort`, `filters[...]`
- estado inicial da tela deve ser carregado da URL

### 7.5 Estratégia de cache e invalidação
- query keys estáveis por domínio
- mutation deve invalidar ou atualizar cache de forma explícita
- optimistic update apenas com rollback definido

### 7.6 Política de migração de schema
1. gerar migration
2. revisar SQL
3. aplicar em ambiente de teste
4. validar impacto
- toda alteração estrutural deve ter plano de rollback/recuperação

## 8. Plano de entrega

### 8.1 Roadmap por fase
- Fase 1 (concluída): fundação técnica, auth, família/convites
- Fase 2 (em andamento): vertical slice de accounts/categories/transactions com persistência e auditoria
- Fase 3: expansão para budgets/goals/transfers + hardening operacional
- Fase 4 (target): convergência para arquitetura final completa (modelo de contas maduro, transferências robustas, regras de automação e preparação para IA)

### 8.2 Sequência de implementação
1. consolidar app shell e padrões de página
2. consolidar RBAC end-to-end
3. fechar CRUD core com auditoria
4. ampliar testes de regras críticas
5. fechar métricas de performance/a11y
6. convergir modelo de domínio para arquitetura alvo (contas/transações/transferências/categorias flexíveis)
7. implementar budgets e goals com regras explícitas de negócio
8. preparar camada de automação e entrada assistida sem quebrar o domínio principal

## 9. Testes e qualidade

### 9.1 Estratégia de teste
- Unitário: regras de domínio e validações
- Integração: routers/services/db
- E2E: fluxos críticos de autenticação, família e CRUD financeiro

### 9.2 Gates de CI
- Lint
- Typecheck
- Testes
- Build

### 9.3 Definition of Done por página/feature
- layout padrão aplicado
- responsividade validada
- acessibilidade validada
- estados de tela implementados
- permissões aplicadas no front e backend
- testes mínimos passando

## 10. Riscos, trade-offs e decisões abertas

### 10.1 Riscos
- R01: aumento de escopo sem fechamento do core financeiro
- R02: inconsistência de RBAC entre front e backend

### 10.2 Trade-offs
- T01: maior rigor de padrões aumenta esforço inicial, mas reduz retrabalho
- T02: uso de stack mais completa aumenta complexidade, mas melhora escala e manutenção

### 10.3 Decisões pendentes
- D01: granularidade final de perfis/permissões em produção
- D02: priorização entre budgets/goals/transfers após fechamento do core
- D03: abordagem final de transferências (entidade própria vs composição de duas transações vinculadas)
- D04: estratégia de rollout de categorias flexíveis (`suggestedType`) sem regressão de UX

## 11. Rastreabilidade (requisito -> implementação -> teste)

| Requisito | Implementação (arquivo/módulo) | Teste | Status |
|---|---|---|---|
| F01 | `src/server/auth/*`, `src/app/sign-in/*` | unit + e2e auth | implementado |
| F02 | `src/app/onboarding/*`, `src/server/services/family-service.ts` | unit + e2e onboarding | implementado |
| F03 | `src/app/api/family/invite/*`, `src/app/family/invite/[token]/*` | unit + e2e convite | implementado |
| F05 | `src/modules/accounts/*`, `src/modules/transactions/*` | unit + integration + e2e | parcial |
| RN01 | `src/server/audit/*` | unit audit | parcial |

## 12. Aprovação
- Aprovado por Product: pendente
- Aprovado por Tech: pendente
- Aprovado por Design: pendente
- Aprovado por QA: pendente
- Data de aprovação: pendente
