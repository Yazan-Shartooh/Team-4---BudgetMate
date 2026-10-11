# Transactions, budgets and shared UI handoff

## Implemented files

All paths below are relative to `finora/client`.

- Pages: `src/pages/TransactionsPage.tsx`, `src/pages/BudgetsPage.tsx`.
- Transaction components: `src/components/TransactionsSection.tsx`, `TransactionTable.tsx`, `TransactionFilters.tsx`, `TransactionForm.tsx`, `DeleteTransactionModal.tsx`.
- Budget components: `src/components/BudgetsSection.tsx`, `BudgetTable.tsx`, `BudgetForm.tsx`, `BudgetStatus.tsx`.
- State: `src/store/transactionsSlice.ts`, `src/store/budgetsSlice.ts`.
- Shared feedback: `src/components/Modal.tsx`, `ToastQueue.tsx`, `LoadingMessage.tsx`, `ErrorMessage.tsx`, `EmptyState.tsx`; `src/context/NotificationContext.tsx`.
- Tests: `tests/feature-slices.test.ts`, `tests/feature-fixture.html`, `tests/feature-fixture.tsx`, `tests/features.browser.mjs`.

The types, API helper, selectors, store factory/hooks, App/main entry points, dependencies, index.css, AddTransactionPage, MonthFilter and Income pages are unchanged. No package installation is required. This report is the only new coordination document.

## Available interfaces

Both slices default-export their reducer with the agreed root state shape. Named exports:

| Slice | Thunks | Clear action |
| --- | --- | --- |
| transactionsSlice | fetchTransactions, createTransaction, updateTransaction, deleteTransaction | clearTransactionMutationState |
| budgetsSlice | fetchBudgets, saveBudget, deleteBudget | clearBudgetMutationState |

Initial state has empty items and idle fetch/mutation metadata. Thunks call the existing real API helper and pass AbortSignal; no seed fallback or second live-data store exists. Pending guards serialize each slice's operations, and request IDs prevent old responses overwriting current state. Confirmed returned records update shared items. Budget saves replace the unique category/month pair; removals retain transactions. Failed requests preserve items and normalized errors. Clear actions do not interrupt pending requests.

Shared components default-export functions with the existing props in types.ts. TransactionTable sorts a copy newest-first with numeric-ID ties and supports readOnly. TransactionForm supports create/edit, optional initialType and lockedType; it uses text drafts, validates positive amounts with at most two decimals, category/type compatibility and real nonfuture dates, and retains drafts after rejection. Editing an existing budget keeps its category fixed. BudgetTable consumes selector-produced rows, shows every category provided, supports readOnly without edit/remove buttons, and displays actual over-100% usage while clamping only the native progress bar.

Modal uses a native dialog, labeled title/description, initial focus, Tab containment, Escape/backdrop dismissal when idle, pending-close protection, and focus restoration. If a deleted opener no longer exists, focus returns to its table region or main landmark. NotificationProvider and useNotifications are available; providers reuse an existing ancestor. A queue displays up to three notifications at a time; success/info dismiss after five seconds unless hovered/focused; errors remain until dismissed. Success notifications follow resolved mutations, and failed operations retain inline errors.

TransactionsSectionProps and BudgetsSectionProps are exported from their component files for fixture/parent integration. They accept derived rows/totals, request states and promise-returning mutation callbacks, storing only drafts/dialog/filter UI state locally. Callback rejection must propagate so forms stay open. They can be rendered with test props without a Redux Provider. Page adapters consume the shared selectors and dispatch the agreed thunks when a Provider exists. Without a Provider they show a readable unavailable message, not fake records or a context crash.

## Integration requests for Molham

1. The two default reducers now exist. In `src/store/store.ts`, import them and export the singleton using the existing factory:

   ```ts
   import transactions from './transactionsSlice';
   import budgets from './budgetsSlice';
   export const store = createAppStore({ transactions, budgets });
   ```

2. Wrap the app once in `<Provider store={store}>` in `main.tsx` and dispatch fetchTransactions()/fetchBudgets() in the agreed app bootstrap effect. Thunk conditions deduplicate overlapping startup calls. The page adapters do not add duplicate startup fetches; their Load/Try again controls are manual retries. Optionally wrap the app in NotificationProvider for notifications that survive navigation; section-level providers will reuse it.

3. Confirm the actual backend URL/paths and set VITE_API_BASE_URL. Existing helpers use the documented proposed endpoints, but there is still no NestJS server in this checkout. Correct seed dates such as `26/10` before integration. Live server CRUD, failure responses and refresh retention remain blocked until this is supplied.

