# Finora client

Use the repository [setup guide](../../README.md) for the actual API configuration and commands, [demo guide](../../docs/DEMO.md) for the ready seed sequence and English sections, and [final checklist](../../docs/FINAL-CHECKLIST.md) for current verification.

The app uses React + TypeScript, React Context/useReducer for shared records, pure selectors for calculations, React Router, and SheetJS for Excel export. All styling is in `src/index.css`, imported once by `src/main.tsx`.

Routes: `/`, `/income`, `/transactions`, `/transactions/new` (also accepts `?type=income`), `/budgets`, `/reports/monthly`, `/about`, plus a Not Found view.

`npm test`, `npm run lint`, and `npm run build` run the client checks. `tests/live.browser.mjs` verifies the production UI against NestJS. The older `tests/features.browser.mjs` is a separate intercepted-response fixture suite for UI edge cases; it is not evidence of backend integration. To run it, start Vite on 5178 with `VITE_API_BASE_URL=/test-api`, then run the script with Playwright and Chrome available. Never use `/test-api` for the demo or a production build.
