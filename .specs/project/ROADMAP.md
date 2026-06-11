# Roadmap

**Current Milestone:** Monthly flow improvements
**Status:** In Progress

---

## M1: Monthly flow improvements

**Goal:** Make the dashboard month the most trustworthy and least error-prone surface in the app. User can fix a transaction, see what is paid vs. planned, navigate empty months without confusion, and sort any table.

**Target:** Specs ready, implementation following TLC.

### Features

**transactions-edit** — PLANNED
- Click pencil icon on a transaction row → opens the same dialog used for creating, prefilled
- Edit any field, save, audit log
- Edit does not break batch import or batch operations

**transactions-paid-status** — PLANNED
- Schema migration: add `paid` boolean to `transactions` (default true for back-compat with current data; user choice for new transactions)
- New transaction form: paid checkbox
- Quick toggle in transaction table: Checkbox in first column, with per-row loading state, optimistic update
- Dashboard header: "saldo real" = sum of paid only, "saldo planejado" = sum of all (both INCOME and EXPENSE)
- Account balance reflects paid only (pending does NOT debit the account)

**month-selector-empty-import** — PLANNED
- Month selector passes through every month, including empty ones (no implicit skipping)
- Import-from-previous dialog only opens if the previous calendar month has transactions; otherwise show toast "Sem transações no mês anterior para importar" and do not show the card

**table-sorting** — PLANNED
- Click any sortable column header in dashboard tables (despesas, receitas, transações, contas) → sort
- Server-side `orderBy` + `orderDir` on the tRPC procedure, so paginated lists respect the sort
- Visual indicator: arrow up/down next to the active column

---

## Future Considerations

- Recurring transactions (auto-create monthly)
- Per-user saved sorts
- Multi-column sort
- Receipts/attachments
- CSV/PDF export
- Mobile-first redesign of dashboard
- Shared budgets
- Goals
- Transfers
