# Nossa Grana — Project Vision

## What we are building

A family finance management app (Brazilian Portuguese, pt-BR) where households centralize accounts, categories, and transactions with auditable business rules and a modern UX.

## Why now

Families today juggle multiple accounts and shared expenses without a single source of truth that tracks who paid what, what was planned vs. what was actually paid, and how the month is trending. The product replaces ad-hoc spreadsheets and split apps with one auditable surface.

## North Star

A household can open the app on the 1st of the month, see last month's reality and this month's plan side by side, carry forward recurring expenses with one click, and trust the numbers because every change is logged.

## Constraints (permanent)

- No explicit `any` in TypeScript.
- Max 500 lines per file (ESLint-enforced).
- No structural duplication, no useless re-exports.
- Forms use TanStack Form + shared Zod schemas.
- Creation/edit happens in modals, not separate routes.
- tRPC is the only API layer for domain features.
- Cache invalidation goes through `useInvalidateQueries()`.

## Out of scope (current phase)

- AI assistant in production
- Recurring automatic transactions
- File attachments (receipts)
- CSV/PDF export
- Tags/labels on transactions

## Stakeholders

- Product Owner: Bruno
- Tech Lead: Bruno
- Design: internal spec, references `shadcn-admin`
- QA: Vitest (unit) + Playwright (e2e)
