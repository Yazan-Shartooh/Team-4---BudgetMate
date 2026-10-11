# Shared data implementation and integration handoff

## Implemented in this task

- `client/src/api.ts`: named helpers from FrontendApi, configurable real fetch requests using the proposed HTTP paths, envelope/record validation, normalized serializable errors, 15-second timeout and cancellation. No mock-data fallback, localStorage, optimistic writes, or automatic retries. `createApiClient` supports an explicit base URL and injected fetch for tests. `normalizeApiError` is available to slices for rejectWithValue.
- `client/src/store/selectors.ts`: every SharedSelectors export, memoized derived collections, cent-based arithmetic, deterministic ordering, combined filters, income sources, monthly totals/savings, all-time balance, budget usage/alerts and largest category. `getCurrentMonth()` reads the local runtime date each call; month-specific selectors require an explicit month as agreed. Callers refresh the month at rollover/visibility changes. Percentage results are unrounded; display formatting belongs to the UI.
- `client/src/store/store.ts`: typed `createAppStore({ transactions, budgets })`, with RTK default thunk middleware and serializability/immutability checks. Exports inferred AppStore, RootState and AppDispatch.
- `client/src/store/hooks.ts`: typed useAppDispatch and useAppSelector.
- `client/tests/{selectors,api,store}.test.ts`: focused calculation, request/error and store-wiring checks using Node's built-in test runner. Test fetch responses and reducers are fixtures only; production code has no substitutes.

No dependencies, feature components/pages, CSS, shared types or either Alaa-owned slice were changed.

## Blocked integration: Alaa's exports

At inspection, `transactionsSlice.ts` and `budgetsSlice.ts` were zero-byte files. There are no reducers or thunks to import yet. Consequently there is intentionally no singleton `store`, Provider, or initial fetch dispatch in this change. This is a temporary deviation from the final contract's singleton export, not completed app integration. The existing shell still builds and runs without a fake financial store.

Alaa must provide default reducers with TransactionsState/BudgetsState and the following named thunks:

- transactionsSlice: fetchTransactions, createTransaction, updateTransaction, deleteTransaction; action clearTransactionMutationState.
- budgetsSlice: fetchBudgets, saveBudget, deleteBudget; action clearBudgetMutationState.

Use the agreed argument/fulfilled payloads in FRONTEND-CONTRACT.md. Helpers share thunk names, so alias imports, e.g. `import { createTransaction as requestCreateTransaction, normalizeApiError } from '../api'`. Pass thunkAPI.signal to the helper options and normalize errors into rejectWithValue. Apply confirmed returned records to the shared items arrays. Preserve data/drafts on failure; guard duplicate dispatch and stale request IDs; serialize each slice's fetch/mutation requests. These responsibilities remain in Alaa's slices.

Once the two default reducers are available, Molham can add these exact lines to store.ts (alongside the factory):

```ts
import transactionsReducer from './transactionsSlice';
import budgetsReducer from './budgetsSlice';

export const store = createAppStore({
  transactions: transactionsReducer,
  budgets: budgetsReducer,
});
```

Then wrap the shell in `<Provider store={store}>` in main.tsx and add one app-bootstrap effect dispatching fetchTransactions() and fetchBudgets(). Slice conditions must deduplicate StrictMode/concurrent fetches. A browser refresh starts a new store and reloads the server collections. Do not dispatch fetches in each feature page or persist working data in the browser. Provider/bootstrap edits were outside this task's four implementation files and cannot work until slices exist.

## Blocked integration: backend

The API folder still contains only `api/data/data.js`, no NestJS app/controllers. The helper implements the contract's **proposed**, unconfirmed routes; no live server integration is claimed. Backend owners must implement/confirm:

| Method | Relative path | Success data |
| --- | --- | --- |
| GET | /categories | CategoryLists |
| GET | /transactions | Transaction[] |
| POST | /transactions | Transaction (201) |
| PUT | /transactions/:id | Transaction with matching ID |
| DELETE | /transactions/:id | Deleted numeric ID |
| GET | /budgets | Budget[] |
| PUT | /budgets | Budget, atomic upsert by category/month |
| DELETE | /budgets/:id | Deleted numeric ID |

All successes use `{ data: ... }`; deletes currently require JSON with the ID, not 204. Return `{ error: ApiError }` or normal NestJS error messages on failures. Confirm endpoint paths before connecting the UI; update the helper and contract together if the backend differs.

Set `VITE_API_BASE_URL` to the confirmed server base URL (for example an actual backend origin plus its API prefix) and restart Vite. An explicit same-origin base such as `/api` also works if a proxy is configured. No default host/port or proxy is guessed. Missing configuration fails with a readable error before fetching.

Preserve numeric IDs and all 7 expense/4 income categories; replace the seed's ambiguous `26/10` dates with complete `YYYY-MM-DD` dates. Confirm server validation, USD 10,000,000 per-record ceiling, 120-character note limit, calendar timezone, budget uniqueness and current-month seed statuses. The client rejects malformed success data rather than silently coercing it. Backend validation is still mandatory; these helpers are not a replacement.

Timeout/cancellation can leave an ambiguous mutation outcome on the server. The client does not retry automatically; reload before retrying a change. Server restart may reset in-memory data; browser refresh must not.

## Reproducible checks

Run from `finora/client` using Node 24 (or Node 22.12+ with experimental type stripping):

```sh
node --experimental-strip-types --test tests/*.test.ts
node node_modules/typescript/bin/tsc --noEmit --target ES2022 --module ESNext --moduleResolution Bundler --allowImportingTsExtensions --strict --skipLibCheck --types node,vite/client tests/api.test.ts tests/selectors.test.ts tests/store.test.ts src/store/hooks.ts
npm run build
npm run lint
```

Tests cover 79.99%, exactly 80%, exactly 100%, over 100%, small cent budgets, decimal consistency across views, zero denominators, negative savings, unbudgeted expenses, deterministic sorting/ties, immutable/memoized selectors, replacement state after edits/moves/deletes, budget removal, runtime month rollover and safe integer limits. API tests cover all eight request contracts, authoritative records, validation, wrong identities, duplicate rows, malformed/non-JSON responses, missing configuration, network errors, timeout and cancellation. Store tests use test-only reducers to verify root keys, thunk support and independent instances; they do not verify Alaa's mutations.

Live CRUD, notifications, provider/bootstrap behavior and refresh retention remain untested and blocked by the missing slices/server. Full application acceptance still requires the PDF flows A-D against NestJS.

Checks performed for this change: all 25 Node tests passed; the explicit strict TypeScript check (including test files) passed; production build and ESLint passed; `git diff --check` passed. Vite/esbuild initially hit a sandbox directory-access error; the approved build rerun completed successfully. Both Alaa-owned slice files remain unchanged and empty.
