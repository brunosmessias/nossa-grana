# AGENTS.md

Brazilian family finance management app (Nossa Grana). UI is in Brazilian Portuguese (pt-BR).

## Commands

```bash
bun dev              # Start dev server
bun build            # Production build
bun lint             # ESLint (extends next/core-web-vitals + @typescript-eslint/recommended)
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

### Dual API pattern

The app has **two** API layers that coexist:

1. **tRPC** (`/api/trpc/[trpc]`) — used for the family router. Routers in `src/server/api/routers/`, composed in `src/server/api/root.ts`. Procedures use `publicProcedure` or `protectedProcedure` (auth middleware in `src/server/api/trpc.ts`).

2. **Next.js Route Handlers** (`/api/mvp/*`, `/api/family/*`) — used for the MVP CRUD routes. These are plain `route.ts` files using `NextResponse.json()`. They call `getRequiredSession()` directly and delegate to service functions.

When adding new endpoints, follow the existing pattern: if it's a tRPC router, add to `src/server/api/routers/` and register in `root.ts`. If it's a route handler, create the route file under `src/app/api/`.

### Layered server structure

```
Route handler / tRPC router
  → getRequiredSession() or protectedProcedure (auth guard)
  → Zod schema validation (schemas from src/shared/schemas/)
  → Service function (src/server/services/)
    → assertFamilyMember() — authorization check for family-scoped data
    → Drizzle DB operations (src/server/db/schema.ts)
    → writeAuditLog() — audit trail for mutations
```

### Path alias

`@/*` maps to `./src/*` (configured in tsconfig.json).

### Key directories

| Path                           | Purpose                                                                                                 |
| ------------------------------ | ------------------------------------------------------------------------------------------------------- |
| `src/app/`                     | Next.js App Router pages and API routes                                                                 |
| `src/app/api/mvp/`             | MVP CRUD route handlers (bootstrap, accounts, categories, transactions)                                 |
| `src/app/api/family/`          | Family management route handlers                                                                        |
| `src/app/api/trpc/`            | tRPC adapter                                                                                            |
| `src/app/api/auth/`            | better-auth catch-all handler                                                                           |
| `src/components/ui/`           | shadcn/ui components (base-nova style, built on @base-ui/react)                                         |
| `src/shared/schemas/`          | Zod validation schemas (shared between client and server)                                               |
| `src/shared/types/`            | Shared TypeScript types (tRPC router input/output inference)                                            |
| `src/server/db/schema.ts`      | Drizzle schema (app tables)                                                                             |
| `src/server/db/auth-schema.ts` | Drizzle schema (better-auth tables: user, session, account, verification)                               |
| `src/server/auth/`             | better-auth server config + client + session helper                                                     |
| `src/server/services/`         | Business logic (mvp-service.ts, family-service.ts)                                                      |
| `src/server/audit/`            | Audit log writing + event definitions                                                                   |
| `src/server/email/`            | Email sending (Resend) + templates                                                                      |
| `src/modules/`                 | Domain modules (accounts, transactions, budgets, goals, families, audit) — currently sparsely populated |
| `drizzle/`                     | Generated SQL migrations                                                                                |

## Database

- **PostgreSQL** via `postgres` driver, Drizzle ORM
- Schema split: `src/server/db/auth-schema.ts` (better-auth tables) and `src/server/db/schema.ts` (app tables)
- `schema.ts` re-exports auth tables so they can be imported from one place
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

- **Family-scoped**: all data belongs to a family. `assertFamilyMember(familyId, userId)` in mvp-service.ts verifies membership before any data access
- Family roles: `OWNER`, `ADMIN`, `MEMBER` — invite permission checks compare role manually (OWNER/ADMIN only)
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

- **ALL forms MUST use `useForm` from TanStack Form** (`@tanstack/react-form`) — never raw `useState` for form state
- **Frontend validation MUST reuse Zod schemas from `src/shared/schemas/`** via `.pick()` or `.extend()` — never duplicate validation rules in the component
- **ESLint max 500 lines per file** (skipBlankLines + skipComments) — enforced as error
- `@typescript-eslint/no-explicit-any` is an error
- Unused vars with `_` prefix are allowed
- Zod schemas live in `src/shared/schemas/` and are shared between client and server
- Type inference from Zod schemas (`z.infer<typeof schema>`) and tRPC router (`RouterInputs`/`RouterOutputs` in `src/shared/types/api.ts`)
- No `any` — use proper types or Zod inference
- Page components follow split pattern: server page.tsx (auth, data fetching) + client ui.tsx (interactivity)
- **Notifications use `sonner`** (toast) — never inline error banners or `setMessage` state. Success/error toasts are shown by the dialog after the `onSubmit` promise resolves/rejects
- **Backend errors**: service/route handlers throw errors; dialog catches and shows `toast.error()` with user-friendly message in pt-BR

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

- **Dashboard page has a bug**: `src/app/dashboard/page.tsx` references `session.user.id` but `session` is never declared — it needs `getRequiredSession()` or `auth.api.getSession()` call
- **E2E smoke test is stale**: `tests/e2e/smoke.spec.ts` looks for heading "Nossa Grana V2" but the actual heading is "Nossa Grana"
- **Dual API pattern**: new features must decide whether to use tRPC or route handlers. The MVP CRUD uses route handlers; family management uses tRPC. Don't mix within a feature
- The `src/modules/` directory exists but is mostly empty (only `account-form.tsx` in accounts, `rules.test.ts` in transactions) — it appears to be a planned but unfinished module structure
- `bun.lock` exists alongside `bun-workspace.yaml` — the project uses bun as the package manager
- Drizzle config expects schema in `./src/server/db/*.ts` (both schema.ts and auth-schema.ts)

SEMPRE usar a SKILL TLC para TODAS as atividades
