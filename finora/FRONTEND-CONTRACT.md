# Finora frontend contract

Status: frontend coordination baseline, not implemented integrations. `client/src/types.ts` is the canonical type and prop definition. HTTP paths and envelopes below are proposals awaiting the backend team's implementation/confirmation. No feature pages, store, API helpers, or styles are implemented by this task.

## Evidence and ownership

Reviewed the seven-page `BudgetMate - Yazan Shartouh.pdf` in the parent MiniProject directory, `finora-template/src/{App.tsx,data.ts,style.css,main.tsx}`, the dashboard reference image, `finora/client`, `api`, and all three `frontend-plans` documents. No applicable AGENTS.md was found. Client source and configuration files are empty placeholders. The only backend file is `api/data/data.js`; there are no NestJS controllers, services, package configuration, HTTP routes, or error handlers to match.

Molham owns types, API helpers, selectors, store wiring/hooks, shell/routes, dashboard, configuration/dependencies, all CSS, and these contracts. Alaa owns transaction/budget slices and pages, reusable forms/tables, Modal, notifications and feedback. Nagham owns Income, Monthly Report, MonthFilter, breakdown/source components and later optional export. Request changes from the owner; do not implement another owner's files. These interfaces are the coordination baseline, not evidence of teammate or backend sign-off.

## Records and validation

- Preserve the seed's positive integer numeric transaction and budget IDs. The server assigns IDs; clients never generate or recycle them. Budget identity includes an ID and a unique `(category, month)` pair.
- Preserve all backend categories: expense Food, Transport, Housing, Bills, Health, Entertainment, Shopping; income Salary, Freelance, Gift, Other Income. The template's smaller lists must not drop valid backend categories. `TransactionInput` is a discriminated union tying category to type. Runtime validation remains required for form and network data.
- Transactions have `id`, `type`, positive `amount`, matching `category`, `date`, optional `note`, and optional server `createdAt`. New/update input excludes ID and creation time. Update sends all editable fields; omitted/blank note clears an existing note. Trim note, use an agreed maximum of 120 characters, and return a field error for longer input. This length and the amount ceiling below are frontend proposals for matching backend validation.
- Budgets have `id`, expense `category`, `month`, positive `amount`. Save is an atomic upsert by category/month: create if absent, otherwise update the existing ID. It must never create two records for that pair. Budget removal does not remove expenses. Budget forms keep their selected month fixed during submission.
- Validate nonempty positive finite decimal amounts with at most two fractional digits. Reject exponent notation, nonnumeric text, zero, negatives and extra precision before conversion, rather than silently rounding invalid input. Use a proposed per-record ceiling of USD 10,000,000 for both record kinds, coordinated with the backend. Form drafts hold amount as text locally; only validated domain input uses numbers.
- USD is the sole currency. Convert validated values to integer cents, sum/subtract cents and divide by 100 only for returned monetary values. For decimal form text, parse dollars/cents directly; for validated server numbers, use `Math.round(amount * 100)`. Verify finite values and safe integer-cent amounts/totals. Do not sum binary floating-point dollar values or repeatedly round intermediate percentages. Render currency with two decimals; percentage labels with one decimal. Display rounding never decides budget status.

## Calendar handling

`DateOnly` is a valid Gregorian `YYYY-MM-DD`; `Month` is valid `YYYY-MM` (years 0001-9999). String aliases describe formats but do not provide runtime validation. Check format and actual month/day/leap-year validity. Do not parse dates through UTC or use `toISOString()` to produce today's local date: build it from local year/month/day. Date-only labels are formatted from validated components without timezone conversion. Use the user's runtime local day/month, never the template's fixed October 2026 values. Reject future transaction dates; allow report/budget selection of any valid month, including empty/future months. The server must enforce equivalent validation; its agreed calendar timezone must align with the client for day-boundary checks.

Filter transactions by `date.slice(0, 7)` after validation. `createdAt` is metadata, not the accounting date. History sorts by date descending, then numeric ID descending for deterministic ties. Recent activity defaults to five entries across all history; callers may explicitly pass a month. Do not infer date from the current month or silently convert the seed's `26/10` shorthand. The backend team must replace every seed date with an authoritative complete date; `createdAt` alone is not proof of the intended transaction date.

