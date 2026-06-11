# Month Selector and Empty-Import Behavior — Tasks

**Design**: `.specs/features/month-selector-empty-import/design.md`
**Spec**: `.specs/features/month-selector-empty-import/spec.md`
**Status**: Draft

---

## Execution Plan

### Phase 1: Foundation (Sequential)

Pure helpers and the shared hook. Sem dependência de UI, sem dependência de tRPC. Constrói a base que as duas páginas vão consumir.

```
T1 → T2 → T3
```

### Phase 2: Dashboard wiring (Sequential)

Migra o `DashboardClient` para o novo modelo. Cobre MONTH-01, MONTH-02, MONTH-03, MONTH-04 (lado dashboard).

```
T3 → T4 → T5 → T6 → T7
```

### Phase 3: Categorias wiring (Sequential)

Mesma migração na página de categorias. Cobre MONTH-01 e MONTH-02 (lado categorias) e destrava o "variação vs. mês anterior" com `prevMonth` honesto.

```
T7 → T8 → T9 → T10
```

### Phase 4: Server props (Sequential)

`page.tsx` server-side precisa expor `familyCreatedMonth`. Sem isso, `useMonthSelector` recebe `minMonth` indefinido. Roda em paralelo conceitual com T5–T10 (afeta props, não lógica), mas mantemos sequencial para evitar surpresas de re-render.

```
T11
```

### Phase 5: Final gate (Sequential)

```
T11 → T12
```

---

## Task Breakdown

### T1: Create `monthKey` helper module

**What**: Criar `src/lib/month-key.ts` com `formatMonthKey`, `addMonths`, `previousMonthKey`, `compareMonthKeys` (todas puras, sem React).
**Where**: `src/lib/month-key.ts` (novo)
**Depends on**: None
**Reuses**: lógica de `getMonthKey` de `src/app/dashboard/ui.tsx:48-49` (movida, não duplicada — a função é re-exportada daqui)
**Requirement**: MONTH-01

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] `formatMonthKey(date: Date): string` exportada, com semântica idêntica a `getMonthKey` existente
- [ ] `addMonths(monthKey: string, delta: number): string` exportada, com rollover correto de ano (testado para `2024-12 → 2025-01` e `2024-01 → 2023-12`)
- [ ] `previousMonthKey(monthKey: string): string` exportada como açúcar para `addMonths(monthKey, -1)`
- [ ] `compareMonthKeys(a, b): number` exportada
- [ ] Nenhuma dependência de React, tRPC ou Drizzle
- [ ] Gate check passa: `bun typecheck`
- [ ] Test count: ainda 0 (testes ficam em T2)

**Tests**: unit
**Gate**: quick
**Commit**: `feat(month-selector): add monthKey arithmetic helpers`

### T2: Unit tests for `monthKey` module

**What**: Cobertura vitest para `src/lib/month-key.ts`. Cada caso de borda do design verificado.
**Where**: `src/lib/month-key.test.ts` (novo)
**Depends on**: T1
**Reuses**: helpers de T1
**Requirement**: MONTH-01

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Testes cobrem: rollover de ano nos dois sentidos, idempotência (`delta = 0`), meses com `01` e `12`, fevereiro (sem pular nem duplicar)
- [ ] Testes cobrem `previousMonthKey` e `compareMonthKeys` (incluindo `a < b`, `a === b`, `a > b`)
- [ ] Gate check passa: `bun test src/lib/month-key.test.ts`
- [ ] Test count: ≥ 8 testes passam (sem deleções silenciosas)
- [ ] Gate check passa: `bun typecheck` e `bun lint` (lint do projeto)
- [ ] Cobertura ≥ 100% de linhas em `src/lib/month-key.ts`

**Tests**: unit
**Gate**: quick
**Commit**: `test(month-selector): unit tests for monthKey helpers`

### T3: Create `useMonthSelector` hook

