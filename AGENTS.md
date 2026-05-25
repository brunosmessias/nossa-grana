# AGENTS.md

Brazilian family finance management app (Nossa Grana). UI is in Brazilian Portuguese (pt-BR).

## Commands

```bash
bun dev              # Start dev server
bun build            # Production build
bun start            # Start production server
bun lint             # ESLint (@eslint/js + typescript-eslint)
bun typecheck        # tsc --noEmit
bun test             # Vitest unit tests (jsdom, src/**/*.test.ts/x)
bun test:watch       # Vitest in watch mode
bun test:e2e         # Playwright e2e tests (tests/e2e/)
bun check            # Runs typecheck + lint + test in sequence
bun db:generate      # Generate Drizzle migration from schema changes
bun db:migrate       # Run pending Drizzle migrations
bun db:push          # Push schema directly to DB (dev convenience)
```

## Architecture

**Stack**: Next.js 16 (App Router, RSC) · React 19 · TypeScript (strict) · Tailwind CSS v4 · Drizzle ORM (PostgreSQL) · better-auth · tRPC v11 · Zod · Resend (email)

### tRPC as the sole API layer

All family-scoped business logic uses **tRPC** — no Next.js route handlers for domain features. Exceptions:
- `/api/auth/*` — better-auth catch-all handler
- `/api/trpc/*` — tRPC HTTP adapter
- `/api/seed/legacy/*` — one-off seed migration (stays as route handler, NOT migrated)
- Webhooks — external integrations (handled separately)

Routers are in `src/server/api/routers/`, composed in `src/server/api/root.ts`. Procedures use `publicProcedure` or `protectedProcedure` (auth middleware in `src/server/api/trpc.ts`).

### Layered server structure

```
tRPC router (src/server/api/routers/)
  → protectedProcedure (auth guard via session)
  → Zod schema validation (schemas from src/shared/schemas/)
  → Service function (src/server/services/)
    → assertFamilyMember() — authorization check for family-scoped data
    → Drizzle DB operations (src/server/db/schema.ts)
    → writeAuditLog() — audit trail for mutations
```

### Path alias

`@/*` maps to `./src/*` (configured in tsconfig.json).

### Key directories

| Path | Purpose |
|---|---|
| `src/app/` | Next.js App Router pages and API routes |
| `src/app/api/trpc/` | tRPC HTTP adapter (fetchRequestHandler) |
| `src/app/api/auth/` | better-auth catch-all handler |
| `src/app/api/seed/legacy/` | One-off seed data migration (NOT migrated to tRPC) |
| `src/components/ui/` | shadcn/ui components (base-nova style, built on @base-ui/react) |
| `src/shared/schemas/` | Zod validation schemas (shared between client and server) |
| `src/shared/types/` | TypeScript types inferred from tRPC router (`RouterInputs`/`RouterOutputs`) |
| `src/hooks/` | Shared React hooks (`useInvalidateQueries` for tRPC cache invalidation) |
| `src/server/db/schema.ts` | Drizzle schema (app tables + auth tables re-exported) |
| `src/server/auth/` | better-auth server config + client + session helper |
| `src/server/services/` | Business logic by domain: `account-service.ts`, `category-service.ts`, `transaction-service.ts`, `auth-service.ts`, `family-service.ts` |
| `src/server/api/routers/` | tRPC routers (accounts.ts, categories.ts, transactions.ts, family.ts) |
| `src/server/audit/` | Audit log writing + event definitions |
| `src/server/email/` | Email sending (Resend) + templates |
| `drizzle/` | Generated SQL migrations |

## Database

- **PostgreSQL** via `postgres` driver, Drizzle ORM
- Schema in `src/server/db/schema.ts` (app tables + auth tables re-exported)
- Monetary values stored as **integer cents** (`amountCents`, `initialBalanceCents`, `balanceCents`) — never floats
- IDs are UUIDs (`defaultRandom()`) except auth tables which use text IDs from better-auth
- `familyMembers` has a composite primary key `(familyId, userId)`
- Enums defined as `pgEnum`: `family_role`, `invite_status`, `account_type`, `category_kind`, `transaction_type`

### Migrations

1. Edit schema in `src/server/db/schema.ts`
2. Run `bun db:generate` to create SQL migration in `drizzle/`
3. Run `bun db:migrate` to apply

## Authentication

- **better-auth** with Google OAuth + Email OTP (magic link via 6-digit code)
- Server: `src/server/auth/auth.ts` — configured with Drizzle adapter, Google provider, emailOTP plugin
- Client: `src/server/auth/auth-client.ts` — `authClient` for client-side auth operations
- Session helper: `getRequiredSession()` in `src/server/auth/session.ts` — throws if unauthenticated
- tRPC context extracts session via `auth.api.getSession({ headers: await headers() })`