## Proposed transport contract: all endpoints missing

Configure one API base URL through `VITE_API_BASE_URL` in the later setup task. No host, port or route prefix is confirmed. Paths below are relative to that base; they are requests to the backend team, not working URLs. Configure same-origin proxying or explicit development CORS when the server exists.

| Helper export from api.ts | Proposed HTTP operation | Request | Successful wire response |
| --- | --- | --- | --- |
| getCategories | GET /categories | none | 200 `{ data: CategoryLists }` |
| getTransactions | GET /transactions | none; full history | 200 `{ data: Transaction[] }` |
| createTransaction | POST /transactions | TransactionInput | 201 `{ data: Transaction }` |
| updateTransaction | PUT /transactions/:id | complete TransactionInput | 200 `{ data: Transaction }` |
| deleteTransaction | DELETE /transactions/:id | none | 200 `{ data: numericId }` |
| getBudgets | GET /budgets | none; all months | 200 `{ data: Budget[] }` |
| saveBudget | PUT /budgets | BudgetInput, atomic category/month upsert | 200 `{ data: Budget }` |
| deleteBudget | DELETE /budgets/:id | none | 200 `{ data: numericId }` |

Helper signatures are `FrontendApi` in types.ts. Helpers unwrap `data`, validate returned records and categories, and reject with a normalized `ApiError`. They accept optional AbortSignal. Records returned after create/update/upsert are authoritative. No optimistic writes or mock/seed fallback. A malformed response, wrong returned ID, invalid category/date, or duplicate budget identity must be reported as `INVALID_RESPONSE`, not accepted into Redux. Category lists in types.ts are the fixed frontend baseline; the proposed categories endpoint lets integration confirm they match the server.

Proposed server error body is `{ error: { code, message, status?, fieldErrors? } }` (`ApiFailure`). Use HTTP 400 for validation, 404 for missing transactions/budgets, 409 for conflicts/stale records, and 5xx for server failure. Message is readable English; fieldErrors maps type/amount/category/date/note/month to messages. Missing transaction copy: `Transaction not found. Reload the list and try again.` A stale conflict response must preserve drafts and offer reload. No version protocol currently exists; multi-client concurrency protection requires a separate backend agreement.

The future API helper must also normalize standard NestJS `{ statusCode, message: string | string[], error }` errors, joining validation messages. Map network failures to NETWORK_ERROR, malformed success payloads to INVALID_RESPONSE, cancellation to ABORTED, and unknown/non-JSON HTTP failures to an appropriate generic readable error with HTTP status. Do not display raw HTML, stack traces, or `[object Object]`. TypeScript has no typed Promise rejection; callers narrow/normalize caught values.

## Redux contract and request lifecycle

Root keys: `transactions: TransactionsState`, `budgets: BudgetsState`. `FinanceState` describes selector input; store.ts exports `store`, inferred `RootState`, and `AppDispatch`. hooks.ts exports typed `useAppDispatch` and `useAppSelector`. There is no Income slice and no stored derived totals.

Initial slice state: `items: []`, `fetch: { status: 'idle', error: null, requestId: null }`, `mutation: { status: 'idle', error: null, requestId: null, target: null }`. Fetch and mutation states are independent; status values are idle/pending/succeeded/failed. Errors are serializable ApiError objects, never Error instances. No promises, DOM nodes, or AbortControllers go in Redux.

| Slice | Named thunk export (argument -> fulfilled payload) | Plain action export | Default export |
| --- | --- | --- | --- |
| transactionsSlice.ts | fetchTransactions(void -> Transaction[]); createTransaction(TransactionInput -> Transaction); updateTransaction(UpdateTransactionInput -> Transaction); deleteTransaction(TransactionId -> TransactionId) | clearTransactionMutationState() | transactions reducer |
| budgetsSlice.ts | fetchBudgets(void -> Budget[]); saveBudget(BudgetInput -> Budget); deleteBudget(BudgetId -> BudgetId) | clearBudgetMutationState() | budgets reducer |

Use RTK createAsyncThunk with rejectValue ApiError and prefixes `transactions/fetchTransactions`, `transactions/createTransaction`, `transactions/updateTransaction`, `transactions/deleteTransaction`, `budgets/fetchBudgets`, `budgets/saveBudget`, `budgets/deleteBudget`. Plain actions use their respective slice prefix. Thunks and helpers have matching names in different modules; alias API imports inside slices to avoid recursion.

