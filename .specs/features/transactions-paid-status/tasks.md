# Transactions Paid Status — Tasks

**Design**: `.specs/features/transactions-paid-status/design.md`
**Status**: Draft

> **Nota sobre testes**: este projeto **não possui** `.specs/codebase/TESTING.md` nem matriz de cobertura. Por isso todas as tasks declaram `Tests: none` (legítimo per template §Test Co-location Validation: "`Tests: none` is only valid when the coverage matrix says 'none' for that code layer" — aqui a matrix não existe, então assumimos "none" como default conservador). Quando o projeto ganhar `TESTING.md`, revalidar e ajustar tasks que tocam service / router.

---

## Execution Plan

### Phase 1 — Foundation (sequencial, sem paralelo)

Migração do schema e propagação do tipo `paid` do banco até o Zod. Tudo sequencial porque cada task depende do tipo da anterior.

```
T1 → T2 → T3 → T4 → T5
```

### Phase 2 — UI de criação / edição (paralelo OK após T5)

Dialog e form. Como modificam o mesmo arquivo (`transaction-dialog.tsx`) e o form já existe, rodam sequencialmente para evitar conflitos de merge.

```
T5 → T6
```

### Phase 3 — Toggle na tabela (depende de T5)

```
T5 → T7
```

### Phase 4 — Header do dashboard (depende de T5)

Independente de T6 e T7 (só lê do hook que já existe).

```
T5 → T8
```

### Phase 5 — Saldo da conta (depende de T1)

Mudança no `account-service`. Independente do front, mas precisa da coluna `paid` no banco (T1).

```
T1 → T9
```

### Diagrama consolidado

```
T1 → T2 → T3 → T4 → T5
                          ├→ T6
                          ├→ T7
                          └→ T8
T1 ────────────────────────→ T9
```

---

## Task Breakdown

### T1: Adicionar coluna `paid` ao schema Drizzle

**What**: Adicionar `paid: boolean("paid").notNull().default(true)` à tabela `transactions` em `src/server/db/schema.ts`.
**Where**: `src/server/db/schema.ts` (tabela `transactions`, linha 111)
**Depends on**: None
**Reuses**: padrão `notNull().default(...)` já presente em `createdAt` / `transactionAt`
**Requirement**: TXPAID-01

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Coluna `paid` adicionada após `createdAt` na definição da tabela
- [ ] Tipo do schema compila com `bun typecheck`
- [ ] Nenhuma outra tabela foi modificada

**Tests**: none
**Gate**: quick
**Commit**: `feat(transactions): add paid boolean to schema`

---

### T2: Gerar e aplicar migration Drizzle

**What**: Rodar `bun db:generate` para criar SQL de migration e `bun db:migrate` para aplicar (em dev). Arquivo gerado em `drizzle/`.
**Where**: `drizzle/00XX_add_paid_to_transactions.sql` (gerado pelo Drizzle Kit)
**Depends on**: T1
**Reuses**: pipeline `bun db:generate` + `bun db:migrate` documentado em AGENTS.md
**Requirement**: TXPAID-01

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Comando `bun db:generate` produz um arquivo `.sql` em `drizzle/`
- [ ] SQL contém `ALTER TABLE "transactions" ADD COLUMN "paid" boolean NOT NULL DEFAULT true`
- [ ] Comando `bun db:migrate` aplica sem erro
- [ ] `bun typecheck` continua passando (sem regressão no tipo gerado)
- [ ] `bun lint` continua passando

**Tests**: none
**Gate**: quick
**Commit**: `chore(db): generate paid column migration`

---

### T3: Estender `createTransactionSchema` com `paid`

**What**: Adicionar `paid: z.boolean().default(true)` ao `createTransactionSchema` em `src/shared/schemas/transaction.ts`.
**Where**: `src/shared/schemas/transaction.ts` (linha 3-11)
**Depends on**: T2 (o tipo `Transaction` em `RouterOutputs` precisa da coluna no DB)
**Reuses**: padrão atual de campos opcionais; `z.boolean().default(true)` cobre clients antigos
**Requirement**: TXPAID-01, TXPAID-02

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] `createTransactionSchema` exporta `paid: z.boolean().default(true)`
- [ ] `bun typecheck` passa
- [ ] `CreateTransactionInput` (tipo inferido) inclui `paid: boolean`

**Tests**: none
**Gate**: quick
**Commit**: `feat(schemas): accept paid on transaction create`

---

### T4: Estender `updateTransactionSchema` com `paid`

