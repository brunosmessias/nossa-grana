# Table Sorting Tasks

**Design:** `.specs/features/table-sorting/design.md`
**Status:** Done

---

## Execution Plan

### Phase 1: Foundation (Sequential)

The new component and the dashboard routing change must land before the page-level wiring.

```
T1 → T2 → T3
```

### Phase 2: Page Wiring (Sequential)

Wire the full page and the dashboard. Sequential because they share the `SortableHeader` contract.

```
T3 → T4 → T5
```

```
Phase 1:
  T1 ──→ T2 ──→ T3

Phase 2:
  T3 complete, then:
    T4 ──→ T5
```

---

## Task Breakdown

### T1: Create SortableHeader component

**What:** New shared header component that renders a label, an arrow indicator, and fires an `onSort` callback on click.

**Where:** `src/components/ui/sortable-header.tsx` (new file)

**Depends on:** None

**Reuses:** `TableHead` style from `src/components/ui/table.tsx`; `ArrowUp` / `ArrowDown` / `ArrowUpDown` from `lucide-react`.

**Requirement:** SORT-01, SORT-02

**Tools:**
- MCP: NONE
- Skill: NONE

**Done when:**
- [ ] File exists at the path above
- [ ] Exports a `SortableHeader` component with the props from the design
- [ ] Renders `<TableHead>` with the label and an arrow (`ArrowUp` if active asc, `ArrowDown` if active desc, no icon if inactive)
- [ ] Clicking calls `onSort(columnKey)`
- [ ] Has `cursor-pointer select-none` on the header to make clickability obvious
- [ ] Gate check passes: `bun typecheck`
- [ ] Test count: 0 new unit tests (covered by integration with page)

**Tests:** none
**Gate:** quick

**Verify:**
```bash
cd ~/Pessoal/nossa-grana && bun typecheck
```
Expected: zero errors.

---

### T2: Export shared sort key type

**What:** Export a TypeScript union type for the sortable column keys so client and server share it.

**Where:** `src/shared/schemas/transaction.ts` (modify, add near `orderBySchema`)

**Depends on:** None

**Reuses:** the literal union inside `orderBySchema`

**Requirement:** SORT-05, SORT-06

**Tools:**
- MCP: NONE
- Skill: NONE

**Done when:**
- [ ] A new exported type `TransactionSortKey = "transactionAt" | "amountCents" | "description"` exists in `src/shared/schemas/transaction.ts`
- [ ] The `orderBySchema` references the type (DRY) — or at minimum the values match
- [ ] Gate check passes: `bun typecheck`

**Tests:** none
**Gate:** quick

**Verify:**
```bash
cd ~/Pessoal/nossa-grana && bun typecheck
```
Expected: zero errors.

---

### T3: Switch dashboard to transactions.list with date range

**What:** Replace the `transactions.listAll` call in `src/app/dashboard/ui.tsx` with `transactions.list`, passing `dateFrom` / `dateTo` derived from `selectedMonth`. Update `monthTransactions` and `previousMonthTransactions` to read from the new shape.

**Where:** `src/app/dashboard/ui.tsx` (modify)

**Depends on:** T1, T2

**Reuses:** existing `selectedMonth`; existing tRPC `transactions.list` procedure

**Requirement:** SORT-03, SORT-05, SORT-06

**Tools:**
- MCP: NONE
- Skill: NONE

