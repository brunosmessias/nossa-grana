# State

**Branch:** spec/monthly-flow-improvements
**Last updated:** 2026-06-10

## Decisions

- TLC `.specs/` structure used in this repo, even though no previous `.specs/` existed here. Justified by AGENTS.md line 153: "SEMPRE usar a SKILL TLC para TODAS as atividades."
- Branch `spec/monthly-flow-improvements` created for the 4 features. Implementation will branch from this.
- `paid` field added to `transactions`: default `true` for existing data, user choice for new.
- Pending transactions do NOT affect account balance (user decision: paid is what moves money).
- MONTH selector: the "skip" bug was deeper than the spec assumed — it's the chevron-by-index navigation using `getAvailableMonths` (months that have data) as the index space, not a date input. Fix is to switch to month arithmetic on the YYYY-MM string, with `familyCreatedMonth` as the lower bound.
- Import dialog still only opens from the previous *calendar* month, not the last non-empty month (user explicit: "no import não precisa mostrar se n tiver coisas no msm anterior").
- SORT reuses `transactions.list` with `dateFrom`/`dateTo` for the dashboard (no new procedure). Sort persists between months.

## Blockers

- None yet. Implementation will need a Drizzle migration for the `paid` column on `transactions`.

## Open questions for design phase

- Should `paidAt` be a separate timestamp from `transactionAt`? Current spec treats `transactionAt` as both date and paid-date. Likely fine for v1.
- Sort indicator: shadcn already has `ArrowUpDown` lucide icon. Confirm before design.

## Todos

- [x] Spec review with Bruno
- [x] Move to Design phase per feature (4 design.md files)
- [x] Move to Tasks phase per feature (4 tasks.md files)
- [ ] Implement in the order: MONTH → SORT → TXPAID → TXEDIT (unblocks most users first)
- [x] SORT: implement + verify (T1–T5 done, bun check pass)
- [x] TXEDIT: implement + verify (T1–T5 done, bun check pass)

## Pre-existing concerns flagged during design

- `transaction-dialog.tsx` uses raw `useState` for form state, which violates AGENTS.md ("ALL forms MUST use useForm from TanStack Form"). The TXEDIT and TXPAID designs call this out as a known issue and avoid migrating it in this PR. Track as a separate refactor.
- Drizzle migration is required for the `paid` column. The `bun db:generate` + `bun db:migrate` flow is the project standard.

## Sort feature implementation (2026-06-11)

- Implemented SORT-01..07 per `.specs/features/table-sorting/`. New component `src/components/ui/sortable-header.tsx`; dashboard now uses `transactions.list` with `dateFrom`/`dateTo` derived from `selectedMonth`; `/dashboard/transacoes` and `MonthlyView` consume `SortableHeader`. `listAll` procedure kept (still used by `categorias`/`contas`).
- Sort state (`sortBy` / `sortDir`) lives in `DashboardClient` so it persists across month changes per spec. `TransactionsPageClient` resets `page` to 1 on sort change.
- `TransactionSortKey` and `SortDirection` types exported from `src/shared/schemas/transaction.ts` (DRY with the Zod enum).
- Added a 3rd lightweight `transactions.list({ page: 1, pageSize: 1 })` call in the dashboard to know if the family has any transaction at all (replaces the old `transactions.length > 0` check that came from `listAll`).

## Edit transaction implementation (2026-06-11)

- Implemented TXEDIT-01..03 per `.specs/features/transactions-edit/`. T1–T5 done; `bun check` (typecheck + lint + unit tests) passes.
- `TransactionDialog` is now mode-aware: optional `initialTransaction` + `onUpdate` props turn it into the edit form. Title switches ("Editar despesa/receita"), submit button reads "Salvar" instead of "Criar".
- In edit mode the dialog renders an account `<Select>` prefilled from `initialTransaction.accountId`. The `clientSchema` now requires `accountId` (Zod) so the field is validated like the others.
- `MonthlyView` gained an optional `onEditTransaction` prop. When provided, a 5th column appears with a `<Pencil />` button (`opacity-0 group-hover:opacity-100 focus-within:opacity-100`, `aria-label="Editar transação"`). Empty-state `colSpan` is now 5 when the column is present.
- `/dashboard/transacoes` `TxRow` got a matching `<Pencil />` button in the actions cell (next to the existing trash), `stopPropagation` on click so it doesn't also trigger the whole-row edit shortcut.
- `dashboard/ui.tsx` owns `editingTx` state; clears it on close so the next open is create. Audit logging was already in `transactionService.updateTransaction` — no server changes.

## Deferred ideas

- Per-user persisted sort
- Multi-column sort
- `paidAt` separate from `transactionAt`
- Bulk edit
- Auto-mark-as-paid on import (with a "marcar todas como pagas" toggle in the import dialog)
- Calendar heatmap in the month selector
- "Skip to today" button
- Migrate `TransactionDialog` (and `TxFormDialog`) to TanStack Form — pre-existing AGENTS.md violation, separate from TXEDIT. The current form uses raw `useState` for fields.