On pending, clear that request's error and record requestId/target. On fulfilled, apply only the current requestId: fetch replaces items; create/update replaces or inserts by returned ID; saveBudget replaces the unique pair with the returned server record; delete removes the confirmed ID. All views immediately derive values from these shared items. On rejection, retain records and drafts, set the normalized error, and allow retry. No success toast or modal close until `.unwrap()` succeeds. Clear-mutation actions reset terminal feedback and must not reset an active request.

Serialize mutations per slice; guard thunks with a condition as well as disabling controls. Do not start a fetch while that slice's mutation is pending, or a mutation while its fetch is pending. Deduplicate concurrent startup fetches (including React StrictMode) using pending status and requestId; retries after failure are allowed. This prevents a stale fetch from overwriting a confirmed mutation. Initial fetches are dispatched once by the app bootstrap; feature pages consume state, not duplicate bootstrap fetching. Refresh reconstructs the store and fetches both full collections from the still-running server. Never rehydrate working data from localStorage. An initial failed fetch must show an error, not an empty success; a later failed reload may retain clearly marked stale data. Server restart may reset data.

## Selectors and calculations

All named signatures and result fields are in `SharedSelectors` in types.ts. Implement as pure selectors in store/selectors.ts, using memoization where useful and never sorting/mutating state arrays. A month argument is explicit so date changes can be handled by callers. Dashboard supplies the runtime current month and refreshes that value at day/month rollover and on returning to the tab.

| Selector | Meaning |
| --- | --- |
| selectTransactions / selectBudgets | Read-only raw collections |
| selectFilteredTransactions | AND-combine type/category/month and case-insensitive trimmed query over note/category; newest first |
| selectFilteredTotals | Income, expenses, income minus expenses for the same filtered rows |
| selectIncomeSources | Force income type while preserving category/month/query filters; all four categories including zeros; percentages of filtered income |
| selectMonthlySummary | Income, expenses, savings, percentage savings rate, overspent flag and count for month |
| selectAllTimeBalance | All income cents minus all expense cents, including unbudgeted spending |
| selectExpenseBreakdown | All seven expense categories, zero rows included; amount and percentage of month's expenses |
| selectRecentTransactions | Newest first, default limit 5, optional month; nonpositive limit returns [] |
| selectBudgetUsage | All expense categories for month, including those without a budget |
| selectBudgetAlerts | Only near-limit or exceeded rows for month |
| selectLargestSpendingCategory | Highest positive expense category or null when no spending |

Breakdown and income source ordering: amount descending, ties in the corresponding category constant's order. Budget rows and alerts follow expense category order. Largest-category ties select the first breakdown row. Category percentages use only the relevant income/expense denominator; zero denominator produces zero percentages. Savings rate = savings / income * 100; zero income returns null displayed as N/A. Negative savings remain negative with the explicit label Overspent. Empty month yields zeros, N/A savings rate, no largest category, and a clear no-transactions message.

For a budget, compare integer cents: less than 80% is on-track, 80% through exactly 100% is near-limit, above 100% is exceeded. Compare actual amounts, not rounded display percentages. Remaining is budget minus spent (signed); exceeded is max(spent minus budget, 0). Percentage is unbounded spent / budget * 100. No budget yields null budget ID/amount, remaining, exceeded and usage; status no-budget while actual spent stays counted. UI labels are On track, Near limit, Exceeded, No budget. Expenses above the budget remain allowed.

## Shared component agreement

All exact props live in types.ts. Import them rather than redeclaring incompatible local versions. Callbacks returning Promise<void> resolve only on successful persistence and reject on failure; parent handlers retain errors and do not swallow rejection. Forms catch failure, retain draft input, and remain open. Forms reset when opened for a different record, not every time unrelated Redux state rerenders.