**What**: Hook que encapsula o state `selectedMonth`, expõe `goToPrev`, `goToNext`, `canGoPrev`, `canGoNext`, `setSelectedMonth`, e enforça a invariante `minMonth ≤ selectedMonth ≤ currentMonthKey`.
**Where**: `src/hooks/use-month-selector.ts` (novo)
**Depends on**: T1
**Reuses**: `addMonths` de `src/lib/month-key.ts`
**Requirement**: MONTH-01, MONTH-02

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Assinatura `useMonthSelector({ initialMonth?, minMonth: string | null, currentMonthKey: string })` exportada
- [ ] `selectedMonth` inicializa em `initialMonth ?? currentMonthKey`
- [ ] `canGoNext === selectedMonth < currentMonthKey`
- [ ] `canGoPrev === minMonth === null || selectedMonth > minMonth`
- [ ] `goToNext` é no-op se `!canGoNext`
- [ ] `goToPrev` é no-op se `!canGoPrev`
- [ ] `setSelectedMonth` aceita qualquer string `YYYY-MM` e clampa para dentro de `[minMonth, currentMonthKey]` (se o usuário digitar um mês fora, ajusta)
- [ ] Gate check passa: `bun typecheck`

**Tests**: unit (cobertura vem em T4)
**Gate**: quick
**Commit**: `feat(month-selector): add useMonthSelector hook`

### T4: Unit tests for `useMonthSelector` hook

**What**: Cobertura vitest para o hook com `renderHook` do `@testing-library/react`. Cobre os estados de borda do design.
**Where**: `src/hooks/use-month-selector.test.tsx` (novo)
**Depends on**: T3
**Reuses**: hook de T3
**Requirement**: MONTH-01, MONTH-02

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Testa estado inicial: `selectedMonth === currentMonthKey`, `canGoNext === false`, `canGoPrev === true` (com `minMonth < currentMonthKey`)
- [ ] Testa `goToPrev` 3x até `selectedMonth === minMonth`, `canGoPrev === false`
- [ ] Testa `goToNext` no mês atual é no-op
- [ ] Testa `minMonth === null`: `canGoPrev` sempre `true`
- [ ] Testa `setSelectedMonth` com valor fora do range: clampa para `[minMonth, currentMonthKey]`
- [ ] Testa `setSelectedMonth` com valor dentro do range: aceita
- [ ] Gate check passa: `bun test src/hooks/use-month-selector.test.tsx`
- [ ] Test count: ≥ 6 testes passam (sem deleções silenciosas)
- [ ] Gate check passa: `bun typecheck`

**Tests**: unit
**Gate**: quick
**Commit**: `test(month-selector): unit tests for useMonthSelector`

### T5: Wire `useMonthSelector` into `DashboardClient`

**What**: Substituir `availableMonths` + `currentIdx` + `setSelectedMonth(availableMonths[currentIdx + 1|-1])` em `src/app/dashboard/ui.tsx` por `useMonthSelector`. Atualizar a label, os `disabled` dos chevrons e a derivação de `previousMonthTransactions`.
**Where**: `src/app/dashboard/ui.tsx` (modificar, linhas 75-78, 99-115, 128-148, 280-303, 293)
**Depends on**: T3
**Reuses**: `useMonthSelector` (T3), `previousMonthKey` (T1), `BatchImportDialog` (já existe)
**Requirement**: MONTH-01, MONTH-02

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] `useState<string[]>([])` para `availableMonths` e o `useEffect` que o popula foram removidos
- [ ] `selectedMonth` agora vem de `useMonthSelector({ minMonth: familyCreatedMonth, currentMonthKey: formatMonthKey(new Date()) })`
- [ ] ChevronLeft (linha ~288) tem `disabled={!canGoNext}` e `onClick={goToNext}`
- [ ] ChevronRight (linha ~299) tem `disabled={!canGoPrev}` e `onClick={goToPrev}`
- [ ] Label (linha ~293) renderiza `formatMonthLabel(selectedMonth)` sem condicional `availableMonths.length > 0`
- [ ] `previousMonthTransactions` agora é derivado de `previousMonthKey(selectedMonth)` em vez do cálculo manual com `setMonth`
- [ ] Nenhuma referência residual a `availableMonths` ou `currentIdx` em `ui.tsx`
- [ ] `getAvailableMonths` removido de `src/app/dashboard/ui.tsx` (movido para `src/lib/month-key.ts` em T1, ou removido de vez se já não era usado em outros lugares — verificar)
- [ ] Gate check passa: `bun typecheck && bun lint`
- [ ] Gate check passa: `bun test` (todos os testes do projeto passam; nenhum quebrado)
- [ ] `ui.tsx` ainda respeita o limite de 500 linhas do ESLint (skipBlankLines + skipComments)
- [ ] Nenhum `any` introduzido

