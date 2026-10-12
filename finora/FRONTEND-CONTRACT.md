# Current Finora integration contract

This replaces the early frontend proposal. See the root README for startup and the final checklist for verification. Older handoff reports are historical.

## Architecture and data

React + TypeScript, React Router, React Context/useReducer in `client/src/store/store.ts`, and pure calculations in `selectors.ts`. Income shares transaction records and mutations. There is no independent income store, browser persistence, optimistic financial write, or production mock fallback. NestJS owns in-memory data; a browser reload refetches it. Server restart loads 32 date-relative transactions and six budgets.

## HTTP contract

Default base `http://localhost:3000/api`; override with `VITE_API_BASE_URL`.

| Operation | Request | Successful response |
| --- | --- | --- |
| Categories | GET /categories | `{ income: [...], expense: [...] }` |
| List transactions | GET /transactions | Raw transaction array |
| Create | POST /transactions | Raw created transaction, 201 |
| Edit | PATCH /transactions/:id | Raw updated transaction |
| Delete | DELETE /transactions/:id | 204, empty body |
| List budgets | GET /budgets | Raw budget array |
| Set/update budget | PUT /budgets | Raw saved budget, unique category/month |
| Remove budget | DELETE /budgets/:id | 204, empty body |
| API report | GET /reports/monthly?month=YYYY-MM | Monthly totals and comparisons |
| API dashboard | GET /reports/dashboard | Current month and all-time balance |

The frontend derives reports from shared collections; the backend also exposes report endpoints. Money calculations use integer cents. API helpers validate raw successful responses and numeric identities; failures and timeouts reject with readable ApiError objects. No retries of writes occur automatically. Notes are explicitly sent as an empty string when cleared in the editor.

## Rules

- Positive finite amounts, at most two decimals, maximum $1,000,000 per transaction or budget. Notes: at most 200 characters.
- Real `YYYY-MM-DD` dates, on or before the runtime date; valid `YYYY-MM` budget/report months. No fixed template-date cutoff.
- Income categories: Salary, Freelance, Other Income. Expenses: Food, Transport, Housing, Bills, Health, Entertainment, Shopping.
- Budgets upsert by category/month; removal preserves spending. Under 80% On track; 80%-100% Near limit; above 100% Exceeded.
- All-time balance uses all history. Monthly savings = monthly income - expenses. Zero-income savings rate is N/A; negative savings remain negative and show Overspent.
- Successful writes update shared state; failed writes preserve drafts. Forms lock while saving; dialogs confirm deletion and retain focus. API data loading/errors remain visible.
- XLSX exports use currently filtered Income/Transactions rows or the selected report month. Report sheets: Summary (including category breakdown), Transactions, Budget comparison.
- All CSS is in `client/src/index.css`, imported once in main.tsx. Responsive controls and native progress elements share Finora tokens.

## Team areas

Yazan: leadership, seed data and prototype coordination. Hamid: backend services/API. Esmaeel: integration and assembly. Mulham: shell, dashboard, calculations, styles. Alaa: transactions/budgets/shared feedback. Nagham: income/reports/month controls/export. These describe documented work areas; every member still needs to rehearse and confirm their own presentation wording.
