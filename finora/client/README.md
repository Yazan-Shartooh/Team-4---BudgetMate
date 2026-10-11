# Finora frontend

React + TypeScript application shell based on the Finora design template.

## Run locally

Requires Node.js 22.12+ (Node 24 is also supported) and npm.

```sh
cd finora/client
npm ci
npm run dev
```

Open the local URL printed by Vite.

```sh
npm run build
npm run lint
npm run preview
```

The build outputs to `dist/`. Configure production hosting to serve
`index.html` for non-asset application URLs. Vite development/preview
already supports direct routes and refresh.

## Routes

| Path | View |
| --- | --- |
| / | Dashboard |
| /income | Income |
| /transactions | Transactions |
| /transactions/new | Add transaction |
| /transactions/new?type=income | Add income |
| /budgets | Budgets |
| /reports/monthly | Monthly report |
| /about | About us |
| Any unknown path | Not found |

All feature views are explicitly marked placeholders. The Add Transaction
route does not save data yet. No financial records, API calls, Redux
store/provider, or persistence are implemented in this shell task.
Redux dependencies are installed for the next integration steps.

## Team integration

- Replace placeholder page content while keeping the documented routes.
- Alaa owns the shared transaction form and will replace AddTransactionPage's
  placeholder with that form. The income query selects income; other query
  values default to expense.
- Leave financial state and derived calculations to the agreed store/API work.
- Molham owns `src/index.css`, the only stylesheet, imported in `main.tsx`.
- Use class names and tokens from [UI-CONTRACT.md](../UI-CONTRACT.md).
- Shared behavioral components such as Modal remain the feature owner's work;
  this task provides their CSS, not their implementation.
- Fonts load from Google Fonts when available and fall back to system fonts.
  Branding assets are served locally.

The mobile navigation supports Escape, focus containment, focus restoration,
an inert background, and closing after navigation or a desktop resize.
Route changes update the document title and focus the main content.

## Verified shell behavior

- Production build and ESLint pass.
- All routes, including the income query and unknown URLs, support direct
  entry and refresh; links, active states, and browser history work.
- No page-level horizontal overflow across routes at 320, 360, 390, 640,
  768, 1024, 1440, and 1920px viewport widths.
- Mobile drawer focus containment, Escape restoration, route-change close,
  desktop resize, and short-landscape scrolling pass browser checks.
- Shared table overflow stays inside its wrapper; long native dialogs
  remain inside the phone viewport and scroll internally.
- Reduced-motion behavior and desktop/mobile screenshots were checked.

These checks cover the shell and styling, not unimplemented financial flows.
