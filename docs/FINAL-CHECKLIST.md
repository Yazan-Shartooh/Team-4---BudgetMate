# Final integration checklist

Verified on **12 October 2026**, using Node 24.15.0 and Chrome. Status: **software integration verified locally; team presentation sign-off remains pending**. Do not call the whole project complete until the team rehearsal and individual explanations are finished.

## Verified

- [x] Clean locked dependency installation (`npm ci`) for client and API.
- [x] Frontend and NestJS development startup; both production builds pass. Production preview communicates with a freshly started real NestJS backend.
- [x] About follows Finora styling, includes all six PDF-listed members and documented contribution areas, and explains reset on **application-server restart**, not browser reload.
- [x] Required navigation and screens, including the formerly placeholder Add Transaction route, are implemented.
- [x] **A — Record:** invalid input rejected; valid income and expense saved to the server; history, dashboard, budgets and reports update. Browser reload retains records.
- [x] **B — Correct:** transaction amount edit and confirmed deletion recalculate affected totals. Income category/month/amount edits update both affected reports. Clearing an optional note sends an explicit blank value (focused API test).
- [x] **C — Budget:** set several categories, update without duplicate category/month records, exceed Food by $5.50, show actual usage above 100%, and remove a budget without removing spending.
- [x] **D — Review:** current, previous, overspent and empty months; UI and API totals agree; category amounts/percentages and largest category change with the month. Empty months show zeros and N/A savings rate.
- [x] Three income and seven expense categories. Ready server seed: 32 transactions across three runtime-relative months, six budgets, including On track/Near limit/Exceeded in the current month.
- [x] Exactly 80% and 100% are Near limit, above 100% is Exceeded; cent-safe calculations, zero-income/negative-savings cases and unbudgeted spending covered by unit tests.
- [x] Real API rejects missing/invalid amounts, extra decimals, invalid/mismatched categories, invalid/future dates, income-category budgets and missing transaction IDs.
- [x] Combined type/category/month filters, empty results, clear filters, and newest-first history.
- [x] Transactions and Income export the currently filtered rows; monthly XLSX contains Summary, Transactions and Budget comparison. Downloaded workbook cells/rows were read back and checked.
- [x] Actual backend outage shows readable errors and preserves the form draft. No mock records replace failed data. Retry recovers; restarting the application server restores seed records.
- [x] All seven screens fit at 360, 390, 768, 1024 and 1440 px. Mobile dialog fits and scrolls, contains keyboard focus and closes with Escape. Mobile navigation opens/closes. Desktop/mobile About, report and dialog screenshots inspected.
- [x] Only authored application stylesheet is `client/src/index.css`, imported once from main.tsx. No inline style objects, CSS modules, browser financial storage, fixed template-date cutoff, or production mock-data fallback found.
- [x] Approved handoff styling integrated: status-colored progress bars, budget row headers, report amounts, toast gaps, and shrinking controls. Existing unrelated presentation folders and CSS recovery stashes preserved.
- [x] **37 unit tests**, frontend ESLint and TypeScript production compilation pass. Real-backend acceptance script completes with no uncaught browser errors.
- [x] Setup commands, environment examples, actual limitations, repeatable seed demo and six English presentation sections documented.

## Pending / limitations

- [ ] **Live rehearsal with Alaa and Nagham:** they could not join this session. Their explanation of their own work and the overall flow has not been verified.
- [ ] **Every member's English presentation and understanding:** use the questions and scripts in DEMO.md, then record actual participation. Prepared scripts are not proof of understanding.
- No required feature or backend integration failure was observed in the completed live acceptance run. This is local verification, not a deployment or a guarantee for every environment.
- In-memory resets, single shared user, USD-only amounts, no live cross-tab push, and export-without-import are actual limitations (see README).
- Production build has a non-blocking large-bundle warning (~626 kB JavaScript / 200 kB compressed). NestJS development tooling emits a Node 24 child-process deprecation warning; compilation and startup succeed.
- Browser automation was run in Chrome on Windows, not Firefox/Safari or physical mobile devices. Bundled tools needed permission outside the Windows sandbox for dependency-cache access, Vite builds, and browser execution; normal project commands are documented.
- No changes have been committed, pushed, or deployed in this task.

## Evidence and repeatability

- `finora/client/tests/live.browser.mjs`: starts clean production processes, executes A-D against NestJS, checks exports and responsive layouts, simulates real server loss/restart, and shuts down its own processes. It refuses occupied ports.
- `finora/client/node_modules/.cache/live-checks/results.json`: successful run log; neighboring files contain screenshots and downloaded workbooks. These generated artifacts are local and ignored by Git.
- `finora/client/tests/*.test.ts`: API contract/error handling, note clearing, state transitions, calculations and workbook data.
- The older intercepted-response fixture suite is separate from real-backend verification. Its current result is recorded below after the regression run.

Rehearsal sign-off: **not performed**. Participants/date: **pending**.
