# Paid Status on Transactions Specification

## Problem Statement

The dashboard today shows a single "saldo do mês" (month balance) that is the sum of all transactions, regardless of whether money has actually moved. A user who creates a R$ 200 despesa on the 1st and has not yet paid it sees the same balance as if it were already paid. This makes it impossible to plan: the user cannot tell what is committed but unpaid vs. what has cleared.

We need to split balance into two numbers per month: **saldo planejado** (every transaction, paid or not) and **saldo real** (only paid). For new transactions, the user explicitly marks them as paid or pending. A quick toggle in the table lets the user flip the status without opening the dialog.

## Goals

- [ ] Every transaction has a `paid` boolean in the schema
- [ ] Existing transactions default to `paid = true` (no behavior change for current data)
- [ ] New transactions can be created as paid or pending via a checkbox in the form
- [ ] User can flip the status in-place from the table with a Checkbox in the first column, with optimistic update and loading state
- [ ] Dashboard header shows two balances: saldo planejado (all) and saldo real (paid only)
- [ ] Account balance reflects only paid transactions

## Out of Scope

| Feature                          | Reason                                                           |
| -------------------------------- | ---------------------------------------------------------------- |
| Date-of-payment field            | The check-off date is `transactionAt` for now; explicit paidAt is a later refinement |
| Filter table by paid status      | Nice to have; not in this phase                                  |
| Pending-only views               | Same as above                                                    |
| Auto-mark-as-paid on import      | Out of scope; user explicitly checks off imported transactions   |
| Notification when a pending tx is overdue | Different feature                                  |

---

## User Stories

### P1: Mark a new transaction as paid or pending ⭐ MVP

**User Story**: As a family member, I want to decide whether a new transaction is already paid or is a future commitment, so the dashboard shows the right balance for what I have actually done.

**Why P1**: The whole feature is meaningless if creation does not capture this state. Without it, every transaction is paid by default and the user has no way to say "I will pay this later."

**Acceptance Criteria**:
1. WHEN user opens the create transaction dialog THEN the system SHALL show a "Pago" checkbox, checked by default
2. WHEN user unchecks the box THEN the system SHALL set `paid = false` on submit and show the hint "Você poderá marcar como pago depois na tabela"
3. WHEN user creates a paid transaction THEN `paid` SHALL be `true` in the database
4. WHEN user creates a pending transaction THEN `paid` SHALL be `false` in the database
5. WHEN user opens the edit dialog of an existing transaction THEN the checkbox SHALL reflect the current `paid` value

**Independent Test**: Create one paid and one pending transaction with the same amount in the same month, verify they appear with different `paid` values in the database.

---

### P2: Toggle paid status quickly from the table ⭐ MVP

**User Story**: As a family member, I want to click a checkbox in the transaction table to mark it as paid or pending, so I don't have to open the dialog every time I pay a bill.

**Why P2**: Most pending transactions will be cleared in bulk (payday, bill payment day). Opening 5 dialogs is friction; a one-click toggle is the entire point of the feature.

**Acceptance Criteria**:
1. WHEN user views a table with transactions THEN the system SHALL show a Checkbox component in the first column of every row
2. WHEN the Checkbox is `checked` THEN the transaction's `paid` SHALL be `true`; when `unchecked` THEN `paid` SHALL be `false`
3. WHEN user clicks the Checkbox THEN the system SHALL call `transactions.update` with `{ paid: <new> }` only
4. WHILE the update is in flight THEN the row SHALL be visually disabled (opacity, pointer-events none) and the Checkbox SHALL show a loading indicator
5. WHEN the update fails THEN the system SHALL revert the Checkbox to its previous value and show an error toast
6. WHEN the update succeeds THEN the system SHALL NOT show a toast (silent mutation; balances update on the dashboard)
7. WHEN user clicks the Checkbox THEN the system SHALL NOT open the edit dialog (event must not propagate to the row)

**Independent Test**: Click the Checkbox on a pending row, verify the row reloads as paid, the account balance updates, and no edit dialog opens.

---

### P3: Two balances on the dashboard header ⭐ MVP

**User Story**: As a family member, I want to see both "saldo planejado" and "saldo real" in the dashboard header, so I know what is committed vs. what has actually moved this month.

**Why P3**: This is the user-visible payoff of the whole feature. Without it, the user has the new state in the database but no way to see the impact.

**Acceptance Criteria**:
1. WHEN the dashboard renders THEN the system SHALL show "Saldo real" (sum of paid INCOME minus sum of paid EXPENSE) and "Saldo planejado" (sum of all INCOME minus sum of all EXPENSE) in the header
2. WHEN a transaction's `paid` changes THEN both balances SHALL update without a full page reload
3. WHEN there are no pending transactions THEN saldo real SHALL equal saldo planejado
4. WHEN saldo real differs from saldo planejado THEN the header SHALL show a small hint of the difference (e.g. "Diferença: R$ X pendente")

**Independent Test**: Create one paid expense and one pending expense of the same amount, verify the header shows two different balances with the correct difference.

---

### P4: Account balance reflects paid only

**User Story**: As a family member, I want the account balance to reflect what has actually moved, so I don't see money I have not spent yet.

**Why P4**: Without this, a R$ 1000 account with a R$ 200 pending despesa still shows R$ 1000, which is misleading. The user explicitly stated this rule: pending does NOT debit the account.

**Acceptance Criteria**:
1. WHEN the account balance is calculated THEN the system SHALL sum only transactions with `paid = true`
2. WHEN a pending transaction is marked paid THEN the account balance SHALL decrease (for EXPENSE) or increase (for INCOME)
3. WHEN a paid transaction is marked pending THEN the account balance SHALL revert

**Independent Test**: Mark a pending despesa of R$ 200 as paid, verify the account balance drops by R$ 200 in the account list and header.

---

## Edge Cases

- WHEN user toggles paid status on a row that was just deleted in another tab THEN the update SHALL return not-found and the row SHALL disappear (cache invalidation)
- WHEN there are zero paid transactions in a month THEN saldo real SHALL be R$ 0
- WHEN toggling paid on the same row twice in quick succession THEN only the last state SHALL persist (request ordering by `updatedAt` or by the client)
- WHEN the user is a viewer (read-only) role THEN the Checkbox SHALL be disabled

## Requirement Traceability

| Requirement ID | Story                          | Phase   | Status  |
| -------------- | ------------------------------ | ------- | ------- |
| TXPAID-01      | P1: paid field in schema       | Design  | Pending |
| TXPAID-02      | P1: paid field in create form  | Design  | Pending |
| TXPAID-03      | P1: paid field in edit form    | Design  | Pending |
| TXPAID-04      | P2: checkbox in table          | Design  | Pending |
| TXPAID-05      | P2: optimistic update          | Design  | Pending |
| TXPAID-06      | P2: loading state per row      | Design  | Pending |
| TXPAID-07      | P3: two balances in header     | Design  | Pending |
| TXPAID-08      | P4: account balance uses paid  | Design  | Pending |

**Coverage:** 8 total, 0 mapped to tasks, 8 unmapped ⚠️

## Success Criteria

- [ ] A user can mark 5 pending bills as paid in under 30 seconds
- [ ] Saldo real and saldo planejado are visibly different when there are pending transactions
- [ ] Pending transactions do not affect account balance
- [ ] Audit log captures each paid/pending toggle
