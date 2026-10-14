# Finora client

Use the repository [setup guide](../../README.md) for the actual API configuration and commands, [demo guide](../../docs/DEMO.md) for the ready seed sequence and English sections, and [final checklist](../../docs/FINAL-CHECKLIST.md) for current verification.

The app uses React + TypeScript, React Context/useReducer for shared records, pure selectors for calculations, React Router, and SheetJS for Excel export. All styling is in `src/index.css`, imported once by `src/main.tsx`.

Routes: `/`, `/income`, `/transactions`, (also accepts `?type=income`), `/budgets`, `/reports/monthly`, `/about`, plus a Not Found view.

`npm run lint` and `npm run build` run the client checks.
