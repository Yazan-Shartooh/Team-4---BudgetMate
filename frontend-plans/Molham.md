# Molham - Three-Day Frontend Prompt Plan

Own the app foundation, dashboard, integration, and all CSS.
Branch: `codex/molham-dashboard`.

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

## Day 1 - Foundation

### Molham - Step 1: Establish shared contracts

```text
Inspect the PDF, finora-template, finora/client, and existing api backend.
Create src/types.ts and finora/FRONTEND-CONTRACT.md.

Define transaction and budget fields, IDs, date/month formats, categories,
API operations, response/error shapes, slice exports, selector signatures,
page routes, and reusable component props.

Match existing backend contracts. List missing endpoints for the backend
team instead of assuming they exist.

Agree on transaction forms/tables and feedback components owned by Alaa,
the MonthFilter owned by Nagham, and read-only BudgetTable/BudgetStatus
usage by Nagham's report.

Use at least six expense and three income categories. Define consistent
money rounding and date-only handling. All totals derive from shared data.

Create finora/UI-CONTRACT.md with CSS variable names and component classes.
Use dashboard-, transactions-, income-, budgets-, and report- prefixes.
Define initial interfaces before feature implementation begins.
```

### Molham - Step 2: Set up the shell and single stylesheet

```text
Prerequisite: Step 1 is merged.

Set up React + TypeScript, dependencies, main.tsx, App.tsx, route
placeholders, Navbar, Sidebar, Breadcrumbs, Footer, and Finora assets.
Provide navigation to required views and a clear Add Transaction action.

Create only src/index.css and import it once.
Define :root variables for colors, fonts, spacing, radii, shadows,
content width, sidebar width, header height, and reusable control sizing.

Style shared controls, cards, tables, dialogs, badges, feedback, and focus.
Use literal media-query breakpoints such as 1200px, 900px, 640px, and 400px.
Change layout variables within those queries; do not use CSS variables
as ordinary media-query conditions.

Support phones, tablets, laptops, and wide desktops with wrapping actions,
stacked cards/forms, collapsible navigation, contained table scrolling,
viewport-safe dialogs, and reduced-motion preferences.

Document available classes. Verify build and navigation.
```

### Molham - Step 5: Implement data helpers and shared calculations

```text
Prerequisite: Step 2. Work in parallel with Steps 3 and 4.

Implement api.ts, store.ts, hooks.ts, and selectors.ts.
Use the agreed exports from Alaa's transaction and budget slices.
Do not modify those slices yourself.

Use typed real API requests and readable error normalization.
Never silently replace a failed request with mock data.

Implement selectors for monthly income/expenses, all-time balance,
monthly savings/rate, category totals/percentages, recent transactions,
budget spending/usage/remaining/exceeded/status, warning categories,
and largest spending category.

Handle zero income as unavailable savings rate, zero expenses as zero
percentages, negative savings, and unbudgeted spending in all totals.
Exactly 80% and 100% are Near limit; only over 100% is Exceeded.
Do not mutate state. Use the runtime's actual current month.

Add focused tests for calculation boundaries and money consistency.
Coordinate backend gaps and integrate slice exports when available.
```

### Molham - Step 6: Integrate Day 1 and responsive styles

```text
Prerequisite: Steps 3, 4, and 5 are merged.

Connect providers, store, routes, feature pages, and navigation.
Avoid duplicate initial fetches.
Apply Alaa's and Nagham's class requirements to index.css only.

Check 360px, 390px, 768px, 1024px, and 1440px layouts.
Verify contained table scrolling, viewport-safe dialogs, wrapping forms,
mobile menu behavior, visible focus, and no page-level horizontal overflow.

Confirm all required pages and Add Transaction are reachable.
Run build and existing checks. Record backend blockers.
```

## Day 2 - Dashboard and integration

### Molham - Step 9: Complete the dashboard

```text
Prerequisite: Day 1 integration. Parallel with Steps 7 and 8.

Complete DashboardPage, DashboardSection, StatCard, BalanceSummary,
SpendingChart, BudgetAlerts, and RecentTransactions.

Read shared Redux state through selectors only.
Display current-month income, expenses, savings/rate, all-time balance,
category spending/percentages, near-limit/exceeded categories, and recent
transactions, with loading, error, and empty states.

Keep monthly savings distinct from all-time balance.
Use semantic lists/progress bars for category spending; no new chart
library is needed for core completion.

Verify mutations elsewhere update dashboard values.
Add styles only in index.css using variables and media queries.
```

### Molham - Step 12: Verify backend integration and refresh

```text
Prerequisite: Steps 7 through 11 are integrated.

Run against NestJS and verify startup fetching, successful mutations,
consistent values across all pages, clear server failures, and refresh.

Transactions and budgets must retain changes after browser refresh while
the server remains running. Coordinate failures with the responsible
frontend or backend owner; do not substitute localStorage.

Check server seed requirements: at least 20 transactions over two months,
six expense and three income categories, and current-month budgets showing
On track, Near limit, and Exceeded.

Apply approved CSS requests. Run build and focused tests.
Record the core requirements ready for Day 3 and unresolved blockers.
```

## Day 3 - Quality and delivery

### Molham - Step 15: Responsive and accessibility verification

```text
Parallel with Steps 13 and 14.

Review all pages and dialogs at 360px, 390px, 768px, 1024px, and 1440px,
a short landscape viewport, and 200% browser zoom.

Fix overflow, clipping, non-wrapping filters, sidebar overlap, dialog
scrolling, status contrast, focus visibility, and mobile navigation.
Use only index.css and its shared variables.

Check keyboard access, labels, dialog focus, error announcements, and
text labels alongside status colors. Coordinate component markup fixes
with its owner rather than editing their files.

Complete NotFoundPage. Run build/checks and identify any core blockers.
Do not approve optional work until required flows pass.
```

### Molham - Step 18: Final integration and demo handoff

```text
Prerequisite: Required checks pass and Steps 16 and 17 are integrated.

Complete AboutPage with accurate project/team information.
Replace preview-only statements with correct server-memory behavior:
browser refresh retains changes; server restart may reset data.

Integrate export into your relevant pages and apply final CSS requests.
Verify all stylesheet content is in index.css, with no hardcoded template
date limit or production mock-data fallback.

Run clean startup/build and all four required flows:
record a transaction; edit/delete; set/follow budgets; review/switch months.

Write setup and demonstration documentation covering startup commands,
environment configuration, real limitations, seed preparation, and a
repeatable demo. Assign English presentation sections:
Molham - problem, architecture, dashboard;
Alaa - transactions, validation, budgets;
Nagham - income, reports, calculations, export if complete.

Rehearse together. Report verified requirements separately from remaining
issues. Do not declare completion with missing required integration.
```