## Authorization

- **Family-scoped**: all data belongs to a family. `assertFamilyMember(familyId, userId)` in `auth-service.ts` verifies membership before any data access
- Family roles: `OWNER`, `ADMIN`, `MEMBER` — invite/remove permission checks compare role manually (OWNER/ADMIN only)
- tRPC `protectedProcedure` narrows context to include `user` (non-null), `publicProcedure` does not

## Audit logging

Every mutation writes to `audit_logs` via `writeAuditLog()` in `src/server/audit/write-audit.ts`. Event names are centralized in `src/server/audit/events.ts`. Records include before/after snapshots (JSON strings), actor, entity, source, and requestId.

## UI patterns

- **shadcn/ui** (`base-nova` style) built on **@base-ui/react** primitives (not Radix)
- Components use `render` prop pattern instead of `asChild` (e.g., `<Button render={<Link href="/..." />} />`)
- Dark mode is default (`<html lang="pt-BR" className="dark">`)
- Tailwind CSS v4 (PostCSS plugin, no tailwind.config file — uses CSS-first config in globals.css)
- Font: Inter with CSS variable `--font-sans`
- `cn()` utility from `src/lib/utils.ts` (clsx + tailwind-merge)
- Client pages use `"use client"` components (e.g., `DashboardClient`, `OnboardingClient`) while server pages handle auth/redirects

## Conventions

- **tRPC ONLY for new features** — no Next.js Route Handlers for domain logic (accounts, transactions, categories, family management)
- **Cache invalidation uses `useInvalidateQueries()`** from `src/hooks/use-invalidate-queries.ts` — tracks which query keys to invalidate per domain (accounts, categories, transactions)
- **Transactions paginated server-side** via `transactions.list` procedure with `page`, `pageSize`, `orderBy`, `orderDir`, `search`, `type`, `accountId`, `categoryId`, `dateFrom`, `dateTo`
- **Cache invalidation uses `useInvalidateQueries()`** from `src/hooks/use-invalidate-queries.ts` — tracks which query keys to invalidate per domain (accounts, categories, transactions)
- **Transactions paginated server-side** via `transactions.list` procedure with `page`, `pageSize`, `orderBy`, `orderDir`, `search`, `type`, `accountId`, `categoryId`, `dateFrom`, `dateTo`
- **ALL forms MUST use `useForm` from TanStack Form** (`@tanstack/react-form`) — never raw `useState` for form state
- **Frontend validation MUST reuse Zod schemas from `src/shared/schemas/`** via `.pick()` or `.extend()` — never duplicate validation rules in the component
- **ESLint max 500 lines per file** (skipBlankLines + skipComments) — enforced as error
- `@typescript-eslint/no-explicit-any` is an error
- Unused vars with `_` prefix are allowed
- Type inference from Zod schemas (`z.infer<typeof schema>`) and tRPC router (`RouterInputs`/`RouterOutputs` in `src/shared/types/api.ts`)
- No `any` — use proper types or Zod inference
- Page components follow split pattern: server page.tsx (auth, data fetching) + client ui.tsx (interactivity)
- **Notifications use `sonner`** (toast) — never inline error banners or `setMessage` state. Success/error toasts are shown by the dialog after the `onSubmit` promise resolves/rejects
- **Backend errors**: service functions throw errors; callers catch and show `toast.error()` with user-friendly message in pt-BR

## Environment variables

Required (see `.env.example`):

- `DATABASE_URL` — PostgreSQL connection string
- `BETTER_AUTH_SECRET` — Auth signing secret
- `BETTER_AUTH_URL` — App base URL for auth
- `NEXT_PUBLIC_APP_URL` — App base URL for client-side
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — Google OAuth
- `RESEND_API_KEY` — Resend email API key
- `RESEND_FROM_EMAIL` — Sender email address

## Gotchas

- **Dashboard page has a bug**: `src/app/dashboard/page.tsx` references `session.user.id` but `session` is never declared — it needs `getRequiredSession()` or `auth.api.getSession()` call (NOTE: this may have been fixed in the v2 refactor — verify)
- **E2E smoke test is stale**: `tests/e2e/smoke.spec.ts` looks for heading "Nossa Grana V2" but the actual heading is "Nossa Grana"
- The `src/modules/` directory exists but is sparsely populated (only `account-form.tsx` in accounts, `rules.test.ts` in transactions) — it's a planned but unfinished module structure
- `drizzle-orm` and `drizzle-kit` are both in `dependencies` (kit is needed at runtime for `db:migrate` in the Docker entrypoint)
- Drizzle config expects schema in `./src/server/db/*.ts`

SEMPRE usar a SKILL TLC para TODAS as atividades
