# Month Selector and Empty-Import Behavior Specification

## Problem Statement

Two related bugs in the monthly flow:

1. The month selector appears to skip months that have no transactions. A user navigating from April (has data) lands on June, with May nowhere to be seen. This happens because the dashboard query for the previous month is used to gate the "import" card, and the absence of data cascades into a confusing UX. The selector itself is a month input, so the skip is virtual, not real — but the import flow misleads the user into thinking May was empty.

2. When the user is on an empty month and the *previous calendar* month is also empty, the "Importar do mês anterior" card shows nothing useful. Today the card silently does not render, which is correct UX but the gating logic is fragile and undocumented.

The fix has two pieces: the month selector must let the user visit any month (one month at a time, no implicit jumping), and the import flow must only surface when there is something to import from the immediately previous month, with a clear message otherwise.

## Goals

- [x] User can navigate to any month in the past or future, one month at a time, with no implicit skipping
- [x] "Importar do mês anterior" card appears only when the previous calendar month has at least one transaction
- [x] When the user clicks the import CTA on an empty month whose previous month is also empty, the system shows a clear message instead of opening an empty dialog

## Out of Scope

| Feature                                | Reason                                                                |
| -------------------------------------- | --------------------------------------------------------------------- |
| Smart "import from last month with data" | The user explicitly wants the previous calendar month, not the last non-empty one |
| Bulk import across multiple months     | Different feature                                                      |
| Calendar picker with a heatmap         | Out of scope; current month input is sufficient                       |
| Skip to today button                   | Minor UX add-on; not part of this spec                                |

---

## User Stories

### P1: Month selector visits every month ⭐ MVP

**User Story**: As a family member, I want to step through months one at a time without the app hiding empty months, so I can register or check a transaction in any month without confusion.

**Why P1**: This is the entry point to the monthly flow. If the selector lies, every other fix is moot.

**Acceptance Criteria**:
1. WHEN user clicks the next-month arrow on the selector THEN the system SHALL advance to the next calendar month, even if it is empty
2. WHEN user clicks the previous-month arrow THEN the system SHALL go back to the previous calendar month, even if it is empty
3. WHEN the user is on a month that has zero transactions THEN the dashboard SHALL render the standard "empty month" state (with the import card if applicable), not hide the month
4. WHEN the user types a month directly in the input THEN the system SHALL jump to that month, with no implicit skip

**Independent Test**: With April having data, May empty, and June having data, navigate April → May → June with the arrows. Each month must render with its actual state (April with data, May with empty card, June with data).

---

### P2: Import CTA only on a real previous month ⭐ MVP

**User Story**: As a family member, I want the "Importar do mês anterior" card to only show up when the previous month has transactions, so I am not offered an empty import.

**Why P2**: A card that opens a dialog with zero rows is worse than no card. This is the fix for the original bug.

**Acceptance Criteria**:
1. WHEN the user is on month M and M-1 has zero transactions THEN the system SHALL NOT render the "Importar do mês anterior" card
2. WHEN M-1 has at least one transaction THEN the system SHALL render the card with a button that opens the existing batch import dialog prefilled with M-1's transactions
3. WHEN the user clicks the button on a month whose M-1 became empty (e.g. another tab) THEN the system SHALL show toast "Sem transações no mês anterior para importar" and not open an empty dialog

**Independent Test**: Delete all transactions of May, navigate to June, verify no import card is shown. Re-add one transaction to May, navigate to June, verify the card is back.

---

## Edge Cases

- WHEN the user is on the very first month of the family history (e.g. March 2024) and February is before the family was created THEN the import card SHALL not show, regardless of `previousMonthTransactions`
- WHEN the user is on the current month and it is empty but the previous month has data THEN the import card SHALL show and import goes to the previous month, not "next month"
- WHEN the user changes account or family in the same session THEN the month selector state SHALL reset to the current month for the new family
- WHEN timezone differs between the client and the database THEN the month boundary SHALL use the database's `transactionAt` (UTC) for filtering and the client's local month for display

## Requirement Traceability

| Requirement ID | Story                            | Phase   | Status  |
| -------------- | -------------------------------- | ------- | ------- |
| MONTH-01       | P1: selector visits every month  | Design  | Done    |
| MONTH-02       | P1: empty month renders explicitly | Design | Done    |
| MONTH-03       | P2: import card gated by M-1 data | Design | Done    |
| MONTH-04       | P2: empty M-1 shows toast        | Design  | Done    |

**Coverage:** 4 total, 4 done ✅

## Success Criteria

- [x] User can step from April to June and see May in between
- [x] Import card never opens an empty dialog
- [x] No regression in the existing batch import happy path (M has data from M-1)