- Modal: controlled open/title/description/children/onClose, pending flag and optional initialFocusId. Use a native dialog, associated heading/description, showModal focus containment, initial focus, Escape/backdrop dismissal when idle, and focus restoration to the opener. While pending, suppress close and duplicate submission and announce progress. Requests need a bounded timeout so controls cannot remain pending forever.
- LoadingMessage: optional message with polite role=status. ErrorMessage: required message, optional retry and pending; role=alert, disabled retry while pending. EmptyState: title, optional description/action; use only after successful loading. ToastQueue/NotificationContext: queue unique UI IDs, dismiss by ID, success/info polite and errors alert; success follows fulfilled requests. Inline errors must remain available even if toast is dismissed.
- MonthFilter: required unique id, visible label, value/onChange; disabled and allowAll default false. `''` means all history only when allowAll is true. When false, do not emit blank or invalid months. Transactions and Income allow all; Budgets and Report require a month. No fixed max month.
- BudgetStatus: status plus optional exceeded amount, required by convention for exceeded. Render text with color, including the exceeded amount. BudgetTable's discriminated readOnly prop prohibits edit/remove callbacks in reports. Rows include month/category and optional budget identity; construct remove's Budget from an existing row only, never from a no-budget row. BudgetForm receives month and optional budget/category, pending/error and submit/cancel. On category switch load that category's existing budget at the parent or make the existing record's category immutable; save semantics remain an explicit upsert.
- TransactionTable: semantic table, caption, sorted rows, empty copy, pending and readOnly mode. Editable mode requires both callbacks and descriptive per-row action labels. Income passes the same component income-only rows; dashboard uses readOnly.
- TransactionFilters: controlled complete filter object; a type change clears any incompatible category. Clear resets month/category/query/type to all, except lockedType remains fixed. Income passes lockedType=income and cannot accidentally reveal expenses. Search is optional convenience already in the template; core type/category/month filters take priority.
- TransactionForm: transaction for edit or initialType for create, optional lockedType, pending/error, submit/cancel. Transaction input validates once in this shared form, with server validation also required. Locked type hides switching and rejects incompatible input; initialType defaults to expense. Edit initialization takes values from transaction. Parent binds edited ID into updateTransaction. Show field errors next to associated labeled inputs and a readable summary.
- DeleteTransactionModal: transaction=null means closed; show record context, confirmation/cancel, pending/error. Failed/missing record operations stay open with useful feedback. Confirm resolves only after server success.

## Routes and entry actions

Use `pageRoutes` from types.ts: `/` Dashboard, `/transactions` Transactions, `/transactions/new` Add Transaction, `/income` Income, `/budgets` Budgets, `/reports/monthly` Monthly Report, `/about` About. Unknown URLs show NotFoundPage with a Dashboard link. The later shell must support direct entry, refresh and browser back/forward (development/production SPA fallback must be configured).

Sidebar links reach every main view. A clearly labeled Add transaction link/button is always available from the shell and Transactions page and goes to `/transactions/new`. That route renders the shared TransactionForm in a page or modal over Transactions; direct entry must work, and cancel/success returns to Transactions. Income's Add income goes to `/transactions/new?type=income`, using the same form and slice. Parse only income/expense for the optional type query; default expense. Editing/deleting use controlled shared dialogs from table actions. Optional export is deferred until required flows pass.

## Exact integration requests and outstanding checks

Backend team: supply the eight proposed endpoints or return the actual paths/envelopes before API wiring; implement in-memory CRUD, unique budget upsert, runtime validation and readable 400/404/409 errors; confirm amount/note limits and calendar timezone; correct all seed transaction dates; keep IDs numeric and full category lists; ensure at least 20 records over two months and budgets demonstrating all three statuses in the runtime current month. Existing seed has 32 records and fixed October budgets, but its date shorthand is invalid for the required contract and its months will become stale.

Molham's next foundation task: create valid package/build configuration, install React/TypeScript/Redux Toolkit/react-redux and agreed routing support, implement API helpers only once server routes are confirmed, wire store/providers/bootstrap, selectors and styles. This task adds no dependencies. Alaa: implement the documented slices/forms/feedback and exports. Nagham: implement MonthFilter and consume shared transaction components/selectors for Income/Report; no duplicate store or calculation logic.

Before integration acceptance, test validation, cent arithmetic, zero-income/empty months, 80%/100%/over-budget boundaries, unbudgeted expenses, updates across category/month, failure/pending behavior, and all PDF flows A-D against the real server including refresh. These behaviors are specified, not verified by this contract-only change.
