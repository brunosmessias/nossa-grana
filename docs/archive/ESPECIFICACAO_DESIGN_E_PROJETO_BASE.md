# Especificação de Design e Projeto Base

Data: 2026-05-13
Escopo: padrão visual e estrutural para o `nossa-grana-v2` e para novos projetos com a mesma base.

## 1. Referências analisadas

### 1.1 Nossa Grana v2
- README do projeto (`nossa-grana-v2/README.md`)
- Stack real do projeto (`nossa-grana-v2/package.json`)
- Layout atual de dashboard (`src/app/dashboard/ui.tsx`)
- Primitives de sidebar/table (`src/components/ui/sidebar.tsx`, `src/components/ui/table.tsx`)

### 1.2 Shadcn Admin (referência de UX/UI)
- README (`shadcn-admin/README.md`)
- Sidebar e composição (`src/components/layout/app-sidebar.tsx`, `src/components/ui/sidebar.tsx`)
- Header com trigger (`src/components/layout/header.tsx`)
- Toolbar de tabela (`src/components/data-table/toolbar.tsx`)

### 1.3 Documentação oficial (Context7)
- `shadcn/ui` (`/shadcn-ui/ui`): uso de `Sidebar` com `variant="inset"`, `collapsible` e `SidebarInset`
- `Tailwind CSS` (`/tailwindlabs/tailwindcss.com`): abordagem v4 com `@theme` para tokens de design

## 2. Padrão obrigatório de layout global

## 2.1 App Shell
- Estrutura obrigatória: `SidebarProvider` + `Sidebar` + `SidebarInset`
- Variante padrão do sidebar: `variant="inset"`
- Comportamento padrão: `collapsible="icon"` em desktop e `Sheet` em mobile
- Larguras:
  - expandido: `16rem`
  - colapsado: `3rem`
  - mobile drawer: `18rem`

## 2.2 Header global (top bar)
- Deve existir em todas as páginas autenticadas
- Ordem de elementos:
  1. botão toggle do sidebar (`SidebarTrigger`)
  2. separador vertical
  3. busca global
  4. área de ações à direita (theme switch, notificações, menu usuário)
- Comportamento:
  - sticky no topo
  - sombra/backdrop ao rolar

## 2.3 Sidebar
- Seções fixas:
  - bloco de marca/produto no topo
  - navegação principal agrupada
  - área de usuário no rodapé
- Regras:
  - item ativo com contraste visual claro
  - apenas um item ativo por grupo
  - suporte a ícone + label, com fallback para tooltip no modo colapsado

## 3. Padrão obrigatório de páginas

## 3.1 Cabeçalho de página (Page Header)
Toda página deve começar com um bloco padrão:
- esquerda:
  - título (`h1`)
  - subtítulo explicando contexto/estado
- direita:
  - ação primária (ex.: `Criar`, `Nova transação`)
  - ações secundárias opcionais

## 3.2 Barra de controles (acima da lista/conteúdo)
- Busca textual (placeholder específico por entidade)
- Filtros faceted (status, tipo, período etc.)
- Botão `Reset` quando houver filtros ativos
- Controle de visualização de colunas em tabelas

## 3.3 Área de conteúdo (Bento + Cards)
- Conteúdo sempre encapsulado em `Card`
- Layout em grid responsivo com blocos de tamanhos diferentes (bento)
- Regras de grid:
  - `gap-4` em mobile
  - `gap-6` em desktop
  - cards de resumo no topo
  - blocos analíticos/tabelas ocupando áreas maiores
- Evitar áreas “soltas” sem card

## 3.4 Tabelas
- Padrão único para todas as entidades:
  - toolbar (busca/filtros/view options)
  - tabela com colunas consistentes
  - paginação no rodapé
- Estados obrigatórios:
  - loading (skeleton)
  - vazio (mensagem + CTA)
  - erro (mensagem + retry)

## 3.5 Modais de criação/edição
- Regra do projeto: criação/edição por modal
- Estrutura fixa:
  - título + descrição
  - formulário por seções
  - rodapé com `Cancelar` e ação primária

## 4. Design tokens e consistência visual (Tailwind v4)

## 4.1 Fonte única de tokens
- Definir tokens com `@theme` (Tailwind v4) e expor como CSS vars
- Categorias mínimas:
  - cores semânticas (`background`, `foreground`, `primary`, `muted`, `border`, `destructive`)
  - cores do sidebar (`sidebar-*`)
  - radius (`--radius`)
  - espaçamentos-base

## 4.2 Escala de espaçamento padrão
- Página: `p-4` (mobile), `p-6` (desktop)
- Blocos internos: `space-y-4` ou `space-y-6`
- Header da página para conteúdo: `mb-6`
- Cards: `gap-4` interno padrão

## 4.3 Padronização tipográfica
- Título de página: `text-2xl`/`text-3xl`, `font-semibold`
- Subtítulo: `text-sm`, `text-muted-foreground`
- Título de card: `text-base`/`text-lg`, `font-medium`

## 5. Responsividade e acessibilidade

