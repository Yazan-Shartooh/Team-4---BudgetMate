# Finora

Finora is BudgetMate's React and TypeScript personal-finance client. It provides shared transaction and income records, category budgets, a dashboard, monthly reports, and Excel exports.

## Setup

Requires Node.js 22.12+ (Node 24 is also supported) and npm.

Before a clean install/build, add the SheetJS `xlsx` dependency used by
`src/utils/excelWorkbook.ts` to `package.json` and regenerate
`package-lock.json` (Molham owns dependency changes).

```sh
cd finora/client
npm ci
```

Set `VITE_API_BASE_URL` to the base URL and API prefix supplied by the backend team before starting Vite:

```powershell
$env:VITE_API_BASE_URL = "<backend base URL and API prefix>"
npm run dev
```

The backend URL, port, and route prefix are not included in this checkout. The frontend contract lists expected HTTP operations in [FRONTEND-CONTRACT.md](../FRONTEND-CONTRACT.md); confirm them with the backend team rather than guessing. If the API base is absent, requests fail visibly. No financial data is stored in browser storage or replaced with local demo records.

```sh
npm run build
npm run lint
npm test
npm run preview
```

The production build writes to `dist/`. Production hosting must return `index.html` for application routes. Vite development and preview support direct route entry and refresh.

## Data lifecycle and seed preparation

The client fetches transactions and budgets into an in-memory React state provider. With the intended NestJS in-memory server running, a browser refresh starts fresh API requests and reloads the records currently held by that server. Restarting the server may reset its records. The NestJS app and startup scripts are not present in this checkout, so live server persistence is not currently verified.

Prepare backend seed data with at least 20 valid transactions across two or more months, six or more expense categories and at least three current client income categories. Include current-month budgets demonstrating On track, Near limit, and Exceeded. Use valid `YYYY-MM-DD` transaction dates and category values from `src/types.ts`; shorthand dates such as `26/10` and obsolete category names are rejected by the client.

## Routes

| Path                            | View                        |
| ------------------------------- | --------------------------- |
| `/`                             | Dashboard                   |
| `/income`                       | Income                      |
| `/transactions`                 | Transactions                |
| `/transactions/new`             | Add transaction placeholder |
| `/transactions/new?type=income` | Add income placeholder      |
| `/budgets`                      | Budgets                     |
| `/reports/monthly`              | Monthly report              |
| `/about`                        | About Finora                |
| Any unknown path                | Not found                   |

## Fixture checks

The feature fixture uses a Playwright-routed in-memory API; its refresh tests verify that the fixture server returns changed data after a page reload. These checks do **not** verify NestJS behavior.

In PowerShell, start the fixture Vite server:

```powershell
cd finora/client
$env:VITE_API_BASE_URL = "/test-api"
npm run dev -- --port 5178
```

In another terminal, run the unit and browser checks:

```powershell
cd finora/client
npm test
node tests/features.browser.mjs
```

The browser script requires Chrome and an existing Playwright installation. If Playwright is outside this project, set `PLAYWRIGHT_MODULE_PATH` to its `playwright/index.mjs`; set `FEATURE_TEST_URL` to override the fixture origin. Use the backend URL, not `/test-api`, for live integration checks.

## Demonstration

1. **Molham:** Describe the missing-money problem, client/API architecture and in-memory data lifecycle; show dashboard totals, category spending, budget alerts and recent activity.
2. **Alaa:** Add income and an expense, submit one invalid amount, correct and delete a transaction, set a Food budget, then show spending exceeding its limit.
3. **Nagham:** Add income, explain source percentages, change its category/month, then switch report months. Explain savings as income minus expenses and demonstrate the report workbook, including its budget comparison.

Use a running backend for the presentation and state clearly that a backend restart may reset in-memory records. Core blockers in this checkout are the missing NestJS app/endpoint implementation, absent authoritative backend URL, and seed-date/category alignment; do not present the fixture as live-server verification.
