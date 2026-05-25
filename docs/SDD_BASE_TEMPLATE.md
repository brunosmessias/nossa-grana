# SDD Base Template (Replicável) - Pré-preenchido com padrão oficial

Status: Template oficial para novos projetos (com stack e padrões já decididos)
Data: 2026-05-13

> Este documento é a base genérica para Specification-Driven Development (SDD).
> Para novos projetos, ele deve ser copiado e preenchido.
> Ele substitui o uso de documentos ad-hoc como base inicial de especificação.

## 0. Como usar este template
- Copiar este arquivo para `docs/SDD_<nome-do-projeto>.md`
- Preencher todas as seções marcadas como obrigatórias
- Manter os critérios de aceite e DoD por página/feature
- Atualizar links de referência técnica e de produto

### 0.1 Base obrigatória para novos projetos
- Base oficial: `Pessoal/base` (boilerplate do Create T3)
- Regra: todo novo projeto deve começar clonando/copiando esta base, sem iniciar de estrutura vazia.
- Objetivo: reduzir variabilidade técnica, acelerar setup e manter compatibilidade com padrões SDD.

### 0.2 Primeiros passos de adaptação da base T3 para o padrão SDD
1. Renomear projeto e ajustar metadados (`package.json`, `README`, `.env.example`, nome do app).
2. Confirmar stack de runtime: Next.js App Router + TypeScript strict + tRPC + Drizzle + Better Auth.
3. Substituir `src/server/db/schema.ts` placeholder pelo schema inicial do domínio do projeto.
4. Criar migration inicial e validar ciclo local de banco (`db:generate`, `db:migrate`, `db:studio`).
5. Instalar e configurar camada UI padrão (`shadcn/ui` local, componentes de layout, tema, tokens).
6. Estruturar App Shell autenticado (Sidebar inset + Header global) antes de iniciar features.
7. Adicionar base de autorização (RBAC por rota e ação), mesmo que inicialmente com poucos perfis.
8. Configurar padrão de formulários com TanStack Form + Zod compartilhado (client/server).
9. Definir contrato único de erro e contrato mínimo de auditoria para ações sensíveis.
10. Ativar qualidade mínima obrigatória no início: lint, typecheck, testes unitários e E2E smoke.
11. Criar `docs/PROJECT_CONTROL.md` e inicializar `.specs/project/*` para governança TLC desde o dia 1.
12. Registrar no SDD quais itens vieram prontos da base T3 e quais foram customizados no bootstrap.

---

## 1. Contexto e Escopo

### 1.1 Contexto do produto (obrigatório)
- Problema que o projeto resolve:
- Público-alvo:
- Objetivo de negócio:

### 1.2 Escopo in/out (obrigatório)
- In scope (nesta fase):
- Out of scope (fora desta fase):

### 1.3 Stakeholders e papéis (obrigatório)
- Product Owner:
- Tech Lead:
- Design:
- QA:
- Segurança:

---

## 2. Requisitos funcionais

### 2.1 Lista de features (obrigatório)
- F01:
- F02:
- F03:

### 2.2 Fluxos críticos (obrigatório)
- Fluxo 1:
- Fluxo 2:
- Fluxo 3:

### 2.3 Regras de negócio-chave (obrigatório)
- RN01:
- RN02:
- RN03:

---

## 3. Requisitos não funcionais

### 3.1 Segurança
- AuthN/AuthZ: sessão, expiração, refresh
- RBAC por rota/página e por ação
- Validação de entrada no client e server
- Proteção de segredos e dados sensíveis
- Auditoria de ações sensíveis

### 3.2 Performance
- Metas de LCP/INP por rota crítica
- Limite de bundle por rota

### 3.3 Acessibilidade
- Meta WCAG (nível alvo)
- Checklist operacional em PR (teclado, foco, aria, contraste)

### 3.4 Confiabilidade/Operação
- Logs mínimos
- Métricas mínimas
- Alertas críticos

---

## 4. Arquitetura e Stack