**Tests**: none (mudança é wiring; testes de unidade do hook cobrem a lógica)
**Gate**: full
**Commit**: `feat(month-selector): wire arithmetic nav into DashboardClient`

### T6: Gate import card by `previousMonthTransactions > 0` in dashboard

**What**: Ajustar a condição de render do card "Importar do mês anterior" e do `BatchImportDialog` em `src/app/dashboard/ui.tsx` (linhas 417-440) para a nova guard, cobrindo o edge case "antes da criação da família".
**Where**: `src/app/dashboard/ui.tsx` (modificar, linhas 417 e 430)
**Depends on**: T5
**Reuses**: nada novo
**Requirement**: MONTH-03

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Condição de render do card (linha 430) é: `monthTransactions.length === 0 && previousMonthTransactions.length > 0 && selectedMonth !== familyCreatedMonth && !batchImportOpen`
- [ ] A condição `transactions.length > 0` redundante foi removida de ambas as guards (linhas 417 e 430)
- [ ] O `BatchImportDialog` (linha 418) usa a mesma guard: `monthTransactions.length === 0 && previousMonthTransactions.length > 0 && selectedMonth !== familyCreatedMonth`
- [ ] Gate check passa: `bun typecheck && bun lint`
- [ ] `ui.tsx` ainda respeita o limite de 500 linhas

**Tests**: none (mudança de guard; comportamento é cobertos pelo manual UAT e pela lógica do hook)
**Gate**: quick
**Commit**: `feat(month-selector): gate import card by M-1 data and family horizon`

### T7: Toast on empty-M-1 race in dashboard import CTA

**What**: No `onClick` do botão "Importar do mês anterior" (linha ~435), adicionar verificação stale: se `previousMonthTransactions.length === 0` no momento do clique (race com outra aba), `toast.error("Sem transações no mês anterior para importar")` e não abrir o dialog.
**Where**: `src/app/dashboard/ui.tsx` (modificar, dentro do card na linha 430-440)
**Depends on**: T6
**Reuses**: `toast` de `src/components/ui/sonner.tsx`
**Requirement**: MONTH-04

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] `onClick` do botão é uma função nomeada (não arrow inline) que checa `previousMonthTransactions.length > 0` antes de `setBatchImportOpen(true)`
- [ ] Se vazio, chama `toast.error("Sem transações no mês anterior para importar")` e não abre o dialog
- [ ] Mensagem literal em pt-BR, conforme AGENTS.md e spec
- [ ] Gate check passa: `bun typecheck && bun lint`
- [ ] `ui.tsx` ainda respeita o limite de 500 linhas

**Tests**: none (cobre via UAT manual: simular race apagando M-1 em outra aba e clicando)
**Gate**: quick
**Commit**: `feat(month-selector): toast on stale empty-M-1 import click`

### T8: Wire `useMonthSelector` into `CategoriesPageClient`

