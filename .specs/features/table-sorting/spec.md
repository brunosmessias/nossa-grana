# Table Sorting Specification

## Problem Statement

The dashboard shows transactions in two tables (Despesas / Receitas) plus a full transactions page at `/dashboard/transacoes`. Today, the only way to find a transaction by amount or by description is to scan visually. The full page does support `orderBy`/`orderDir` on the `transactions.list` tRPC procedure, but the UI does not expose it: there is no clickable header, no visual indicator, and the `listAll` procedure used by the dashboard does not accept sort parameters at all.

We need clickable column headers that send `orderBy` + `orderDir` to the server, so pagination and totals stay consistent. Server-side sorting is non-negotiable because the page is paginated.

## Goals

- [x] Click any sortable column header to sort ascending, click again to sort descending, click a third time on another column to switch
- [x] Sort is server-side: the tRPC procedure receives `orderBy` and `orderDir` and returns the sorted, paginated result
- [x] The active column shows an arrow indicator (up or down)
- [x] Sort works in dashboard tables (Despesas, Receitas) and on the full transactions page
- [x] Sort defaults to a sensible value (transactionAt desc) on first load

## Out of Scope

| Feature                          | Reason                                                            |
| -------------------------------- | ----------------------------------------------------------------- |
| Multi-column sort                | Not in this phase                                                 |
| Persisted sort per user          | Stored sorts are a separate feature                              |
| Sort by category name (joined)   | Requires join in the orderBy clause; would need an index         |
| Sort by account name (joined)    | Same as above                                                     |
| Sort on the contas (accounts) page | Accounts list is short and ordered alphabetically; not in scope |

---

## User Stories

### P1: Sortable column header on the dashboard tables ⭐ MVP

**User Story**: As a family member, I want to click a column header in the Despesas or Receitas table to sort by that column, so I can find a transaction by amount or by date without scrolling.

**Why P1**: The dashboard is the main view. Without sort there, the feature is invisible.

**Acceptance Criteria**:
1. WHEN user views a dashboard table THEN sortable column headers (Data, Descrição, Valor) SHALL show a hover state and a sort affordance
2. WHEN user clicks a sortable header THEN the system SHALL call `transactions.list` (or a dashboard-specific list procedure) with the new `orderBy` and `orderDir`
3. WHEN the result returns THEN the system SHALL render the rows in the new order, with an arrow icon (▲ or ▼) on the active column
4. WHEN user clicks the same header twice THEN the system SHALL toggle between `asc` and `desc`
5. WHEN user clicks a different sortable header THEN the system SHALL switch `orderBy` and reset `orderDir` to `desc` (newest / largest first)
6. WHEN no transactions are returned THEN the empty state SHALL render as today; sort state SHALL reset to the default

**Independent Test**: Create 5 transactions with different dates, descriptions, and amounts. Click "Valor" header twice and verify rows are sorted ascending then descending with the correct arrow.

---

### P2: Sortable column header on the full transactions page ⭐ MVP

**User Story**: As a family member, I want sortable headers on `/dashboard/transacoes`, so I can use sort together with filters and search to narrow down large lists.

**Why P2**: This page is the search surface; filters without sort are limited. The procedure already supports `orderBy` and `orderDir`, so the gap is purely UI.

**Acceptance Criteria**:
1. WHEN user views `/dashboard/transacoes` THEN the table headers SHALL be sortable as in P1
2. WHEN user clicks a header THEN the system SHALL call `transactions.list` with the new sort
3. WHEN pagination is active THEN changing sort SHALL reset `page` to 1
4. WHEN user navigates away and comes back THEN the sort state MAY reset to the default (acceptable; persisted sort is out of scope)

**Independent Test**: With 30+ transactions spread over 2 pages, sort by "Valor" desc and verify the highest amounts are on page 1.

---

### P3: Dashboard-level list procedure supports sort ⭐ MVP

**User Story**: As a developer, I want the dashboard's transactions list procedure to accept `orderBy` and `orderDir`, so the dashboard can sort the same way the full page does.

**Why P3**: The dashboard currently uses a different procedure (`listAll` or a dedicated monthly query) without sort. Without this, P1 has no server to call.

**Acceptance Criteria**:
1. WHEN the dashboard fetches its transactions THEN the system SHALL call a procedure that accepts `orderBy` and `orderDir`
2. WHEN `orderBy` is `transactionAt`/`amountCents`/`description` THEN the procedure SHALL generate a SQL `ORDER BY` clause with the matching column
3. WHEN `orderDir` is `asc`/`desc` THEN the procedure SHALL append `ASC`/`DESC`
4. WHEN the family has zero transactions THEN the procedure SHALL return an empty array, not error

**Independent Test**: Hit the procedure with `orderBy=amountCents&orderDir=desc` and verify the first row has the largest `amountCents` for the family.

---

## Edge Cases

- WHEN `orderBy` is missing or invalid THEN the procedure SHALL fall back to `transactionAt` and log a warning
- WHEN `orderDir` is missing or invalid THEN the procedure SHALL fall back to `desc`
- WHEN a column is currently sorted and the user changes the month THEN the sort SHALL persist (UX expectation: sort is a property of the list, not the month)
- WHEN the user toggles sort rapidly (e.g. spamming a header) THEN only the last request SHALL take effect (cancel in-flight queries)
- WHEN the family has only one transaction THEN sorting SHALL be a no-op and the header arrow SHALL still show

## Requirement Traceability

| Requirement ID | Story                            | Phase   | Status  |
| -------------- | -------------------------------- | ------- | ------- |
| SORT-01        | P1: dashboard header clickable   | Done    | Done    |
| SORT-02        | P1: sort indicator               | Done    | Done    |
| SORT-03        | P2: full page header clickable   | Done    | Done    |
| SORT-04        | P2: sort resets page             | Done    | Done    |
| SORT-05        | P3: procedure accepts orderBy    | Done    | Done    |
| SORT-06        | P3: procedure accepts orderDir   | Done    | Done    |
| SORT-07        | All: cancel in-flight on rapid click | Done | Done    |

**Coverage:** 7 total, 7 mapped to done ✅

## Success Criteria

- [x] User can sort any dashboard table by data, descrição, or valor with one click
- [x] Sort is consistent with pagination (sorted page is a slice of the sorted full list)
- [x] Default sort is transactionAt desc on first load
- [x] No regression in the empty / single-row cases
