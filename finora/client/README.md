# Finora frontend

React + TypeScript with Redux Toolkit and the Finora application shell.

## Run locally

Requires Node.js 22.12+ (Node 24 is supported) and npm.

```sh
cd finora/client
npm ci
npm run dev
```

Set `VITE_API_BASE_URL` in a local environment file or the shell to the
confirmed backend base URL, then restart Vite. A same-origin `/api` value
requires a matching server/proxy. Missing configuration displays a readable
error; production never falls back to fixtures or browser storage.

```sh
npm run build
npm run lint
node --experimental-strip-types --test tests/*.test.ts
```

The build outputs to `dist/`. Production hosting must serve `index.html`
for non-asset application URLs. Vite supports direct routes and refresh.

## Integrated routes

| Path | View / current state |
| --- | --- |
| / | Dashboard placeholder; dashboard section is not implemented |
| /income | Income placeholder; income section is not implemented |
| /transactions | Connected transaction filters, table and CRUD dialogs |
| /transactions/new | Connected shared transaction form |
| /transactions/new?type=income | Shared form initially selects income |
| /budgets | Connected monthly budgets and set/edit/remove dialogs |
| /reports/monthly | Connected summary, category breakdown and read-only budgets |
| /about | Existing informational page |
| Any unknown path | Not found |

`store.ts` creates the singleton using the real transaction and budget
reducers. `main.tsx` supplies Redux and a shared NotificationProvider.
`App.tsx` fetches each collection only while its fetch state is idle. The
current-state check and slice pending guards prevent duplicate StrictMode
startup requests; route changes do not refetch. Page retry controls remain
explicit. A browser refresh creates a new store and requests server data.

Add Transaction uses the shared validated form, awaits the real creation
thunk, retains drafts on failure, and returns to Transactions after success
or cancellation. Success notifications survive route changes. The income
query chooses the initial type without introducing another financial store.

All styling remains in `src/index.css`, imported once from `main.tsx`.
Budget progress colors now use the near-limit/exceeded tokens in both
WebKit and Mozilla; budget row headers use surface/text colors. Report
amounts use the shared stat size and can wrap. Forms and page containers
can shrink without forcing page overflow. Notification gaps do not intercept
controls, while toast hover/focus pause remains intact.

## Verification

Day 1 integration checks, 2026-10-11:

- Production build, ESLint, strict TypeScript checks including existing test
  sources, all 32 Node tests, and git whitespace checks pass.
- The existing feature browser suite passes transaction/budget mutations,
  filters, validation, failed-request draft retention, dialog focus/pending
  behavior, and monthly report calculations using intercepted API responses.
- `tests/shell.browser.mjs` checks the actual application entry point at
  360, 390, 768, 1024, and 1440px (560px viewport height): no page-level
  horizontal overflow; tables scroll within their containers; transaction
  create/edit/delete and budget set/edit/remove dialogs fit and scroll.
- Mobile navigation opens and closes through Escape, close button, backdrop,
  and navigation; Escape restores focus. Required route links and the global
  Add Transaction action are reachable at every checked width.
- Full-shell checks verify one initial GET per collection under StrictMode,
  no navigation refetches, Add income failure/success, updates in Monthly
  Report, explicit retry, and one new GET per collection after refresh.
- Phone dialog and phone/tablet/desktop report screenshots were inspected.

To repeat browser checks, start Vite with `VITE_API_BASE_URL=/test-api` on
port 5178 (`npm run dev -- --port 5178`). With Playwright and Chrome available:

```sh
node tests/features.browser.mjs
node tests/shell.browser.mjs
```

Set `PLAYWRIGHT_MODULE_PATH` to an existing `playwright/index.mjs` installation
if it is outside this project. `FEATURE_TEST_URL` overrides the Vite origin.
Screenshots go to ignored `node_modules/.cache/feature-checks` and
`node_modules/.cache/shell-checks`. No dependency changes are needed when
using the bundled runtime.

## Outstanding dependencies

Dashboard and Income remain frontend handoff dependencies: their section
files are empty in this checkout. Their route reachability is verified, but
this is not a claim that their financial views are implemented. Income can
currently be recorded through Add income or the shared transaction form.

`api/` still contains only seed data, with no NestJS application/controllers.
Live CRUD and retention after browser refresh cannot be verified yet. The
backend team must provide the server, confirm `VITE_API_BASE_URL` and the
proposed endpoints, and satisfy [FRONTEND-CONTRACT.md](../FRONTEND-CONTRACT.md):

- GET `/categories`, GET/POST `/transactions`, PUT/DELETE `/transactions/:id`.
- GET/PUT `/budgets` (atomic category/month upsert), DELETE `/budgets/:id`.
- Success envelopes `{ data: ... }`, numeric IDs, JSON delete responses
  containing the deleted ID, and normalized validation/error responses.
- Complete ISO dates in seeds, agreed categories, money/note validation,
  calendar timezone, and unique category/month budgets.

Browser tests intercept responses in memory only inside test scripts; their
refresh assertions verify client behavior, not live backend persistence.
See [SHARED-DATA-REPORT.md](../SHARED-DATA-REPORT.md) for detailed backend
requirements. Earlier handoff notes about missing Redux wiring and the Add
Transaction placeholder are superseded by this integration.