**What**: Mesma migração do T5, aplicada em `src/app/dashboard/categorias/ui.tsx`. Substituir `availableMonths` + `currentIdx` pelos helpers. Atualizar `prevMonth` para usar `previousMonthKey`. Migrar a janela de 6 meses do `lineChartData` para `addMonths(selectedMonth, -k)`.
**Where**: `src/app/dashboard/categorias/ui.tsx` (modificar, linhas 35, 44, 65-70, 117-126, 138-140)
**Depends on**: T7
**Reuses**: `useMonthSelector` (T3), `addMonths` e `previousMonthKey` (T1)
**Requirement**: MONTH-01, MONTH-02

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] `useState<string[]>([])` para `availableMonths` e o `useEffect` que o popula foram removidos
- [ ] `selectedMonth` vem de `useMonthSelector({ minMonth: familyCreatedMonth, currentMonthKey: formatMonthKey(new Date()) })`
- [ ] `prevMonth` agora é `previousMonthKey(selectedMonth)`, com fallback para `null` quando `selectedMonth === minMonth`
- [ ] ChevronLeft (linha 138) tem `disabled={!canGoNext}` e `onClick={goToNext}`
- [ ] ChevronRight (linha 140) tem `disabled={!canGoPrev}` e `onClick={goToPrev}`
- [ ] Label (linha 139) renderiza `formatMonthLabel(selectedMonth)` sem condicional
- [ ] `lineChartData` (linhas 117-126) usa `Array.from({ length: 6 }, (_, k) => addMonths(selectedMonth, -k))` em vez de `availableMonths.slice(0, 6).reverse()`
- [ ] `getAvailableMonths` removido de `categorias/ui.tsx`
- [ ] A condicional `{prevMonth && ...}` (linha 160) continua funcionando — agora `prevMonth` é `string | null`
- [ ] Gate check passa: `bun typecheck && bun lint`
- [ ] Gate check passa: `bun test` (todos os testes do projeto passam)
- [ ] `ui.tsx` ainda respeita o limite de 500 linhas
- [ ] Nenhum `any` introduzido

**Tests**: none (mesma justificativa de T5)
**Gate**: full
**Commit**: `feat(month-selector): wire arithmetic nav into CategoriesPageClient`

### T9: Gate trend ranking by valid `prevMonth` in categorias

**What**: Garantir que o `<TrendRanking>` e o `prevSpent` dos cards não renderizam com dados falsos quando `selectedMonth === minMonth`.
**Where**: `src/app/dashboard/categorias/ui.tsx` (modificar, linha 160 e linha 170)
**Depends on**: T8
**Reuses**: nada novo
**Requirement**: MONTH-02

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] A condicional `{prevMonth && expenseCategories.length > 0 && (...)}` (linha 160) continua como `string | null`, então funciona com o novo modelo
- [ ] Linha 170 (`<CategoryCard ... prevSpent={prevMonth ? ... : undefined} />`) continua passando `undefined` quando `prevMonth === null`
- [ ] Gate check passa: `bun typecheck && bun lint`

**Tests**: none
**Gate**: quick
**Commit**: `refactor(month-selector): trend ranking prevMonth is null at family horizon`

### T10: Remove stale `getAvailableMonths` references in categorias

**What**: Verificar e remover qualquer referência residual a `getAvailableMonths` em `src/app/dashboard/categorias/ui.tsx`. Se a função não tem mais callers, deletar a definição local.
**Where**: `src/app/dashboard/categorias/ui.tsx`
**Depends on**: T9
**Reuses**: nada
**Requirement**: MONTH-01 (cleanup)

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] `rg "getAvailableMonths" src/` retorna vazio (ou retorna apenas a definição + caller em arquivos que ainda usam para outras coisas, que devem ser migradas)
- [ ] Se a definição local em `categorias/ui.tsx` ficou sem callers, foi removida
- [ ] Gate check passa: `bun typecheck && bun lint && bun test`

**Tests**: none
**Gate**: quick
**Commit**: `chore(month-selector): remove dead getAvailableMonths code`

### T11: Server `page.tsx` exposes `familyCreatedMonth`