4. The shell's `/transactions/new` route still renders the existing AddTransactionPage placeholder, outside this task's explicit file list. Route integration must mount TransactionForm with initialType from `?type=income`, wire createTransaction(input).unwrap(), and return to Transactions on success/cancel. The implemented Transactions page has its own reachable Add transaction action and shared form dialog once the Provider/data are available. Do not mark the global Add route complete yet.

5. No CSS was changed. Suggested additions to `src/index.css`, using existing tokens:
   - `.budgets-usage .progress[data-status="near-limit"]` should use `--color-progress-near`; exceeded uses `--color-progress-exceeded`. Apply colors to accent-color and both `::-webkit-progress-value`/`::-moz-progress-bar`; currently all progress bars inherit teal while textual status is correct.
   - Scope the existing table header background to column headers or set `.budgets-table tbody th` to the surface background and primary text; semantic row headers currently inherit the pale header background.
   - Review `.toast-queue` placement and hit testing: fixed success toasts can temporarily overlap bottom-right table actions. Consider `pointer-events: none` on the queue/toast surface and `pointer-events: auto` on dismiss buttons, or reserve space/relocate the queue. Tests dismiss queued toasts before interacting with covered controls; success toasts also expire. Preserve hover/focus pause behavior if the CSS approach changes pointer handling.
   - Existing dialog sizing scrolls correctly at 360x560; keep internal vertical scrolling and visible focus when refining spacing. No additional stylesheet or inline styles are needed.

## Nagham integration

`MonthFilter.tsx` remains empty and untouched. Please implement the agreed MonthFilterProps: unique id, label, value/onChange, optional disabled/allowAll. Emit an empty string only when allowAll=true and no malformed month strings. Transactions use allowAll=true; Budgets require a month.

Until then, TransactionFilters, TransactionsSection, TransactionsPage, BudgetsSection and BudgetsPage accept optional `MonthFilterComponent: ComponentType<MonthFilterProps>`. Without it, labeled native month inputs use the same value/onChange contract. After MonthFilter exists, Molham can pass `<TransactionsPage MonthFilterComponent={MonthFilter} />` and `<BudgetsPage MonthFilterComponent={MonthFilter} />` in App. No duplicate shared MonthFilter implementation was created.

Income can reuse TransactionTable, TransactionFilters (lockedType='income'), TransactionForm (lockedType='income' and initialType='income'), DeleteTransactionModal, Modal, feedback and the transaction slice. Reset filters through TransactionFilters preserves lockedType. The form/table use the same data and mutation contracts as Transactions. There is no Income slice.

Monthly Report can use `<BudgetTable rows={selectBudgetUsage(state, month)} readOnly />` and BudgetStatus without exposing editing or removing. Report calculations remain in Molham's selectors.

## Validation performed

- Native Node tests: 32 passed, including seven new slice tests covering state shape, successful mutation reductions, cent-consistent recalculation, stale response rejection, failure preservation, unique budget upsert, spending retention after budget removal, and pending-condition guards.
- Strict TypeScript check includes source imports, new slice tests and the isolated browser fixture.
- Final production build, ESLint (no warnings), strict TypeScript check and `git diff --check` all passed. The temporary Vite fixture server was used only for verification.
- Browser fixture uses real components, Redux reducers/thunks, API helper and shared selectors, with intercepted test API responses. Passed create/edit/delete, combined type/category/month/search filtering and clear/no-results behavior; invalid/overprecision/future-date input; draft retention after a rejected request; pending Escape protection; dialog initial focus, Tab containment, Escape and focus restoration; set/edit/remove budget; all seven category rows/statuses; and read-only table actions absent.
- Checked no page-level horizontal overflow for Transactions, Budgets and the read-only table at 360, 390, 768, 1024 and 1440px. The dialog fits a 360x560 viewport and scrolls internally. Desktop budget and mobile dialog screenshots were inspected. This fixture does not replace full-shell testing after integration.
- No live NestJS end-to-end or browser refresh persistence claim is made. The fixture's in-memory API exists only inside the browser test script.

Run unit checks from `finora/client` with `node --experimental-strip-types --test tests/*.test.ts`. Run `npm run build` and `npm run lint` for production/source checks.

To repeat browser checks, start Vite with VITE_API_BASE_URL=/test-api on port 5178, then run `node tests/features.browser.mjs` using an existing Playwright installation and Chrome. Set PLAYWRIGHT_MODULE_PATH to that installation's `playwright/index.mjs` if it is outside this project. FEATURE_TEST_URL optionally changes the fixture origin. No dependency files were modified to run these checks; the existing bundled Playwright runtime was used.
