# Nagham - Three-Day Frontend Prompt Plan

Own Income, Monthly Report, month filtering, and Excel export.
Budgets belongs to Alaa; consume his read-only components for reports.
Branch: `codex/nagham-income-reports`.

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

## Day 1 - Income and report structure

### Nagham - Step 4: Build Income and Monthly Report UI

```text
Prerequisite: Molham's Steps 1 and 2 are merged.
Work in parallel with Steps 3 and 5.

Implement IncomePage, IncomeSection, IncomeSources, MonthlyReportPage,
MonthlyReportSection, CategoryBreakdown, and MonthFilter.

Publish MonthFilter's agreed props early for Alaa and Molham.
Income must show a filtered income total, source breakdown, income-only
history, and add/edit/delete actions.

Reuse Alaa's agreed TransactionTable, TransactionFilters, TransactionForm,
Modal, and feedback interfaces. Coordinate their availability rather
than implementing duplicates. Do not create an income slice.

Build report structure for monthly income/expenses, savings/rate,
category spending percentages, largest spending category, and budget
comparison. Use Alaa's read-only BudgetTable/BudgetStatus interface.

Use props/fixtures until live state is available.
Do not duplicate calculations owned by selectors.ts.
Send missing CSS class requirements to Molham; do not edit index.css.
```

## Day 2 - Income and report behavior

### Nagham - Step 8: Connect Income and complete monthly reporting

```text
Prerequisite: Day 1 integration. Parallel with Steps 7 and 9.

Connect Income to Alaa's shared transaction slice and components.
Use the same fetch/mutation/validation operations as Transactions.
Show filtered income totals, sources, and history, with pending,
loading, error, and empty states.

Income mutations must update all other views through shared state.
Do not create separate records, API helpers, or validation logic.
Integrate the real mutation exports once Alaa's Step 7 is ready.

Complete Monthly Report using Molham's shared selectors.
Display selected-month income, expenses, savings, savings rate,
category totals/percentages, largest spending category, and budget
comparison using Alaa's read-only components.

Show N/A for zero-income savings rate, zeros plus a clear empty-month
message, and overspent for negative savings.
Month changes must update every relevant report value.

Do not implement budget editing or modify either Redux slice.
Report missing selector/API/component behavior to its owner.
```

### Nagham - Step 11: Verify Income and report synchronization

```text
Prerequisite: Income/report implementation.
Can begin alongside Alaa's Step 10, but final budget comparison checks
wait for that step to be integrated.

Create, edit, and delete income from Income and verify Transactions,
Dashboard, and Report agree. Change income category and month; verify
source percentages and monthly values recalculate.

Verify report changes after expense amount/category/month edits and
deletion. Check budget comparison after budgets are set, changed, or
removed through Alaa's Budgets page.

Compare values with manually calculated expected results.
Check no-budget categories, empty months, zero income, negative savings,
and largest spending category.

Fix your files only. Send reproducible calculation defects to Molham
and mutation/budget component defects to Alaa.
Do not implement Excel export yet.
```

## Day 3 - Verification and optional export

### Nagham - Step 14: Test Income and Monthly Report end to end

```text
Parallel with Steps 13 and 15.

Verify Income's source breakdown, filtering, add/edit/delete integration,
empty states, failed-request handling, and refresh behavior.

Verify PDF flow D:
switch months and check every report value, including income, expenses,
savings/rate, category percentages, largest spending category, and
budget comparison.

Cover zero-income and empty months, negative savings, no-budget spending,
and updates after transaction/budget changes.

Coordinate budget mutation tests with Alaa, who owns Budgets.
Fix owned files and report exact reproduction steps for shared defects.

Prepare an English demonstration of Income and monthly reporting,
including savings calculations and switching months.
```

### Nagham - Step 16: Implement and integrate Excel export

```text
Prerequisite: Core acceptance checkpoint passes after Steps 13-15.

Implement ExportExcelButton using the agreed export dependency.
Request any package-file changes from Molham; do not edit them yourself.

Generate a real .xlsx workbook:
- Income and transaction exports use the current filtered rows.
- Report exports use the selected month.
- Report sheets include summary, transactions, and budget comparison.
- Exported values match the application; unavailable savings rate is N/A.

Make the component reusable through documented props and provide clear
failure feedback.

Integrate export into your Income and Monthly Report pages.
Give Alaa instructions for Transactions and Molham instructions for his
relevant views. Do not edit their pages.

Verify workbook content and report what was checked.
Send any styling needs to Molham and complete your demo preparation.
```