## 5.1 Responsividade
- Mobile-first
- Sidebar vira drawer em telas pequenas
- Ações do header quebram para duas linhas quando necessário
- Tabelas com overflow horizontal controlado

## 5.2 Acessibilidade
- Navegação por teclado (toggle sidebar, filtros, ações)
- `aria-label` em botões icônicos
- Contraste mínimo WCAG AA
- Foco visível em todos os controles interativos

## 6. Especificação para novo projeto (base futura)

## 6.1 Stack obrigatória (herdada de nossa-grana-v2)
- Next.js (App Router)
- React + TypeScript
- Tailwind CSS v4
- shadcn/ui (componentes locais)
- Zod compartilhado entre front/back
- tRPC + React Query
- Drizzle ORM
- Better Auth (OTP + social quando necessário)
- Vitest + Playwright

## 6.2 Regras de engenharia obrigatórias
- Sem `any` explícito
- Arquivos até 500 linhas
- Regras de negócio cobertas por testes
- Fluxos de criação/edição via modal
- Responsividade obrigatória
- Auditoria de eventos de negócio com naming padronizado

## 6.3 Estrutura mínima sugerida
- `src/app` para rotas
- `src/components/ui` para primitives shadcn
- `src/components/layout` para app shell
- `src/components/data-table` para tabela padronizada
- `src/features/*` para domínio de tela
- `src/server/*` para API/auth/db/services
- `src/shared/schemas` para contratos Zod

## 6.4 Entregáveis mínimos do frontend no dia 1
1. App shell completo (sidebar inset + header global)
2. Página dashboard em bento com cards de resumo
3. Template de página CRUD com header, filtros, tabela e paginação
4. Modal base de criação/edição reutilizável
5. Theme switch (light/dark/system)

## 6.5 Segurança simples e obrigatória (RBAC)
- O sistema deve ter permissões por:
  - rota/página (acesso)
  - ação (`create`, `read`, `update`, `delete`, ações especiais)
- Regra de front-end:
  - se o usuário não tem permissão de ação, o botão/ação não deve ser exibido (ex.: sem `create`, sem botão `Criar`)
  - menus e itens de sidebar devem respeitar a permissão de rota
- Regra de back-end (obrigatória):
  - nunca confiar na ocultação de botão no front
  - toda mutation e query sensível valida permissão no servidor
- tRPC/procedures por perfil:
  - criar procedures específicas por nível de acesso quando fizer sentido (ex.: `adminProcedure`, `managerProcedure`, `memberProcedure`)
  - endpoints críticos devem usar procedure restritiva por padrão
- Auditoria:
  - registrar tentativa negada de ação sensível (userId, ação, recurso, timestamp)

## 6.6 Requisitos operacionais obrigatórios por página/feature
- Matriz de permissões (RBAC) por página e ação:
  - `view`, `create`, `update`, `delete`
  - página só renderiza se houver `view`
  - ações de UI só aparecem se houver permissão da ação correspondente
- Contratos de estado de tela por feature:
  - loading
  - vazio
  - erro
  - sem permissão
- Padrão de formulários:
  - validação com Zod
  - mensagens de erro por campo e erro global
  - máscara quando aplicável (moeda, data etc.)
  - submit com estado de loading
  - botão de submit desabilitado durante envio
- Observabilidade mínima:
  - log de erro de frontend e backend
  - auditoria para ações críticas
  - métricas básicas de uso (ex.: criação, edição, exclusão)
- Performance budget:
  - meta de Core Web Vitals por rota crítica (LCP/INP)
  - limite de bundle por rota
- Acessibilidade operacional:
  - checklist de teclado/foco/aria obrigatório no PR
  - não apenas regra geral, validação prática por tela
- Padrão de API e erro:
  - shape único de erro no backend
  - tratamento consistente no front (toast/mensagem padrão)
- Definition of Done por página:
  - layout final aplicado
  - testes mínimos da feature
  - responsividade validada
  - acessibilidade validada
  - estados de tela implementados

## 7. Checklist de aceite de UI e acesso

1. Todas as páginas autenticadas usam o mesmo app shell.
2. Toda página tem header padrão (título, subtítulo, ação primária).
3. Todo conteúdo principal está dentro de cards.
4. Todas as listagens usam o mesmo padrão de toolbar+tabela+paginação.
5. Sidebar funciona em desktop (colapsável) e mobile (drawer).
6. Theme switch funciona globalmente.
7. Layout mantém consistência de margens/gaps em todas as telas.
8. Estados de loading/vazio/erro estão implementados nas páginas de dados.
9. Ações sem permissão não aparecem no front.
10. Permissões de rota e ação são validadas no backend.
11. Cada feature implementa estados loading/vazio/erro/sem permissão.
12. Formulários seguem padrão único de validação, erro e submit.
13. API segue shape de erro padronizado com feedback consistente no front.
14. Página só é considerada pronta após cumprir Definition of Done.

## 8. Decisão de referência

Para manter consistência e velocidade de implementação, a referência principal de UX para área autenticada passa a ser:
- padrão estrutural do `shadcn-admin` (sidebar inset, header global, toolbar de listagem)
- linguagem visual e regras de domínio do `nossa-grana-v2`