**What**: Modificar `src/app/dashboard/page.tsx` e `src/app/dashboard/categorias/page.tsx` para ler `family.createdAt` (ou equivalente — confirmar a query existente em `family-service.ts`), computar `familyCreatedMonth = formatMonthKey(family.createdAt)`, e passar como prop para os clients. Tratar ausência de `createdAt` (famílias antigas) como `null`.
**Where**:
- `src/app/dashboard/page.tsx` (modificar)
- `src/app/dashboard/categorias/page.tsx` (modificar)
**Depends on**: T5 (precisa do contrato de prop no client; pode rodar em paralelo com T6–T10, mas sequencial para evitar surpresas)
**Reuses**: `formatMonthKey` de `src/lib/month-key.ts` (T1)
**Requirement**: MONTH-01 (justifica o floor do `useMonthSelector`)

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] `page.tsx` (dashboard) computa `familyCreatedMonth` e passa como `familyCreatedMonth: string | null` para `<DashboardClient>`
- [ ] `page.tsx` (categorias) faz o mesmo para `<CategoriesPageClient>`
- [ ] Se `family.createdAt` não existir na resposta do service, o prop é `null` e o hook trata como "sem floor"
- [ ] Tipos das props dos clients são estendidos (TypeScript strict, sem `any`)
- [ ] Gate check passa: `bun typecheck && bun lint`
- [ ] Nenhuma mudança na query de family (somente leitura do que já vem)

**Tests**: none
**Gate**: full
**Commit**: `feat(month-selector): pass familyCreatedMonth from server pages`

### T12: Final gate (UAT walkthrough)

**What**: Rodar o checklist manual de aceitação da spec. Não escreve código; verifica o conjunto.
**Where**: shell
**Depends on**: T1–T11
**Reuses**: N/A
**Requirement**: MONTH-01, MONTH-02, MONTH-03, MONTH-04

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] `bun check` (typecheck + lint + test) passa em sequência, sem warnings
- [ ] `bun build` passa (sem warnings de Next.js sobre uso de `useState` em RSC etc.)
- [ ] UAT manual: abril com dados, maio vazio, junho com dados. Navegar abril → maio → junho com os chevrons. Cada mês renderiza com seu estado real. (Cobre MONTH-01.)
- [ ] UAT manual: estando em junho, deletar todas as transações de maio. Verificar que o card "Importar do mês anterior" desaparece. (Cobre MONTH-03.)
- [ ] UAT manual: re-adicionar uma transação em maio. Verificar que o card volta. (Cobre MONTH-03.)
- [ ] UAT manual: simular race (M-1 fica vazio entre render e clique) — toast pt-BR aparece, dialog não abre. (Cobre MONTH-04.)
- [ ] UAT manual: estar em março de 2024 (mês de criação da família hipotético), chevron esquerda desabilitado, sem card de importação. (Cobre edge case "antes da criação".)
- [ ] UAT manual: trocar de família, o seletor volta para o mês atual. (Cobre edge case "troca de família".)
- [ ] Test count: ≥ 14 testes passam (≥ 8 de T2 + ≥ 6 de T4) — sem deleções silenciosas

**Tests**: e2e (manual walkthrough)
**Gate**: full
**Commit**: nenhum (verificação final; se algo falhou aqui, abrir task corretiva)

---

## Parallel Execution Map

```
Phase 1 (Sequential):
  T1 ──→ T2 ──→ T3 ──→ T4

Phase 2 (Sequential — same file, ui.tsx):
  T4 ──→ T5 ──→ T6 ──→ T7

Phase 3 (Sequential — same file, categorias/ui.tsx):
  T7 ──→ T8 ──→ T9 ──→ T10

Phase 4 (Sequential — different files, but coupled to client contracts):
  T10 ──→ T11

Phase 5 (Sequential):
  T11 ──→ T12
```

