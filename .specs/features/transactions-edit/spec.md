# Edit Transaction Specification

## Problem Statement

The dashboard renders transactions in two side-by-side tables (Despesas / Receitas). The user can read each row but cannot fix a typo, change the amount, move the transaction to a different account, or update its date. Today, an error requires deleting and re-creating the row, which is destructive and breaks the audit history. There is already a `transactions.update` tRPC procedure, a `updateTransactionSchema`, and a `TransactionDialog` component, but the front end never wires them together as an edit flow.

## Goals

- [ ] User can edit any transaction from any table it appears in
- [ ] Edit reuses the same dialog as create, prefilled with the current values
- [ ] Edit is non-destructive: original row is updated, audit log captures before/after
- [ ] No regression in the create flow or in batch import

## Out of Scope

| Feature                                  | Reason                                                              |
| ---------------------------------------- | ------------------------------------------------------------------- |
| Inline cell editing                      | UX is messier than a dialog; would need to replicate Zod validation |
| Bulk edit (change category for many at once) | Different feature, requires multi-select first                    |
| Undo / soft delete via edit              | Out of scope; user can delete then re-create if needed              |
| Edit history viewer                      | Audit log already records before/after; no UI for it in this phase  |

---

## User Stories

### P1: Edit transaction from a table row ⭐ MVP

**User Story**: As a family member, I want to click a pencil icon on a transaction row and edit any field, so I can fix mistakes without re-entering the whole transaction.

**Why P1**: The most common data entry operation in a finance app is correction. Without it, the app is read-only after the first day.

**Acceptance Criteria**:
1. WHEN user hovers a row in the dashboard transaction table THEN the system SHALL show a pencil icon button in the rightmost column
2. WHEN user clicks the pencil icon THEN the system SHALL open the existing `TransactionDialog` in edit mode, prefilled with the row's current values
3. WHEN user changes any field and confirms THEN the system SHALL call `transactions.update` and refresh the table
4. WHEN update succeeds THEN the system SHALL close the dialog and show a success toast
5. WHEN update fails THEN the system SHALL show an error toast and keep the dialog open with the user's values
6. WHEN audit logging is enabled THEN the system SHALL record the change in `audit_logs` with before/after snapshots

**Independent Test**: Create a transaction, click the pencil, change the amount, confirm, verify the new value is in the table and an audit log row exists with the diff.

---

### P2: Edit from the full transactions page

**User Story**: As a family member, I want the same edit affordance on the `/dashboard/transacoes` full page, so I don't have to switch to the monthly dashboard to fix a transaction discovered while filtering.

**Why P2**: The full page is the discovery surface (search/filter). Forcing a switch to the dashboard breaks flow.

**Acceptance Criteria**:
1. WHEN user views `/dashboard/transacoes` THEN the system SHALL show the same pencil icon in the actions column of every row
2. WHEN user edits a transaction from the full page THEN the system SHALL invalidate both `transactions` and the monthly dashboard query so the dashboard reflects the change

**Independent Test**: Edit a row from `/dashboard/transacoes`, navigate to the dashboard month view, verify the change is visible without manual refresh.

---

## Edge Cases

- WHEN user edits a transaction that is the only row in a month THEN the dashboard's "empty month + import available" state SHALL re-evaluate correctly
- WHEN user changes `accountId` to an account in another family (via tampered request) THEN the service SHALL reject the request via `assertFamilyMember`
- WHEN user edits and the row was already deleted in another tab THEN the update SHALL return a not-found error and the dialog SHALL close with an error toast
- WHEN the dialog is in edit mode and the user clicks the trash icon (delete) THEN the system SHALL delete the transaction and close the dialog

## Requirement Traceability

| Requirement ID | Story                  | Phase   | Status  |
| -------------- | ---------------------- | ------- | ------- |
| TXEDIT-01      | P1: edit from row      | Design  | Pending |
| TXEDIT-02      | P1: audit log          | Design  | Pending |
| TXEDIT-03      | P2: edit from full page | Design  | Pending |

**Coverage:** 3 total, 0 mapped to tasks, 3 unmapped ⚠️

## Success Criteria

- [ ] A user can edit any transaction in two clicks (pencil + save)
- [ ] Zero regressions in the create flow (create dialog still works for new rows)
- [ ] Audit log captures the edit with before/after
