# Alaa - Three-Day Frontend Prompt Plan

Own Transactions, Budgets, and shared form/feedback components.
Income belongs to Nagham; expose reusable transaction interfaces for her.
Branch: `codex/alaa-transactions-budgets`.

## Instructions to paste before every prompt

```text
Work on the existing finora/client frontend.

Follow the BudgetMate specification:
C:/Users/molha/OneDrive/Desktop/MiniProject/BudgetMate - Yazan Shartouh.pdf

Use finora-template as the visual reference. Preserve Finora's branding,
layout, colors, typography, and spacing while meeting the PDF requirements.

Use React + TypeScript and Redux Toolkit. The NestJS server owns working
data in memory. Browser refresh must reload current data from the server.
Do not use localStorage as a substitute for backend persistence.

All CSS belongs in src/index.css, imported once from main.tsx.
Only Molham edits this stylesheet. Do not create other CSS files, CSS
modules, styled-components, or inline style objects.
Use shared CSS variables and documented component class names.
Use native progress elements where appropriate.

Only edit your assigned files. Request changes from the owner of shared
files. Preserve unrelated work and follow repository instructions.
Provide accessible controls and loading, empty, error, and pending states.

Do not add login, a database, cloud services, or paid APIs.
Only finish optional template features after the required application works.

Inspect existing code before editing. On completion, report changed files,
checks actually performed, and integration requests or remaining blockers.
Do not claim untested behavior is verified.
```

## Shared ownership and coordination

- **Molham:** application entry points, routing, layout, dashboard, About/Not Found, assets, configuration and dependencies, `types.ts`, `api.ts`, `store.ts`, `hooks.ts`, `selectors.ts`, and the only stylesheet, `index.css`.
- **Alaa:** all transaction and budget pages/components, `transactionsSlice.ts`, `budgetsSlice.ts`, `BudgetStatus.tsx`, `Modal.tsx`, `NotificationContext.tsx`, `ToastQueue.tsx`, `LoadingMessage.tsx`, `ErrorMessage.tsx`, and `EmptyState.tsx`.
- **Nagham:** Income and Monthly Report pages/components, `IncomeSources.tsx`, `CategoryBreakdown.tsx`, `MonthFilter.tsx`, and `ExportExcelButton.tsx`.
- Income uses Alaa's transaction slice, form, table, filters, and mutation operations. It does not have its own transaction store.
- Reports use Molham's shared selectors and Alaa's read-only budget components through agreed props.
- Nagham owns the reusable month filter; Alaa and Molham consume its agreed interface.
- Backend implementation belongs to the backend team. Missing endpoints, server validation, or server seed data must be coordinated with them.
- Other members submit class/style requirements to Molham; they never edit `index.css`.
- Merge completed work at checkpoints and update each feature branch before continuing.

## Global sequence

These step numbers are shared across all three member files.

| Day | Order |
| --- | --- |
| 1 | Molham 1 -> Molham 2 -> Alaa 3 / Nagham 4 / Molham 5 in parallel -> Molham 6 |
| 2 | Alaa 7 / Nagham 8 / Molham 9 in parallel -> Alaa 10 and Nagham 11 -> Molham 12 |
| 3 | Alaa 13 / Nagham 14 / Molham 15 in parallel -> core acceptance checkpoint -> Nagham 16 -> Alaa 17 -> Molham 18 |

Steps 10 and 11 can overlap, but Nagham's final report verification waits
for Alaa's budget API integration. Parallel tasks may use the stable
interfaces agreed in Step 1; actual integration waits for their
implementations to be merged.

The core acceptance checkpoint requires all required screens, business
rules, backend integration, and refresh behavior to work before export
and other optional finishing work begins.

## Day 1 - Transaction and budget structure

### Alaa - Step 3: Build transaction and budget UI

