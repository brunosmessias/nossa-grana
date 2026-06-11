# State

**Branch:** spec/monthly-flow-improvements
**Last updated:** 2026-06-10

## Decisions

- TLC `.specs/` structure used in this repo, even though no previous `.specs/` existed here. Justified by AGENTS.md line 153: "SEMPRE usar a SKILL TLC para TODAS as atividades."
- Branch `spec/monthly-flow-improvements` created for the 4 features. Implementation will branch from this.
- `paid` field added to `transactions`: default `true` for existing data, user choice for new.
- Pending transactions do NOT affect account balance (user decision: paid is what moves money).
- Month selector stays as a month input; the bug is in the gating logic, not the input.
- Import dialog still only opens from the previous *calendar* month, not the last non-empty month (user explicit: "no import não precisa mostrar se n tiver coisas no msm anterior").

## Blockers

- None yet. Implementation will need a Drizzle migration for the `paid` column on `transactions`.

## Open questions for design phase

- Should `paidAt` be a separate timestamp from `transactionAt`? Current spec treats `transactionAt` as both date and paid-date. Likely fine for v1.
- Sort indicator: shadcn already has `ArrowUpDown` lucide icon. Confirm before design.

## Todos

- [ ] Spec review with Bruno
- [ ] Move to Design phase per feature (4 design.md files)
- [ ] Move to Tasks phase per feature (4 tasks.md files)
- [ ] Implement in the order: MONTH → SORT → TXPAID → TXEDIT (unblocks most users first)

## Deferred ideas

- Per-user persisted sort
- Multi-column sort
- `paidAt` separate from `transactionAt`
- Bulk edit
- Auto-mark-as-paid on import (with a "marcar todas como pagas" toggle in the import dialog)
- Calendar heatmap in the month selector
- "Skip to today" button
