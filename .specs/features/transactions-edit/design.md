# Edit Transaction Design

**Spec:** `.specs/features/transactions-edit/spec.md`
**Status:** Draft

---

## Architecture Overview

A pencil icon button in the rightmost column of every transaction row opens the **same** dialog currently used to create transactions, prefilled with that row's values. The parent owns the open/edit-target state, passes the existing transaction into the dialog, and switches the dialog's submit handler between `transactions.create` and `transactions.update` based on whether an `initialTransaction` was provided.

The backend, the audit logging, and the cache invalidation are all already in place. The work is almost entirely front-end wiring that surfaces what the API already supports.

Three places need to change:

1. The dashboard's create-only `TransactionDialog` becomes mode-aware (create or edit) by accepting an optional `initialTransaction` prop and a second `onSubmit` shape that carries a `transactionId`.
2. The dashboard's `MonthlyView` (Despesas / Receitas tables) gains a rightmost action column with a pencil button and an `onEdit` callback prop.
3. The full transactions page (`/dashboard/transacoes`) — which already has a working `TxFormDialog` with `mode: "edit"` — gets an explicit `Pencil` button on each row next to the existing `Trash2` button, so the affordance is visible (the spec's P2) instead of relying on the implicit "click the whole row" behavior.

The audit log story is a non-event: `transactionService.updateTransaction` (`src/server/services/transaction-service.ts:142`) already calls `writeAuditLog({ event: "transaction.updated", before: current, after: ... })` for every successful update. No new server code is required.

```mermaid
graph TD
    User[User clicks pencil on a row]
    Pencil[Pencil icon button in row]
    Parent[Parent component: dashboard/ui.tsx or transacoes/ui.tsx]
    State[editingTx: Transaction | null]
    Dialog[TransactionDialog: same component, edit mode]
    MutUpdate[api.transactions.update.useMutation]
    Service[transactionService.updateTransaction]
    Audit[(audit_logs: before / after)]
    Cache[useInvalidateQueries scope=transactions,accounts]
    Toast[toast.success / toast.error]

    User --> Pencil
    Pencil -->|onEdit(tx)| Parent
    Parent -->|setEditingTx(tx); setTxDialogOpen(true)| State
    State -->|initialTransaction = tx| Dialog
    Dialog -->|onSubmit| MutUpdate
    MutUpdate -->|familyId, transactionId, ...rest| Service
    Service -->|writeAuditLog before/after| Audit
    MutUpdate -.success.-> Parent
    Parent -->|invalidate| Cache
    Parent -->|toast.success| Toast
    MutUpdate -.error.-> Dialog
    Dialog -.error.->|keep open, show toast.error| Toast
```

---

## Code Reuse Analysis

### Existing Components to Leverage

| Component                              | Location                                                          | How to Use                                                                              |
| -------------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `TransactionDialog`                    | `src/app/dashboard/transaction-dialog.tsx`                        | **Extend** with optional `initialTransaction` + `onUpdate` props; same component, edit mode |
| `MonthlyView` / `TransactionSection`   | `src/app/dashboard/monthly-view.tsx`                              | **Modify** to add a rightmost "Ações" column with a `Pencil` button and an `onEdit` prop |
| `TxFormDialog` (already edit-capable)  | `src/app/dashboard/transacoes/ui.tsx:56-121`                      | **Reuse as-is** for the full transactions page; only `TxRow` needs a new button         |
| `transactions.update` procedure        | `src/server/api/routers/transactions.ts:36-39`                    | **Reuse** — already wired with `updateTransactionSchema`                                |
| `transactionService.updateTransaction` | `src/server/services/transaction-service.ts:142-190`              | **Reuse** — already calls `writeAuditLog` with before/after; no change                 |
| `useInvalidateQueries`                 | `src/hooks/use-invalidate-queries.ts`                             | **Reuse** — call with `["transactions", "accounts"]` after a successful update         |
| `toast` (sonner)                       | `@/components/ui/sonner`                                          | **Reuse** — `toast.success("Transação atualizada")` on success, `toast.error(...)` on failure |
| `Pencil` icon                          | `lucide-react`                                                    | **Reuse** for the row affordance                                                        |
| `createTransactionSchema`              | `src/shared/schemas/transaction.ts`                               | **Reuse** — same Zod rules apply to edit (no extra validation needed)                    |
| `updateTransactionSchema`              | `src/shared/schemas/transaction.ts`                               | **Reuse** — defines the wire shape sent to the update mutation                          |
| `<Button variant="ghost" size="icon-*">` | `@/components/ui/button`                                        | **Reuse** — same shape used by the existing trash button on the full page              |

### Integration Points

| System             | Integration Method                                                                                          |
| ------------------ | ----------------------------------------------------------------------------------------------------------- |
| tRPC router        | No change. `transactions.update` already accepts `familyId`, `transactionId`, and the four editable fields  |
| Drizzle schema     | No change. `transactions` table already has all five editable columns                                      |
| Audit log          | No change. `writeAuditLog({ event: "transaction.updated", before, after, ... })` is already invoked          |
| Cache invalidation | Use `useInvalidateQueries` with `["transactions", "accounts"]` after a successful update — matches the existing create flow at `src/app/dashboard/ui.tsx:213-216` |
| Authorization      | `assertFamilyMember(familyId, userId)` is already called inside `updateTransaction`; no client-side change  |

---

## Components

### TransactionDialog (extended)

- **Purpose**: Render a single dialog for both creating a new transaction and editing an existing one. The same component, the same Zod rules, the same fields — only the title, the submit handler, and the initial state differ.
- **Location**: `src/app/dashboard/transaction-dialog.tsx` (modify)
- **Interfaces** (new props, all optional):
  - `initialTransaction?: Transaction | null` — when present, the dialog opens in edit mode, prefills the form, and the submit button reads "Salvar" instead of "Criar".
  - `onUpdate?: (data: { transactionId: string; accountId: string; categoryId: string; type: "INCOME" | "EXPENSE"; description: string; amountCents: number; transactionAt: string }) => Promise<void>` — invoked instead of `onSubmit` when in edit mode.
- **Dependencies**: existing `useEffect` that resets the form on `open`; existing `clientSchema` (Zod pick) for validation
- **Reuses**: all existing internal state, the same Select / CurrencyInput / Input / Label / Dialog primitives

Behavior:
- The existing reset `useEffect` (`useEffect(() => { if (open) { ... } }, [open])`) is extended to prefill from `initialTransaction` when it is truthy and `open` flips to `true`.
- The submit handler branches: if `initialTransaction` is present, call `onUpdate(...)`; otherwise call `onSubmit(...)`.
- The title and the submit-button label switch based on `mode = initialTransaction ? "edit" : "create"`.
- The dialog also has to expose the **account** field when in edit mode. The current dialog picks `defaultAccountId` from a `CHECKING` account fallback, which is correct for create but wrong for edit (the existing transaction may live on a `SAVINGS` account). When `initialTransaction` is present, the account id prefills from the existing row and the dialog must show an account `<Select>`. See "Tech Decisions" below for the chosen approach.

### MonthlyView (extended)

- **Purpose**: Render the Despesas and Renda tables on the dashboard, including a new action column with a pencil button on every row.
- **Location**: `src/app/dashboard/monthly-view.tsx` (modify)
- **Interfaces** (new prop):
  - `onEditTransaction?: (tx: Transaction) => void` — optional, called when the user clicks the pencil button on a row. If not provided, the pencil button is hidden (so existing call sites that don't pass it are unaffected).
- **Dependencies**: `Pencil` from `lucide-react`; `<Button variant="ghost" size="icon-xs">` for visual parity with the trash button on the full page
- **Reuses**: existing `TransactionSection` shape, existing `categoryMap` lookup

Behavior:
- The `TransactionSection` component (private to this file) gets the same `onEdit` prop and renders a 5th `<TableHead>` ("") plus a new `<TableCell>` per row containing the `<Button>` with `<Pencil />`.
- Hover affordance: per the spec, the button is visible on hover. We use Tailwind `opacity-0 group-hover:opacity-100` on the cell and `group` on the `<TableRow>`, with `focus-within:opacity-100` so keyboard users still see it.
- The button calls `e.stopPropagation()` then `onEdit(tx)`. (The dashboard month tables don't make the whole row clickable today, so `stopPropagation` is just defensive.)

### dashboard/ui.tsx (extended)

- **Purpose**: Own the "edit transaction" open state at the dashboard root, pass `onEdit` down to `MonthlyView`, and provide the update handler.
- **Location**: `src/app/dashboard/ui.tsx` (modify)
- **Interfaces** (new local state):
  - `editingTx: Transaction | null` — the row the user clicked; `null` means "create mode".
  - Derived `txDialogMode: "create" | "edit"` = `editingTx ? "edit" : "create"`.
- **Dependencies**: existing `useInvalidateQueries`; existing `api.transactions.update` (added as a mutation in this file)
- **Reuses**: existing `txDialogOpen` / `txDialogType` state pattern; existing `createTransactionMutation` shape (the update mutation mirrors it)

Behavior:
- New handler `handleUpdateTransaction(data)` calls `updateMutation.mutateAsync({ familyId, transactionId: editingTx.id, ...data })`, on success invalidates `["transactions", "accounts"]` and shows a success toast. The dialog's own success handler closes the dialog; we mirror what `createTransactionMutation` does on success.
- `openTxDialog` stays as is for the create flow. A new `openEditDialog(tx: Transaction)` sets `editingTx` and `setTxDialogOpen(true)`. We do **not** need a separate "edit dialog" instance — the same `<TransactionDialog>` is reused.
- `<MonthlyView>` receives `onEditTransaction={openEditDialog}`.
- The `<TransactionDialog>` instance gets `initialTransaction={editingTx}` and `onUpdate={handleUpdateTransaction}`.

### transacoes/ui.tsx — TxRow (small extension)

- **Purpose**: Add a visible pencil button on the full transactions page row, next to the trash button, so the edit affordance is discoverable without the user having to know the whole row is clickable.
- **Location**: `src/app/dashboard/transacoes/ui.tsx` (modify the `TxRow` component, ~line 156)
- **Interfaces**: no prop changes — `onEdit` already exists.
- **Dependencies**: `Pencil` from `lucide-react`
- **Reuses**: existing `onEdit` prop, existing `<Button variant="ghost" size="icon-xs">` shape (matches the trash button)

Behavior:
- Add a `<Button variant="ghost" size="icon-xs" aria-label="Editar transação" onClick={(e) => { e.stopPropagation(); onEdit(tx) }}><Pencil className="size-3 text-muted-foreground" /></Button>` as the first button in the actions cell.
- The `colSpan` of the empty-state row and the group-header row already use `colSpan={7}`; they stay at 7 since the new column just slots into the existing actions cell — no header re-count needed.
- No new state, no new mutation, no new server call. This task is **purely cosmetic** on top of an already-working flow.

### Data flow for a dashboard edit

```
Row pencil click
  → MonthlyView.onEditTransaction(tx)
  → dashboard/ui.tsx: openEditDialog(tx)
  → editingTx = tx; setTxDialogOpen(true)
  → TransactionDialog receives initialTransaction = tx
  → useEffect on [open] prefills state from initialTransaction
  → user edits and clicks "Salvar"
  → TransactionDialog.submit calls onUpdate(data)  ← this.props.onUpdate
  → dashboard/ui.tsx: handleUpdateTransaction
  → updateMutation.mutateAsync({ familyId, transactionId: tx.id, ...data })
  → transactions.update procedure → updateTransaction service
  → writeAuditLog({ event: "transaction.updated", before: current, after: ... })
  → on success: invalidate(["transactions","accounts"]); toast.success("Transação atualizada"); close dialog
  → on error: toast.error("Não foi possível atualizar."); dialog stays open with user values
```

---

## Data Models (if applicable)

No schema change. The `Transaction` row type used by `MonthlyView` (defined inline at `src/app/dashboard/monthly-view.tsx:26-33`) gains one mental field (`accountId`) for the edit prefill, but that field is already in the `Transaction` type on the full page (`src/app/dashboard/transacoes/ui.tsx:24`); the dashboard type can be widened to match so the same `Transaction` shape flows through both surfaces.

Suggested widening (informational; not a design change):

```typescript
type Transaction = {
  id: string
  description: string
  type: "INCOME" | "EXPENSE"
  amountCents: number
  transactionAt: string
  categoryId: string | null
  accountId: string   // <-- add for the edit prefill
}
```

In practice the new column on the dashboard will be empty in the existing `MonthlyView` mapping because `transactions.listAll` (used by the dashboard) currently selects only the columns the dashboard renders. The first design iteration is to **not** change the dashboard query — the account field is read from `editingTx.accountId` (which is already returned by the list query, just unused). If the API doesn't return it, we add a small server-side include. The actual decision is in the "Tech Decisions" table.

---

## Error Handling Strategy

| Error Scenario                                                | Handling                                                                                              | User Impact                                                                                |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Update fails for any reason (network, validation, 5xx)        | `try/catch` around `mutateAsync`; `toast.error("Não foi possível atualizar.")`; dialog stays open       | User sees error toast; their changes are kept in the form; can retry                        |
| Row was already deleted in another tab                        | `updateTransaction` throws `"Transação não encontrada"`; same catch path → toast.error + dialog open  | Same as above; the table will refresh on the next invalidation and the row will disappear  |
| User changes `accountId` to an account in another family      | `assertFamilyMember` inside `updateTransaction` rejects with `TRPCError`; same catch path            | User sees a generic error toast (no leak about family boundaries)                          |
| Edit the only row in a month                                  | `useInvalidateQueries(["transactions"])` triggers `transactions.listAll` to refetch; the dashboard's "empty month" branch re-evaluates | The empty-month + import-available card appears, same as if the row had always been absent |
| Audit log write fails                                         | tRPC mutation is already past the audit write by the time it returns (the service writes then returns); if the audit write throws, the mutation propagates the error and we fall into the same catch path | User sees an error toast; the DB update may or may not have committed. Acceptable for v1.   |
| Open edit dialog for a row, then row is deleted, then save    | Same as "row was already deleted" — service throws, toast shows, dialog stays open until user dismisses | Acceptable; the row vanishes on the next list refresh, but the user explicitly cancelled the edit by closing the dialog |

---

## Tech Decisions

| Decision                                                                                                  | Choice                                                                                                       | Rationale                                                                                                                              |
| --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| Where the edit-mode dialog lives                                                                          | Extend the existing `TransactionDialog` in `src/app/dashboard/transaction-dialog.tsx` with optional `initialTransaction` + `onUpdate` props | The spec says "Edit reuses the same dialog as create". One component, two modes — exactly what `TxFormDialog` already does on the full page, and what minimizes new code |
| How the account field appears in edit mode                                                                | Always show the account `<Select>` in the dialog, prefill it from `initialTransaction.accountId`, fall back to the existing CHECKING-account heuristic | Today the dialog picks an account automatically. For create that is fine; for edit it would silently change the user's account. Always-show + prefill is the only correct behavior |
| Pre-existing TanStack Form rule violation in `transaction-dialog.tsx`                                    | **Do not** migrate in this PR. Flag as a follow-up concern. The edit path uses the same `useState` model as create | AGENTS.md says "ALL forms MUST use useForm". This dialog violates it today. Migrating it is a separate concern; doing it in this PR would expand scope, grow the diff, and risk a regression in the create flow. The follow-up is a one-line entry in `STATE.md` |
| Where the pencil button lives in the dashboard month tables                                               | New rightmost column, "Ações", in `TransactionSection`. Visible on row hover (`opacity-0 group-hover:opacity-100 focus-within:opacity-100`) | Spec calls for hover-revealed pencil in the rightmost column. Keyboard users still see it on focus. Matches the visual weight of the trash button on the full page |
| How the full page row gains a pencil button                                                              | Add a `<Pencil>` button to the existing actions cell in `TxRow`, next to `<Trash2>`. No new state, no new mutation. The form/mutation/cache path already exists. | The full page already has a complete edit flow (`TxFormDialog` with `mode: "edit"`, calling `transactions.update`, invalidating correctly). Spec P2 is just about discoverability — the pencil icon provides it. The whole-row click is preserved as a power-user shortcut |
| How cache invalidation runs after a successful update                                                     | `await invalidate(["transactions", "accounts"])` from the parent, mirroring `createTransactionMutation.onSuccess` at `src/app/dashboard/ui.tsx:213-216` | `useInvalidateQueries(["transactions"])` invalidates **both** `transactions.list` and `transactions.listAll` (per `src/hooks/use-invalidate-queries.ts:18-21`). So an edit from the full page or from the dashboard refreshes both surfaces — the P2 acceptance criterion "dashboard reflects the change without manual refresh" is met for free |
| How the dashboard `Transaction` type learns about `accountId`                                             | Widen the inline `Transaction` type in `monthly-view.tsx:26-33` to include `accountId`; verify that `transactions.listAll` returns it | If `listAll` does not return `accountId`, switch the dashboard's transaction fetch to `transactions.list` with the current month range (as the table-sorting feature does) — but that is a separate refactor and **not** part of this PR. If `listAll` already returns `accountId` (the schema column exists; the question is whether the service includes it in the select), we just use it as-is |
| What the success and error toasts say                                                                    | `toast.success("Transação atualizada")` and `toast.error("Não foi possível atualizar.")` (pt-BR)            | Mirrors the wording already used by `TxFormDialog` on the full page (`src/app/dashboard/transacoes/ui.tsx:94, 100`). Consistency over creativity |
| Whether to add `aria-label` on the pencil button                                                          | Yes — `aria-label="Editar transação"`                                                                          | The full page already gives the trash button a visible icon and a destructive intent label; the pencil deserves the same a11y care |
| What happens to the dashboard's "empty month" + import card when an edit removes the last row             | Nothing special — the existing `useEffect` that computes `availableMonths` runs on the next `transactions.listAll` refetch, and the empty-month branch re-evaluates. This is the same path that runs after a delete. | Matches edge case #1 from the spec                                                                                                     |

---

## Out-of-scope design (for clarity)

- **Migrating `TransactionDialog` to TanStack Form** — pre-existing AGENTS.md violation, separate concern, will be tracked in `STATE.md` as a follow-up.
- **Inline cell editing** — explicitly out of scope per the spec.
- **Bulk edit** — out of scope per the spec.
- **Edit history viewer** — out of scope per the spec. The audit log row is already written.
- **Optimistic update** — `useInvalidateQueries` runs on success; on a slow connection the row appears stale for ~1s. This matches the existing create flow and is fine for v1.
- **Confirm-on-close when there are unsaved changes** — not in the spec, the current create flow has no such prompt either. Don't add it.