**Why no parallelism**: T5–T7 tocam no mesmo `ui.tsx` (dashboard) e T8–T10 tocam no mesmo `ui.tsx` (categorias). T11 depende de T5 (precisa saber a forma da prop no client). Cada fase é estritamente sequencial. O `useMonthSelector` (T3) é o ponto de destravamento conceitual entre as duas páginas, mas os arquivos editados não permitem concorrência segura.

---

## Task Granularity Check

| Task                                  | Scope                                                      | Status      |
| ------------------------------------- | ---------------------------------------------------------- | ----------- |
| T1: Create `monthKey` module          | 1 arquivo novo, 4 funções                                  | ✅ Granular |
| T2: Tests for `monthKey`              | 1 arquivo de teste                                         | ✅ Granular |
| T3: Create `useMonthSelector` hook    | 1 arquivo novo, 1 hook                                     | ✅ Granular |
| T4: Tests for `useMonthSelector`      | 1 arquivo de teste                                         | ✅ Granular |
| T5: Wire into `DashboardClient`       | 1 arquivo modificado, ~30 linhas de mudança                | ✅ Granular |
| T6: Gate import card                  | 1 arquivo, 2 guards ajustadas                              | ✅ Granular |
| T7: Toast on stale click              | 1 arquivo, 1 handler                                       | ✅ Granular |
| T8: Wire into `CategoriesPageClient`  | 1 arquivo modificado, ~25 linhas de mudança                | ✅ Granular |
| T9: Gate trend ranking                | 1 arquivo, ajustes em condicionais já existentes           | ✅ Granular |
| T10: Remove dead `getAvailableMonths` | 1 arquivo, cleanup                                         | ✅ Granular |
| T11: Server props                     | 2 arquivos `page.tsx` modificados, 1 prop nova em cada     | ✅ Granular |
| T12: Final gate                       | Shell + manual walkthrough                                 | ✅ Granular |

**Granularity check**: ✅ 1 component / 1 function / 1 endpoint per task. Nenhum task combina dois componentes não relacionados. T11 toca em dois arquivos, mas é o mesmo conceito (`familyCreatedMonth` prop) propagado para os dois consumers — manter junto é mais coeso do que separar.

---

## Diagram-Definition Cross-Check

| Task | Depends on (task body) | Diagram shows             | Status             |
| ---- | ---------------------- | ------------------------- | ------------------ |
| T1   | None                   | (no incoming arrow)       | ✅ Match           |
| T2   | T1                     | T1 → T2                   | ✅ Match           |
| T3   | T1                     | T2 → T3                   | ✅ Match           |
| T4   | T3                     | T3 → T4                   | ✅ Match           |
| T5   | T3                     | T4 → T5                   | ✅ Match           |
| T6   | T5                     | T5 → T6                   | ✅ Match           |
| T7   | T6                     | T6 → T7                   | ✅ Match           |
| T8   | T7                     | T7 → T8                   | ✅ Match           |
| T9   | T8                     | T8 → T9                   | ✅ Match           |
| T10  | T9                     | T9 → T10                  | ✅ Match           |
| T11  | T5                     | T10 → T11                 | ⚠️ Review          |
| T12  | T1..T11                | T11 → T12                 | ✅ Match           |

**T11 discrepancy resolution**: T11 declara `Depends on: T5` no body (porque precisa do contrato de prop do `<DashboardClient>`), mas o diagrama o coloca depois de T10. A divergência é intencional: T5 destrava o contrato da prop (sem T5 não sabemos se o client aceita `familyCreatedMonth`), e T11 pode rodar em paralelo com T6–T10 conceitualmente. **Decisão**: o diagrama reflete a sequência executável (T11 após T10 para evitar dois PRs separados), mas o `Depends on` no body permanece T5 (a dependência semântica) e adicionamos nota "pode paralelizar com T6–T10 se o reviewer concordar". Nenhuma task é marcada `[P]`, então a divergência é puramente visual e não afeta execução.

---

## Test Co-location Validation