```text
Prerequisite: Molham's Steps 1 and 2 are merged.
Work in parallel with Steps 4 and 5.

Implement TransactionsPage, TransactionsSection, TransactionTable,
TransactionFilters, TransactionForm, and DeleteTransactionModal.
Provide newest-first rows, combined type/category/month controls, one
income/expense add-edit form, and delete confirmation.

Implement BudgetsPage, BudgetsSection, BudgetTable, BudgetForm, and
BudgetStatus. Show every expense category's budget, spent amount,
remaining/exceeded amount, usage percentage, and status, with set/edit/
remove actions for the selected month.

Create initial transactionsSlice.ts and budgetsSlice.ts state and agreed
exports early so Molham can wire the store.
Build Modal, NotificationContext, ToastQueue, LoadingMessage, ErrorMessage,
and EmptyState. Modal needs focus management, Escape, and focus restoration.

Use Nagham's agreed MonthFilter interface; coordinate its implementation.
Support a read-only BudgetTable mode for Nagham's report.
Expose reusable transaction components for her Income page.

Use props/fixtures temporarily without separate copies of live data.
Use documented CSS classes; send style requirements to Molham.
Do not edit index.css or build the Income page.
```

## Day 2 - Transactions, then budgets

### Alaa - Step 7: Connect transactions and enforce validation

```text
Prerequisite: Day 1 integration. Parallel with Steps 8 and 9.

Connect transactionsSlice.ts and transaction components to agreed API
helpers. Implement fetching, adding, editing, and deleting.
Update shared state from successful server responses and retain form
values on failures. Prevent repeated submissions while pending.

Validate required positive amounts with no more than two decimal places,
matching categories, and required valid dates no later than today.
Use the runtime date, never the template's fixed October 9, 2026 limit.

Display readable server validation, failure, outdated record, and
transaction-not-found messages.
Complete combined filters, newest-first ordering, clearing to full history,
and no-results feedback.

Confirm changes to amount, type, category, and month correctly update
shared state. Allow valid spending that exceeds a budget.

Expose these same mutation operations to Nagham's Income page.
Add focused validation and mutation tests.
Do not edit shared selectors, Income components, or index.css.
```

### Alaa - Step 10: Connect budgets and verify recalculation

```text
Prerequisite: Step 7 and shared selector/API contracts.
This step replaces your former Income task; Income belongs to Nagham.

Connect budgetsSlice.ts and budget components to the NestJS API.
Implement fetching, setting, updating, and removing budgets.

Require positive valid budget amounts and expense categories.
Enforce one budget per category/month with clearly defined update or
rejection behavior. Handle pending requests, failures, and refresh.

Use Molham's selectors for all values and statuses.
Test exactly 80%, exactly 100%, over 100%, and no budget.
Show the exceeded amount and count all unbudgeted expenses in totals.

Verify an expense edit, deletion, category change, or month change updates
affected budget rows. Removing a budget must not remove spending.

Provide read-only budget components for Nagham's monthly report.
Add focused mutation tests and notify Nagham when integration is ready.
Send CSS requests to Molham; do not modify his files.
```

## Day 3 - Required flow verification and finishing

### Alaa - Step 13: Test transactions and budgets end to end

```text
Parallel with Steps 14 and 15.

Verify PDF flows A, B, and C through the real frontend/backend:
- Add income and expense through the shared transaction form.
- Reject empty, zero, negative, nonnumeric, and overprecision amounts.
- Reject missing/nonexistent/mismatched categories and invalid/future dates.
- Combine filters and show empty results.
- Edit every relevant field and delete a transaction.
- Handle missing records, repeat submissions, and failed requests.
- Set, change, and remove monthly budgets.
- Reject invalid budget amounts and income-category budgets.
- Handle duplicate category/month saves without duplicate budgets.
- Check 80%, 100%, exceeded amounts, and no-budget categories.
- Verify successful changes remain correct after browser refresh.

Check affected dashboard/report totals with Molham and Nagham.
Fix your files and provide reproducible reports for other owners.

Prepare an English demonstration of transaction creation/correction,
one invalid case, and setting/exceeding a budget.
```

### Alaa - Step 17: Finish notifications and transaction export

```text
Prerequisite: Core acceptance passes and Nagham's Step 16 is merged.

Integrate ExportExcelButton into Transactions using the current filtered
rows. Nagham integrates the Income and Report pages herself.

Review NotificationContext and ToastQueue:
success follows confirmed operations, failures have clear messages,
multiple notifications are handled, and pending requests cannot produce
misleading success feedback.

Check both Transactions and Budgets for final Finora visual consistency.
Send final style requirements to Molham; do not edit index.css.

Rerun relevant checks and provide final integration notes.
```