**What**: Adicionar `paid: z.boolean().optional()` ao `updateTransactionSchema`.
**Where**: `src/shared/schemas/transaction.ts` (linha 36-44)
**Depends on**: T2
**Reuses**: padrão atual de campos `.optional()` para update parcial
**Requirement**: TXPAID-05

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] `updateTransactionSchema` exporta `paid: z.boolean().optional()`
- [ ] `bun typecheck` passa

**Tests**: none
**Gate**: quick
**Commit**: `feat(schemas): accept paid on transaction update`

---

### T5: Aceitar `paid` no service (`createTransaction` + `updateTransaction`)

**What**: Estender a assinatura de `createTransaction` e `updateTransaction` em `src/server/services/transaction-service.ts` para receber `paid?: boolean`. Em `create`, inserir `paid: input.paid ?? true`; em `update`, adicionar `if (input.paid !== undefined) updates.paid = input.paid` ao builder de updates (mesmo padrão dos outros campos opcionais).
**Where**: `src/server/services/transaction-service.ts` (função `createTransaction` antes da linha 142; `updateTransaction:142`)
**Depends on**: T3, T4
**Reuses**: padrão de `updates: Record<string, unknown>` em `updateTransaction`; `writeAuditLog` continua gravando `before/after` (campo `paid` incluído automaticamente pelo spread)
**Requirement**: TXPAID-01, TXPAID-05

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] `createTransaction` aceita `paid?: boolean` e o persiste
- [ ] `updateTransaction` aceita `paid?: boolean` e o atualiza sem sobrescrever outros campos quando ausente
- [ ] Audit log do update continua funcionando (campo `paid` aparece em `after` quando alterado)
- [ ] `bun typecheck` e `bun lint` passam

**Tests**: none
**Gate**: quick
**Commit**: `feat(transactions): accept paid in service layer`

---

### T6: Adicionar Checkbox "Pago" no `TransactionDialog`

**What**: Adicionar um campo `paid` ao form do `transaction-dialog.tsx` (TanStack Form), com `<Checkbox>` controlado. Default `true` no `defaultValues`. Em modo de edição, pré-preencher com o valor atual da transação. Mostrar o hint "Você poderá marcar como pago depois na tabela" quando `paid === false`. Enviar `paid` no `onSubmit` para `create` / `update`.
**Where**: `src/app/dashboard/transaction-dialog.tsx`
**Depends on**: T5
**Reuses**: `useForm` (TanStack Form) já em uso no arquivo; `<Checkbox>` de `src/components/ui/checkbox.tsx`; schema Zod via `createTransactionSchema` (ou `.pick`) garante validação
**Requirement**: TXPAID-02, TXPAID-03

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Checkbox "Pago" renderiza no dialog, marcado por default
- [ ] Hint "Você poderá marcar como pago depois na tabela" aparece **apenas** quando desmarcado
- [ ] Criar com checkbox marcado grava `paid: true` no banco
- [ ] Criar com checkbox desmarcado grava `paid: false` no banco
- [ ] Editar transação existente abre com o valor atual de `paid`
- [ ] Arquivo continua abaixo de 500 linhas (ESLint)
- [ ] `bun typecheck`, `bun lint` passam

**Tests**: none
**Gate**: quick
**Commit**: `feat(transactions): add paid checkbox to dialog`

---

### T7: Adicionar coluna Checkbox com toggle otimista na tabela

**What**: Inserir uma nova primeira coluna no `TransactionsTable` (no `src/app/dashboard/ui.tsx` ou em subcomponente extraído se o arquivo passar de 500 linhas) com `<Checkbox>` controlado. Implementar toggle otimista: `useState<pendingRowId | null>`, `onCheckedChange` atualiza o estado local imediatamente, dispara `transactions.update({ transactionId, familyId, paid: next })`, em `onSuccess` chama `useInvalidateQueries({ accounts: true, transactions: true })` (sem toast), em `onError` reverte o estado local + `toast.error("Não foi possível atualizar o status.")`. `e.stopPropagation()` no `onClick` do Checkbox para não abrir o dialog da linha. Desabilitar Checkbox quando o usuário é viewer (role sem permissão — checar `api.family.me` ou prop).
**Where**: `src/app/dashboard/ui.tsx` (ou `src/app/dashboard/transactions-table.tsx` se extraído)
**Depends on**: T5
**Reuses**: hook `useTRPC().transactions.update.useMutation()`; `useInvalidateQueries`; `toast` de `sonner`; `<Checkbox>`; `api.family.me` (já carregado no dashboard) para checagem de role
**Requirement**: TXPAID-04, TXPAID-05, TXPAID-06

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Primeira coluna da tabela mostra `<Checkbox>` em cada linha
- [ ] Click no Checkbox chama `transactions.update` com **apenas** `{ transactionId, familyId, paid }`
- [ ] Estado local muda imediatamente (otimista)
- [ ] Linha fica visualmente disabled (opacity-50, pointer-events-none) enquanto `pendingRowId === row.id`
- [ ] Sucesso: nenhum toast; `useInvalidateQueries` revalida accounts + transactions
- [ ] Erro: Checkbox volta ao estado anterior + `toast.error()` em pt-BR
- [ ] Click no Checkbox **não** abre o dialog de edição
- [ ] Viewer (read-only) tem Checkbox `disabled`
- [ ] Arquivo final abaixo de 500 linhas (ESLint)
- [ ] `bun typecheck`, `bun lint` passam