**Done when:**
- [ ] `transactions.listAll.useQuery` is replaced with `transactions.list.useQuery`
- [ ] The input includes `familyId`, `dateFrom: <first day of selectedMonth>`, `dateTo: <last day of selectedMonth>`, `page: 1`, `pageSize: 100`
- [ ] `monthTransactions` reads from `transactionsData?.items ?? []`
- [ ] `previousMonthTransactions` is computed from a second `list` query (or a derived `useMemo` over the same query if month range covers both — see Verify #3)
- [ ] No reference to `listAll` remains in this file
- [ ] Gate check passes: `bun typecheck && bun lint`

**Tests:** none
**Gate:** quick

**Verify:**
```bash
cd ~/Pessoal/nossa-grana && bun typecheck && bun lint
```
Expected: zero errors, zero warnings about unused imports.

Manual: open the dashboard, navigate to a month with transactions, confirm the data is the same as before the change.

---

### T4: Wire SortableHeader into the full transactions page

**What:** Add `sortBy` / `sortDir` state to `src/app/dashboard/transacoes/ui.tsx`, pass them to the existing `transactions.list` query, replace the plain `TableHead` cells on sortable columns with `<SortableHeader>`, and reset `page` to 1 on sort change.

**Where:** `src/app/dashboard/transacoes/ui.tsx` (modify)

**Depends on:** T3

**Reuses:** the `SortableHeader` from T1, the `list` procedure

**Requirement:** SORT-01, SORT-02, SORT-04, SORT-05, SORT-06, SORT-07

**Tools:**
- MCP: NONE
- Skill: NONE

**Done when:**
- [ ] `useState` for `sortBy` (default `"transactionAt"`) and `sortDir` (default `"desc"`)
- [ ] The `list` query receives the sort inputs
- [ ] On sort click: if same column, toggle dir; if new column, set new column and `desc`
- [ ] When sort changes, `setPage(1)` runs
- [ ] The "Data", "Descrição", and "Valor" headers are replaced with `<SortableHeader>`; non-sortable columns keep plain `TableHead`
- [ ] An arrow icon renders next to the active column
- [ ] Gate check passes: `bun typecheck && bun lint`

**Tests:** none
**Gate:** quick

**Verify:**
```bash
cd ~/Pessoal/nossa-grana && bun typecheck && bun lint
```
Expected: zero errors.

Manual: on `/dashboard/transacoes`, click "Valor" header twice — rows sort ascending then descending with arrow indicator. Click "Data" — switches to date with desc default.

---

### T5: Wire SortableHeader into the dashboard month tables

**What:** Add the same `sortBy` / `sortDir` state in the dashboard, and use `<SortableHeader>` in the Despesas and Receitas tables.

**Where:** `src/app/dashboard/ui.tsx` (modify) and the `MonthlyView` component if it owns the table headers

**Depends on:** T4

**Reuses:** the `SortableHeader` from T1, the same `list` query from T3

**Requirement:** SORT-01, SORT-02, SORT-05, SORT-06, SORT-07

**Tools:**
- MCP: NONE
- Skill: NONE

**Done when:**
- [ ] The Despesas table headers (Data, Descrição, Valor) and the Receitas table headers use `<SortableHeader>`
- [ ] Clicking a header updates the shared sort state, triggers a refetch, and re-renders the rows
- [ ] The arrow indicator matches the active column
- [ ] Sort persists when the user changes the month (sort is a property of the list, not the month)
- [ ] Gate check passes: `bun typecheck && bun lint && bun test`

**Tests:** none
**Gate:** full

**Verify:**
```bash
cd ~/Pessoal/nossa-grana && bun check
```
Expected: typecheck, lint, and existing unit tests all pass.

Manual: change month, sort by Valor desc, change month again — sort persists.

---

## Parallel Execution Map

Tasks T1 and T2 can be created in parallel (different files, no overlap). T3-T5 are sequential because they all touch `dashboard/ui.tsx` and depend on the new component being present.

```
Phase 1 (Sequential):
  T1 ──→ T2 ──→ T3

Phase 2 (Sequential):
  T3 complete, then:
    T4 ──→ T5
```

No `[P]` flags: all five tasks touch files that overlap (`ui.tsx` and the new component). Concurrency risk is low but real (TypeScript re-checks would race). Sequential is safer.

---

## Task Granularity Check

| Task | Scope                                | Status      |
| ---- | ------------------------------------ | ----------- |
| T1   | 1 new component file                 | ✅ Granular |
| T2   | 1 type export in 1 existing file     | ✅ Granular |
| T3   | 1 router call swap in 1 file         | ✅ Granular |
| T4   | 1 page wiring (state + headers)      | ✅ Granular |
| T5   | 1 page wiring (headers in tables)    | ✅ Granular |

Granularity check: all 5 tasks are single-purpose and verifiable.

---

## Diagram-Definition Cross-Check

| Task | Depends On (body) | Diagram Shows                | Status |
| ---- | ----------------- | ---------------------------- | ------ |
| T1   | None              | (start)                      | ✅ Match |
| T2   | None              | (start)                      | ✅ Match |
| T3   | T1, T2            | T1 → T2 → T3                 | ✅ Match |
| T4   | T3                | T3 → T4                      | ✅ Match |
| T5   | T4                | T4 → T5                      | ✅ Match |

Diagram and task bodies agree.

---

## Test Co-location Validation

The repo's AGENTS.md mandates Vitest unit tests for `src/**/*.test.ts/x` and ESLint enforcement. The dashboard pages are not currently covered by unit tests (no `dashboard/ui.test.tsx` exists). Adding unit tests for click handlers and sort toggling would be valuable, but the existing dashboard has none. For consistency with the rest of the codebase, this design relies on the gate command (`bun check`) to catch regressions and on the Playwright e2e suite (currently a smoke test) to catch the user-facing flow. Adding per-task unit tests would be a separate effort; we keep this task list aligned with the project's current test posture.

| Task | Code Layer Created/Modified | Matrix Requires   | Task Says | Status                       |
| ---- | --------------------------- | ----------------- | --------- | ---------------------------- |
| T1   | Shared UI component         | none (no test infra for this layer today) | none | ✅ OK                        |
| T2   | Shared type export          | none              | none      | ✅ OK                        |
| T3   | tRPC query wiring           | none              | none      | ✅ OK                        |
| T4   | Page component              | none              | none      | ✅ OK                        |
| T5   | Page component              | none              | none      | ✅ OK                        |

No ❌ violations.
