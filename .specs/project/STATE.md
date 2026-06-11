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

## Pre-existing concerns flagged during design

- `transaction-dialog.tsx` uses raw `useState` for form state, which violates AGENTS.md ("ALL forms MUST use useForm from TanStack Form"). The TXEDIT and TXPAID designs call this out as a known issue and avoid migrating it in this PR. Track as a separate refactor.
- Drizzle migration is required for the `paid` column. The `bun db:generate` + `bun db:migrate` flow is the project standard.

## Sort feature implementation (2026-06-11)

- Implemented SORT-01..07 per `.specs/features/table-sorting/`. New component `src/components/ui/sortable-header.tsx`; dashboard now uses `transactions.list` with `dateFrom`/`dateTo` derived from `selectedMonth`; `/dashboard/transacoes` and `MonthlyView` consume `SortableHeader`. `listAll` procedure kept (still used by `categorias`/`contas`).
- Sort state (`sortBy` / `sortDir`) lives in `DashboardClient` so it persists across month changes per spec. `TransactionsPageClient` resets `page` to 1 on sort change.
- `TransactionSortKey` and `SortDirection` types exported from `src/shared/schemas/transaction.ts` (DRY with the Zod enum).
- Added a 3rd lightweight `transactions.list({ page: 1, pageSize: 1 })` call in the dashboard to know if the family has any transaction at all (replaces the old `transactions.length > 0` check that came from `listAll`).

## Deferred ideas

- Per-user persisted sort
- Multi-column sort
- `paidAt` separate from `transactionAt`
- Bulk edit
- Auto-mark-as-paid on import (with a "marcar todas como pagas" toggle in the import dialog)
- Calendar heatmap in the month selector
- "Skip to today" button