**Tests**: none
**Gate**: quick
**Commit**: `feat(transactions): add paid toggle to table`

---

### T8: Dois saldos no header do dashboard

**What**: Substituir `monthBalance` (linha 166 de `ui.tsx`) por dois valores: `monthBalancePlanned` (já é o que `monthBalance` calcula hoje — soma de todas as tx do mês) e `monthBalanceReal` (soma apenas de `t.paid === true`). Renderizar ambos como `Card`s (ou dois valores no mesmo card). Mostrar hint "Diferença: R$ X pendente" **apenas** quando `monthBalancePlanned !== monthBalanceReal`.
**Where**: `src/app/dashboard/ui.tsx` (perto da linha 166 e da linha 312 onde `monthBalance` é renderizado)
**Depends on**: T5 (precisa do campo `paid` no tipo `Transaction` retornado por `transactions.listAll`)
**Reuses**: `useMemo` existente; `brl()` formatter; `<Card>` do shadcn
**Requirement**: TXPAID-07

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Header mostra "Saldo real" e "Saldo planejado" com valores distintos quando há tx pendentes
- [ ] Quando `monthBalancePlanned === monthBalanceReal`, hint "Diferença" **não** aparece
- [ ] Quando há tx pendentes, hint aparece com `brl(Math.abs(diff))` e label "pendente"
- [ ] Valores recalculam após toggle (sem full page reload — TanStack Query refetch via `useInvalidateQueries`)
- [ ] `bun typecheck`, `bun lint` passam
- [ ] Arquivo final abaixo de 500 linhas (ESLint)

**Tests**: none
**Gate**: quick
**Commit**: `feat(dashboard): split month balance into planned and real`

---

### T9: Filtrar `balanceCents` por `paid = true` no `account-service`

**What**: Em `listAccounts` (`src/server/services/account-service.ts:21-30`), adicionar `eq(transactions.paid, true)` ao `where` da query que calcula o `income`/`expense` por conta. Importar `and` e `eq` de `drizzle-orm` (já importados) e combinar com `inArray(transactions.accountId, accountIds)` via `and(...)`.
**Where**: `src/server/services/account-service.ts` (função `listAccounts`, linhas 21-30)
**Depends on**: T1
**Reuses**: padrão atual de `where(inArray(...))`; `and`, `eq` já no import (linha 1)
**Requirement**: TXPAID-08

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Query em `listAccounts` filtra por `eq(transactions.paid, true)` além do `inArray` existente
- [ ] `getAccountsSummary` (que chama `listAccounts`) retorna `totalBalanceCents` considerando apenas tx pagas
- [ ] Marcar uma tx pendente como paga faz `totalBalanceCents` cair/aumentar conforme o tipo
- [ ] `bun typecheck` e `bun lint` passam

**Tests**: none
**Gate**: quick
**Commit**: `feat(accounts): compute balance from paid transactions only`

---

## Parallel Execution Map

```
Phase 1 (Sequential — dependências de tipo/DB):
  T1 ──→ T2 ──→ T3 ──→ T4 ──→ T5

Phase 2/3/4 (após T5; cada task modifica arquivo diferente,
             mas todas leem do tipo gerado por T5):
  T5 ──→ T6 (transaction-dialog.tsx)
  T5 ──→ T7 (dashboard/ui.tsx — toggle)
  T5 ──→ T8 (dashboard/ui.tsx — header)

Phase 5 (independente do front; depende só do schema):
  T1 ──→ T9 (account-service.ts)
```

**Restrição de paralelismo:**

- T6, T7 e T8 **não podem rodar em paralelo** entre si:
  - T6 e T7 tocam arquivos diferentes (T6 em `transaction-dialog.tsx`, T7 em `dashboard/ui.tsx`), então em princípio poderiam, mas como ambos são sub-agentes modificando arquivos de UI, executar sequencialmente reduz risco de regressão visual cruzada.
  - T7 e T8 **modificam o mesmo arquivo** (`dashboard/ui.tsx`) e ESLint 500 linhas é sensível — sequencial é obrigatório.