| Task                       | Code Layer Created/Modified                | Matrix Requires (from AGENTS.md) | Task Says (`Tests:`) | Status      |
| -------------------------- | ------------------------------------------ | -------------------------------- | -------------------- | ----------- |
| T1                         | `src/lib/month-key.ts` (lib/pure helper)   | (no test type listed for lib)    | unit (em T2)         | ✅ OK       |
| T2                         | `src/lib/month-key.test.ts`                | (test file)                      | unit                 | ✅ OK       |
| T3                         | `src/hooks/use-month-selector.ts` (hook)   | (no test type listed for hooks)  | unit (em T4)         | ✅ OK       |
| T4                         | `src/hooks/use-month-selector.test.tsx`    | (test file)                      | unit                 | ✅ OK       |
| T5                         | `src/app/dashboard/ui.tsx` (UI client)     | (no test type listed for UI)     | none                 | ✅ OK       |
| T6                         | `src/app/dashboard/ui.tsx` (UI client)     | (no test type listed for UI)     | none                 | ✅ OK       |
| T7                         | `src/app/dashboard/ui.tsx` (UI client)     | (no test type listed for UI)     | none                 | ✅ OK       |
| T8                         | `src/app/dashboard/categorias/ui.tsx`      | (no test type listed for UI)     | none                 | ✅ OK       |
| T9                         | `src/app/dashboard/categorias/ui.tsx`      | (no test type listed for UI)     | none                 | ✅ OK       |
| T10                        | `src/app/dashboard/categorias/ui.tsx`      | (no test type listed for UI)     | none                 | ✅ OK       |
| T11                        | `src/app/dashboard/page.tsx`, `categorias/page.tsx` (RSC) | (no test type listed for RSC) | none                 | ✅ OK       |
| T12                        | (no code, gate)                            | e2e (manual walkthrough)         | e2e                  | ✅ OK       |

**Matrix source**: `AGENTS.md` lista `bun test` (Vitest, `src/**/*.test.ts/x`) e `bun test:e2e` (Playwright, `tests/e2e/`), mas **não define** uma Test Coverage Matrix formal como a que `TESTING.md` normalmente carrega. O projeto está no estado pré-TESTING.md.

**Interpretation rule aplicada**:

- Lib/pure helpers (T1) → unit. Coberto em T2 (mesma task, mas separado para manter a escrita e o teste atômicos por responsabilidade).
- Hooks React (T3) → unit. Coberto em T4.
- UI client components (T5–T10) → nenhum test type mandatório. Mudanças são wiring + guards; cobertura vem do UAT em T12. Não há e2e specs existentes para dashboard ou categorias (`tests/e2e/smoke.spec.ts` está stale, conforme AGENTS.md).
- RSC `page.tsx` (T11) → nenhum test type mandatório.
- Gate final (T12) → e2e manual.

**Nenhuma ❌ VIOLATION.** Nenhum task precisa adicionar testes além do planejado. Se o projeto ganhar uma Test Coverage Matrix formal no futuro, T5–T10 podem precisar de testes de componente com Testing Library — registrar como follow-up no STATE.md, não bloquear este design.

---

## Requirement Traceability (cross-check)

| Requirement ID | Story                                                | Covered by tasks                  | Status      |
| -------------- | ---------------------------------------------------- | --------------------------------- | ----------- |
| MONTH-01       | P1: selector visits every month                      | T1, T2, T3, T4, T5, T8, T11       | ✅ Mapped   |
| MONTH-02       | P1: empty month renders explicitly                   | T3, T4, T5, T8, T9                | ✅ Mapped   |
| MONTH-03       | P2: import card gated by M-1 data                    | T5, T6                            | ✅ Mapped   |
| MONTH-04       | P2: empty M-1 shows toast                            | T7                                | ✅ Mapped   |

**Coverage**: 4 total, 4 mapped to tasks, 0 unmapped. ✅ (resolvido o aviso ⚠️ do spec).
