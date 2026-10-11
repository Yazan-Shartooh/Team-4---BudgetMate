# Budget and monthly report UI handoff

Implemented MonthFilter, CategoryBreakdown, MonthlyReportSection and MonthlyReportPage. BudgetsSection now uses the shared MonthFilter by default. Both pages accept optional section props (`budgets` / `report`) for fixture-backed previews without a Redux provider. Sections take shared domain/selector result types; no financial calculations were added outside selectors.ts.

Existing BudgetForm, BudgetTable, BudgetStatus and budgetsSlice.ts already satisfy the agreed contracts and were retained. Verified all seven expense categories, actual usage above 100%, textual status/exceeded amounts, shared Modal set/edit/remove flows, immutable selected month, and the slice's empty initial state, required thunk/action/default exports and atomic upsert behavior.

Report includes income, expenses, signed savings, savings rate (N/A with zero income), overspent copy, seven category amounts/percentages, largest spending category and a read-only budget comparison. Native progress bars have accessible names; only bar values are clamped. Loading, failure/retry and successful empty-month states are distinct.

## Molham: integration and styles

Production main.tsx still lacks the shared Redux Provider/bootstrap. Connect the existing slice reducers via createAppStore and dispatch initial fetches centrally. The pages already consume shared selectors and dispatch only manual retries/mutations. Until bootstrap/backend setup is available, use the section props or tests/feature-fixture.html. No production fixture data or duplicate store was introduced.

index.css was not changed. Existing shared classes support the implemented layout. Please address these existing style gaps:

- `.budgets-usage .progress[data-status="near-limit"]` and `[data-status="exceeded"]` need the matching progress color tokens, including WebKit/Mozilla progress pseudo-elements. Text already communicates status.
- `.budgets-table tbody th` inherits the column-header background; use the surface/text tokens for row headers if intended.
- Consider `.report-summary .amount` using the shared stat font-size token for stronger financial-value emphasis. This is optional polish; values are readable now.

## Verification

- Production build passed (Vite required execution outside the Windows filesystem sandbox).
- ESLint, TypeScript and git diff whitespace checks passed.
- 22 selector/slice tests passed, including empty months, negative savings, zero income, budget boundaries, unique upsert and removal preserving spending.
- Extended existing browser fixture/test: budget set/edit/remove, report amounts and percentages, all seven categories, actual 101% usage with a capped bar, no report mutation controls, future empty month, zero progress values and required-month clearing behavior passed.
- Browser overflow checks passed at 360, 390, 768, 1024 and 1440px. Desktop report screenshot inspected.
- These use intercepted test API responses, not a live NestJS backend. Full-shell integration remains dependent on the shared bootstrap.