- T9 é independente e pode rodar em paralelo com T6/T7/T8 (arquivo e domínio diferentes).

**Safe-parallel (recomendado):**

```
Após T5:     T6  ║  T7 → T8  ║  T9
             (1)   (sequencial)   (paralelo)
```

---

## Task Granularity Check

| Task                                          | Escopo                                            | Status        |
| --------------------------------------------- | ------------------------------------------------- | ------------- |
| T1: Add `paid` column to schema               | 1 campo em 1 tabela                               | ✅ Granular   |
| T2: Generate + apply Drizzle migration        | 1 migration (gerada)                              | ✅ Granular   |
| T3: Extend `createTransactionSchema`          | 1 schema Zod, 1 campo                             | ✅ Granular   |
| T4: Extend `updateTransactionSchema`          | 1 schema Zod, 1 campo                             | ✅ Granular   |
| T5: Accept `paid` in service (create + update)| 2 funções no mesmo arquivo, mesmo padrão           | ✅ Granular (coeso) |
| T6: Add Checkbox in dialog                    | 1 componente, 1 form, 1 hint                      | ✅ Granular   |
| T7: Add Checkbox column to table (optimistic) | 1 coluna + 1 mutação otimista                     | ✅ Granular   |
| T8: Two balances in dashboard header          | 1 cálculo derivado + 1 render                     | ✅ Granular   |
| T9: Filter `balanceCents` by `paid`           | 1 query em 1 service function                     | ✅ Granular   |

---

## Diagram-Definition Cross-Check

| Task | `Depends on` (body) | Diagrama mostra            | Status        |
| ---- | ------------------- | -------------------------- | ------------- |
| T1   | None                | (nenhum)                   | ✅ Match      |
| T2   | T1                  | T1 → T2                    | ✅ Match      |
| T3   | T2                  | T2 → T3                    | ✅ Match      |
| T4   | T2                  | T2 → T4                    | ✅ Match      |
| T5   | T3, T4              | T3, T4 → T5                | ✅ Match      |
| T6   | T5                  | T5 → T6                    | ✅ Match      |
| T7   | T5                  | T5 → T7                    | ✅ Match      |
| T8   | T5                  | T5 → T8                    | ✅ Match      |
| T9   | T1                  | T1 → T9                    | ✅ Match      |

Sem `[P]` flags, então não há dependências circulares ou paralelas falsas a checar.

---

## Test Co-location Validation

> Projeto **não** tem `.specs/codebase/TESTING.md`. Assume-se cobertura `"none"` para todas as camadas até a matrix existir.

| Task | Camada criada/modificada              | Matrix requer | Task diz     | Status        |
| ---- | ------------------------------------- | ------------- | ------------ | ------------- |
| T1   | Drizzle schema                        | (none)        | Tests: none  | ✅ OK         |
| T2   | Migration SQL (gerada)                | (none)        | Tests: none  | ✅ OK         |
| T3   | Zod schema (shared)                   | (none)        | Tests: none  | ✅ OK         |
| T4   | Zod schema (shared)                   | (none)        | Tests: none  | ✅ OK         |
| T5   | Service function                      | (none)        | Tests: none  | ✅ OK         |
| T6   | React component (form field)          | (none)        | Tests: none  | ✅ OK         |
| T7   | React component (table column)        | (none)        | Tests: none  | ✅ OK         |
| T8   | React component (header render)       | (none)        | Tests: none  | ✅ OK         |
| T9   | Service function (query filter)       | (none)        | Tests: none  | ✅ OK         |

**Quando `TESTING.md` for criado**, revalidar:
- T5 e T9 provavelmente vão para `Tests: unit` (testar a função pura de agregação com mock de Drizzle).
- T6, T7, T8 provavelmente vão para `Tests: e2e` (Playwright, via `bun test:e2e`).
- T1, T2, T3, T4 continuam `none` (schema/infra).

---

## Requirement → Task Traceability

| Requirement ID | Task(s) | Status |
| -------------- | ------- | ------ |
| TXPAID-01      | T1, T2, T3, T5 | Mapped |
| TXPAID-02      | T3, T6        | Mapped |
| TXPAID-03      | T5, T6        | Mapped |
| TXPAID-04      | T7            | Mapped |
| TXPAID-05      | T4, T5, T7    | Mapped |
| TXPAID-06      | T7            | Mapped |
| TXPAID-07      | T8            | Mapped |
| TXPAID-08      | T9            | Mapped |

**Coverage:** 8/8 mapped ✅