### 4.1 Stack obrigatória do projeto
- Framework: Next.js (App Router) + React + TypeScript
- UI: shadcn/ui (componentes locais) + Radix primitives
- CSS: Tailwind CSS v4 (`@theme` para design tokens)
- API: tRPC + React Query
- Banco: PostgreSQL + Drizzle ORM
- Auth: Better Auth (sessão + OTP; social opcional por projeto)
- Formulários: TanStack Form (`@tanstack/react-form`)
- Validação: Zod compartilhado entre front e backend (integrado ao TanStack Form)
- Tabelas/Listas: TanStack Table (`@tanstack/react-table`) + TanStack Virtual (`@tanstack/react-virtual`) quando houver alto volume
- Testes: Vitest (unit/integration) + Playwright (E2E)
- Qualidade: ESLint + TypeScript strict
- Dev DX: TanStack Query Devtools em ambiente de desenvolvimento

Observação: o boilerplate T3 entrega uma fundação enxuta; itens adicionais deste padrão (como shadcn/ui completo, TanStack Form e matriz RBAC) devem ser adicionados no bootstrap seguindo a seção 0.2.

### 4.2 Decisões arquiteturais (ADRs resumidos)
- ADR-001: Fluxos de criação/edição devem ocorrer via modal por padrão.
- ADR-002: RBAC obrigatório por rota e por ação, com validação no backend.
- ADR-003: Layout autenticado padronizado com Sidebar inset + Header global.
- ADR-004: Estados de tela obrigatórios por feature (`loading`, `vazio`, `erro`, `sem permissão`).
- ADR-005: Contrato único de erro para feedback consistente no frontend.

### 4.3 Estrutura de pastas base
- `src/app`
- `src/components/ui`
- `src/components/layout`
- `src/components/data-table`
- `src/features/*`
- `src/server/*`
- `src/shared/schemas`

---

## 5. Sistema de design e layout

### 5.1 App shell padrão
- Sidebar + Header + Content Inset
- Padrão de navegação e responsividade
- Sidebar obrigatório: `variant="inset"` com colapso por ícone em desktop e drawer em mobile
- Header obrigatório: toggle sidebar, busca global e ações à direita (theme switch + usuário)

### 5.2 Padrão de página
- Header (título, subtítulo, ação primária)
- Barra de filtros/busca
- Conteúdo em cards (sem conteúdo principal solto)
- Estado loading/vazio/erro/sem permissão
- Grid de conteúdo no estilo bento para dashboards e páginas analíticas

### 5.3 Padrão de listagens
- Toolbar padrão
- Tabela padrão
- Paginação padrão
- Shape de erro padrão no front
- Toolbar com busca, filtros, reset de filtros e controle de colunas

### 5.4 Padrão de formulários
- Validação
- Mensagens de erro
- Submit/loading/disable
- Comportamento de sucesso/falha
- TanStack Form como base de estado e ciclo de vida de formulário
- Zod como fonte de verdade do schema (client + server)
- Botão submit desabilitado durante envio

---

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
| `role` | Perfis criados dinamicamente (ex: admin, gerente, membro). Campos: `id`, `name`, `description`, `createdAt`, `updatedAt` |
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

### 6.2 Matriz de permissões (obrigatório)
| Recurso/Página | View | Create | Update | Delete | Ações especiais |
|---|---|---|---|---|---|
| Exemplo: Usuários | Admin, Manager | Admin | Admin, Manager | Admin | Reset senha: Admin |

> Preencher com perfis reais do projeto. Os perfis são criados na tabela `role` e as permissões na tabela `permission`.

### 6.3 Regras de front-end
- Sem permissão: não renderiza botão/ação
- Sem permissão de página: não renderiza conteúdo da rota
- Sidebar/menu devem respeitar a mesma matriz RBAC
- Permissões carregadas via React Context para evitar múltiplas queries

### 6.4 Regras de back-end
- Middleware tRPC `requirePermission(resource, action)` valida toda procedure protegida
- `getUserPermissions(userId)` cruza `user_role → role_permission → permission` com cache
- Cache de permissões invalidado quando roles/permissões são alteradas
- Nunca confiar na ocultação de ação no frontend

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

---

---

## 7. Contratos técnicos

### 7.1 Contrato de estados por feature
- Loading
- Vazio
- Erro
- Sem permissão
- Esses 4 estados devem existir antes da feature ser considerada pronta

### 7.2 Contrato de erro de API
- Shape único (exemplo):
```json
{
  "code": "FORBIDDEN",
  "message": "Você não tem permissão para esta ação",
  "details": null,
  "traceId": "..."
}
```

### 7.3 Contrato de auditoria
- Campos mínimos: `userId`, `entity`, `action`, `timestamp`, `result`

