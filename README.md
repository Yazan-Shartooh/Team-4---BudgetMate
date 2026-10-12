# Finora (BudgetMate)

Personal finance project by Yazan Shartouh, Hamid Al Haj, Esmaeel Mahfoud, Mulham Al Kasir, Alaa Ismaiel, and Nagham Jaza. React + TypeScript frontend, NestJS backend, one user, USD, and in-memory records.

## Start locally

Use Node.js 22.18+ or 24 and npm (verified with Node 24.15.0). Run from the repository root in two terminals.

Backend:

```powershell
cd finora/api
npm ci
Copy-Item .env.example .env
npm run start:dev
```

Frontend:

```powershell
cd finora/client
npm ci
Copy-Item .env.example .env
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

Open http://127.0.0.1:5173. Do not overwrite an existing `.env` without checking its values. No database, credentials, account, or external service is required.

| Configuration | Default / example | Purpose |
| --- | --- | --- |
| API `PORT` | `3000` | NestJS port; endpoints use `/api` |
| API `CLIENT_ORIGIN` | `http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173` | Comma-separated allowed browser origins |
| Client `VITE_API_BASE_URL` | `http://localhost:3000/api` | API URL including prefix; restart Vite after changing; rebuild for production |

The examples match built-in local defaults. Set both the API URL and allowed origin when changing ports or deploying. The API reads `.env` from `finora/api`; Vite reads it from `finora/client`. Never put secrets in `VITE_` settings.

## Production build and checks

```powershell
cd finora/api
npm run build
npm run start:prod
```

```powershell
cd finora/client
npm test
npm run lint
npm run build
npm run preview -- --port 4173 --strictPort
```

Open http://127.0.0.1:4173. A deployed frontend needs an index.html fallback for application routes and a reachable backend URL. Vite preview is for local verification.

For the repeatable live acceptance test, stop the manually started servers on 3000 and 4173 first. Build both projects, install Playwright in your test environment and Chrome, then run from `finora/client`:

```powershell
# Only needed when Playwright is installed outside this project:
$env:PLAYWRIGHT_MODULE_PATH = 'C:/path/to/playwright/index.mjs'
node tests/live.browser.mjs
```

The script refuses occupied ports, starts its own production backend and frontend preview, performs real requests (no API interception), checks downloaded workbooks, tests an outage/restart, and stops its own processes. Build the client with its default localhost:3000 API URL for this test. Screenshots, downloads and results go to `finora/client/node_modules/.cache/live-checks/`.

## Actual limitations

- Records belong to the running server process. Browser reload preserves current server records; **application-server restart resets changes to the ready seed data**. Development watch restarts can also reset records.
- One shared user, no login, database, bank connection, currency conversion, or durable storage. These are outside the assignment scope.
- One record/budget can be at most $1,000,000; money has at most two decimals; notes are limited to 200 characters.
- Open tabs do not receive live push updates from other tabs; reload to fetch their changes. Use matching browser/server calendar dates/timezones near midnight.
- Excel export saves a snapshot; there is no workbook import/restore. The production client currently has a roughly 626 kB JavaScript bundle (200 kB compressed), including Excel support; the build warns about its size.
- The older handoff reports describe earlier stages. Use the current contract and final checklist for integration status. React Context/useReducer is the integrated state implementation, not the earlier proposed Redux setup.

See [demo and English presentation](docs/DEMO.md), [final verification checklist](docs/FINAL-CHECKLIST.md), and [current integration contract](finora/FRONTEND-CONTRACT.md).
