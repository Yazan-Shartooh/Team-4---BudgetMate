# Finora interface template

A local React + TypeScript design prototype inspired by Monarch's organized personal-finance experience, using the supplied Finora vector branding. Includes Dashboard, Income, Transactions, Budgets, Monthly Report, and About Us.

## Open the design

Open the included `finora-preview.html` in a modern browser. It is a standalone interactive preview; no installation is needed. The three PNG images show the main page designs.

## Run the editable source

Install Node.js, open this folder in a terminal, then run:

```
npm install
npm run dev
```

Open the local address shown. To validate and build: `npm run build`.

## Included interactions

- Fixed desktop sidebar and top navigation with the Finora logo, wordmark, and breadcrumbs. Mobile navigation opens from the menu button. The footer scrolls normally.
- Calculated monthly income, expenses, savings, savings rate, and all-time balance.
- Category spending statistics and budget warnings.
- Income form, income source breakdown, and filtered income log.
- Combined month, type, category, and text filters in the transaction log, including an empty state.
- Add, edit, and delete income or expense entries with validation; related totals update immediately.
- Set, update, or remove expense-category budgets, including on-track, near-limit, exceeded, and no-budget states.
- Monthly report and genuine `.xlsx` export. Log exports follow current filters; dashboard/report exports include the selected month plus summary and budget sheets.

## Scope and sample data

This is a frontend design template, not the complete assignment implementation. Data is fictional, in React memory, and resets on browser reload. The sample is anchored to October 9, 2026, with 27 transactions spanning September and October. One currency (USD), six expense categories, and three income categories are used. No database, authentication, bank integrations, or cloud deployment is included.

For the final assignment, connect the UI to a NestJS backend with in-memory collections and server-side validation. That server must retain changes across page refreshes until the server restarts. Update the date validation to your actual runtime date. The standalone preview intentionally does not implement that backend.

Optional browser WebMCP tools expose navigation and summary reading when the browser supports them. Supported-context validation was not available in the local browser; ordinary page controls work independently.

## Design files

- `src/App.tsx`: views and interactions.
- `src/data.ts`: fictional transactions, budgets, formatting, and calculations.
- `src/style.css`: colors, layouts, and responsive styles.
- `public/`: transparent vector brand assets.

Typography uses DM Sans and Manrope from Google Fonts when online, with system sans-serif fallback. The interface and data interactions also work offline in the standalone preview.