### 7.4 Convenção de URL e filtros
- Filtros, ordenação e paginação devem viver na querystring da URL.
- Padrão sugerido:
  - `q` para busca textual
  - `page` e `pageSize` para paginação
  - `sort` para ordenação (ex.: `createdAt.desc`)
  - `filters[...]` para filtros estruturados
- Regras:
  - a tela deve carregar estado inicial a partir da URL
  - alterações de filtro/ordenação/página devem atualizar a URL
  - URLs devem ser compartilháveis e reprodutíveis

### 7.5 Estratégia de cache e invalidação (React Query)
- Definir `query keys` por domínio e recurso, com padrão estável.
- Toda mutation deve declarar estratégia pós-sucesso:
  - invalidar queries afetadas, ou
  - atualizar cache local diretamente quando seguro
- Usar optimistic update apenas quando houver rollback claro.
- Evitar refetch global; preferir invalidação específica por key.

### 7.6 Política de migração de schema (Drizzle)
- Fluxo obrigatório:
  1. gerar migration
  2. revisar SQL gerado
  3. aplicar em ambiente de teste
  4. validar impacto em queries e dados existentes
- Toda mudança de schema deve prever rollback ou estratégia de recuperação.
- Não aplicar alterações destrutivas sem plano explícito de compatibilidade.

---

## 8. Plano de entrega

### 8.1 Roadmap por fase
- Fase 1:
- Fase 2:
- Fase 3:

### 8.2 Sequência sugerida de implementação
1. App shell + autenticação
2. RBAC + guards de rota/ação
3. CRUD principal com padrões de página
4. Observabilidade e hardening
5. Testes de regressão e aceite

---

## 9. Testes e qualidade

### 9.1 Estratégia de teste
- Unitário:
- Integração:
- E2E:

### 9.2 Gates de CI
- Lint
- Typecheck
- Testes
- Scanner de segurança
- Build da aplicação

### 9.3 Definition of Done (DoD) por página/feature
- Layout final aplicado
- Responsividade validada
- Acessibilidade validada
- Estados de tela implementados
- Permissões aplicadas no front e back
- Testes mínimos passando
- Padrão visual consistente com App Shell e padrões de página/listagem/formulário

---

## 10. Política de atualização contínua (obrigatória)

### 10.1 Atualização por entrega
- Toda entrega deve atualizar, no mínimo:
  - `docs/PROJECT_CONTROL.md` (estado atual, entregas, próximos passos)
  - `.specs/project/STATE.md` (status vivo da execução)
  - SDD do projeto (`docs/SDD_<nome-do-projeto>.md`) quando houver mudança de escopo, arquitetura, contratos ou padrões

### 10.2 Atualização técnica (stack e dependências)
- Definir cadência de revisão de dependências (sugestão: semanal ou quinzenal).
- Em cada atualização relevante:
  1. revisar changelog oficial das libs críticas (Next.js, React, tRPC, Drizzle, Better Auth, TanStack)
  2. atualizar versões de forma incremental
  3. executar `lint`, `typecheck`, testes e build
  4. registrar impactos e decisões no SDD/PROJECT_CONTROL
- Evitar upgrades múltiplos grandes no mesmo PR sem isolamento de risco.

### 10.3 Atualização de banco e migrations
- Toda mudança de schema deve:
  1. gerar migration
  2. revisar SQL
  3. validar aplicação em ambiente de teste
  4. documentar impacto e estratégia de rollback
- Não permitir alteração destrutiva sem plano explícito de compatibilidade.

### 10.4 Atualização de contratos
- Mudou contrato de API, erro, auditoria, RBAC ou URL/filtros:
  - atualizar seção correspondente no SDD
  - atualizar testes que validam contrato
  - validar compatibilidade de frontend/backend

### 10.5 Critério de aceite para PR de atualização
- PR de atualização só fecha quando:
  - documentação impactada foi atualizada
  - gates de CI passaram
  - risco residual foi registrado (se existir)

## 11. Riscos, trade-offs e decisões abertas

### 10.1 Riscos
- R01:
- R02:

### 10.2 Trade-offs
- T01:
- T02:

### 10.3 Decisões pendentes
- D01:
- D02:

---

## 12. Rastreabilidade (requisito -> implementação -> teste)

| Requisito  | Implementação (arquivo/módulo) | Teste | Status |
| ---------- | ------------------------------ | ----- | ------ |
| F01        |                                |       |        |
| RN01       |                                |       |        |
| NFR-Seg-01 |                                |       |        |
