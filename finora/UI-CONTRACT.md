# Finora UI contract

## Shell implementation status

The app shell and shared stylesheet are now implemented in `client/`.
The values below remain the design baseline; `client/src/index.css` is
the source of truth for implemented token values. Semantic foregrounds
were darkened for readability; controls are at least 44px tall.
At mobile widths the drawer is 260px wide, capped to leave a backdrop gutter.
Feature-specific classes provide initial styling for later components.
Financial behavior and shared Modal/feedback component implementations are
still separate tasks. Page content is explicitly marked as placeholder.

Added shell/placeholder classes:

| Classes | Use |
| --- | --- |
| app-brand-group, app-topbar-actions, app-add-transaction | Header grouping and always-visible transaction link |
| app-sidebar-heading, app-sidebar-bottom | Drawer heading and lower navigation |
| app-content, page-stack | Constrained content and vertical page spacing |
| placeholder-intro, placeholder-symbol, placeholder-note | Explicit route placeholder content |
| feature-grid, feature-card, feature-number | Responsive feature overview cards |
| badge | Neutral informational badge |
| navigation-open | Body scroll lock while the mobile drawer is open |

Additional tokens: `--avatar-size`, `--placeholder-symbol-size`,
`--reading-width`, `--table-min-width`, and `--font-size-hero`.

### Using the shared styles

- Buttons: compose `button` with `button--primary`, `button--secondary`,
  `button--light`, or `button--danger`.
- Inputs: place a visible label and control within `field`. Use
  `field-hint`/`field-error` with `aria-describedby` and
  `aria-invalid`. Group fields with `form-grid`.
- Cards: use `card` and `card-heading`; feature content controls its padding.
- Tables: wrap a semantic table in `table-scroll`. Give the wrapper
  `tabIndex={0}`, `role="region"`, and an accessible name when horizontal
  scrolling is possible so keyboard users can scroll it.
- Dialogs: use a native `dialog.modal` with `modal-content`,
  `modal-heading`, and `modal-actions`; open it with `showModal()`.
  CSS alone does not implement focus, dismissal, or pending-state behavior.
- Feedback: compose `feedback` with `feedback--loading`,
  `feedback--error`, or `feedback--empty`; apply appropriate live-region
  roles in the component.
- Toasts: `toast-queue` contains `toast` plus success/error/info modifiers.
- Budgets: compose `budgets-status` with the documented status modifier.
  Always include visible status text.
- Progress: use `progress.progress` with an accessible name and numeric
  value/max attributes; no inline width or custom-property assignment.

The existing registry and contracts below remain the team agreement.

This document defines the shared class/token agreement. Molham alone edits `client/src/index.css`, imported once from main.tsx. No other CSS files, modules, styled-components, inline style objects, runtime style injection, or per-element custom-property assignments. Other owners submit exact class/token requests in their task reports.

## Visual baseline

Preserve `finora-template` branding and public SVG assets, DM Sans body typography, Manrope headings, navy text, teal actions, pale page background, white bordered cards, dark green savings card, fixed topbar/sidebar and roomy content layout. Refer to all three supplied screenshots and template source when implementing each view. The dashboard image was inspected for this contract. Keep the template's hierarchy: heading/actions, three summary cards, all-time balance strip, spending/budget alert columns and recent table. Use native progress and semantic lists for required spending breakdowns; the decorative donut and optional export can wait until core behavior works.

Existing template variables `--navy`, `--teal`, `--muted`, `--border` remain available as aliases to the tokens below. Template global names such as `.stats`, `.saving`, `.filters`, `.source-item` become the scoped names listed here; shared primitives intentionally keep shared names. Do not blindly copy preview-only wording or inline styles.

## Color tokens (initial template values)

| Variable | Value / purpose |
| --- | --- |
| --color-navy | #05244b, Finora navy |
| --color-text | #18324e, primary text |
| --color-teal | #008b7b, brand teal |
| --color-primary / --color-primary-hover | #008a79 / #007365, primary actions |
| --color-muted | #778595, secondary text |
| --color-page / --color-surface | #f5f7f9 / #ffffff |
| --color-border / --color-control-border | #e6ebef / #dce3e8 |
| --color-active-bg / --color-active-text | #e9f6f2 / #007e70 |
| --color-savings-bg / --color-savings-text | #063730 / #ffffff |
| --color-savings-muted | #9ac4b8 |
| --color-balance-bg | #eaf0f4 |
| --color-focus | #42b9aa |
| --color-positive | #008e78 |
| --color-track-bg / --color-track-text | #e8f5ed / #448368 |
| --color-near-bg / --color-near-text | #fbf2dc / #a68846 |
| --color-exceeded-bg / --color-exceeded-text | #faeae5 / #ba6b55 |
| --color-unbudgeted-bg / --color-unbudgeted-text | #edf2f5 / #788894 |
| --color-danger / --color-error-bg | #b96d58 / #fff0eb |
| --color-progress-track | #eff2f4 |
| --color-progress-near / --color-progress-exceeded | #d3a458 / #ca745b |
| --color-scrim | #05244b50 |
| --color-food / --color-transport / --color-housing | #00a795 / #6f91cc / #173e69 |
| --color-bills / --color-health / --color-entertainment | #95cfc5 / #e6b86b / #b29ed9 |
| --color-shopping / --color-income | #008b7b / #008b7b (existing brand fallback for additional categories) |

These are source values, not a contrast certification. Molham must check text/focus contrast and adjust semantic foreground tokens within the brand palette where necessary; do not copy the template's very light small text without checking it. Status meaning always includes a text label.

## Typography, spacing, size and layout tokens

| Variable(s) | Initial value(s) |
| --- | --- |
| --font-body / --font-heading | 'DM Sans', sans-serif / 'Manrope', sans-serif |
| --font-size-xs / --font-size-sm / --font-size-base | 12px / 14px / 16px |
| --font-size-section / --font-size-title / --font-size-stat | 17px / 30px / 32px |
| --font-weight-normal / --font-weight-medium / --font-weight-semibold / --font-weight-bold | 400 / 500 / 600 / 800 |
| --line-height-body / --line-height-heading | 1.6 / 1.35 |
| --letter-spacing-title / --letter-spacing-eyebrow | -1.1px / 1.5px |
| --space-0 / --space-1 / --space-2 / --space-3 / --space-4 | 0 / 4px / 8px / 12px / 16px |
| --space-5 / --space-6 / --space-7 / --space-8 / --space-9 / --space-10 | 20px / 24px / 28px / 32px / 40px / 48px |
| --radius-control / --radius-card / --radius-dialog / --radius-pill | 7px / 12px / 16px / 999px |
| --border-width / --focus-width / --focus-offset | 1px / 3px / 3px |
| --shadow-control / --shadow-dialog | 0 3px 12px #05244b0d / 0 30px 100px #05244b35 |
| --header-height / --sidebar-width / --content-max-width | 82px / 244px / 1900px |
| --content-offset / --page-padding-inline / --page-padding-top | var(--sidebar-width) / 40px / 124px |
| --control-height / --input-height / --dialog-width | 40px / 46px / 520px |
| --dialog-gutter / --dialog-padding / --card-padding | 15px / 30px / 25px |
| --brand-icon-size / --wordmark-width / --wordmark-height | 38px / 104px / 28px |
| --progress-height / --category-icon-size | 5px / 36px |
| --grid-gap / --summary-columns / --dashboard-columns / --form-columns | 22px / repeat(3, minmax(0, 1fr)) / minmax(0, 1.5fr) minmax(0, 1fr) / repeat(2, minmax(0, 1fr)) |
| --sidebar-visibility / --mobile-toggle-display | visible / none |
| --z-sidebar / --z-scrim / --z-header / --z-toast | 25 / 24 / 30 / 100 |
| --transition-duration | 180ms |

Use these tokens for corresponding properties, and add meaningful tokens centrally for any additional palette, spacing, font or size values rather than scattering literals across rules. Zero, percentages, intrinsic sizing and structural grid keywords need not each become tokens. All state variants are fixed classes/data attributes styled in index.css.

## Responsive contract

CSS custom properties do not work as ordinary media-query conditions. Use literal thresholds and update the layout tokens inside the query. Initial assignments, refined by visual checks:

| Query | Layout token changes |
| --- | --- |
| min-width: 1500px | --page-padding-inline: 54px |
| max-width: 1200px | --sidebar-width: 220px; --page-padding-inline: 26px; --page-padding-top: 112px; --dashboard-columns: minmax(0, 1.3fr) minmax(0, 1fr) |
| max-width: 900px | --sidebar-width: 190px; --page-padding-inline: 22px; --dashboard-columns: minmax(0, 1fr) |
| max-width: 640px | --header-height: 70px; --sidebar-width: 235px; --content-offset: 0px; --page-padding-inline: 18px; --page-padding-top: 100px; --summary-columns: minmax(0, 1fr); --form-columns: minmax(0, 1fr); --sidebar-visibility: hidden; --mobile-toggle-display: inline-flex |
| max-width: 400px | --page-padding-inline: 12px; --dialog-padding: 20px; --grid-gap: 16px |
| prefers-reduced-motion: reduce | --transition-duration: 0ms |

Navigation's open state overrides mobile sidebar visibility; hidden navigation must not remain keyboard-focusable. Contain table overflow in `.table-scroll`, allow action/filter wrapping, use min-width:0 on grid children, keep dialogs within viewport width/height with internal scrolling, and avoid page-level horizontal scrolling. Verify at 360, 390, 768, 1024 and 1440px, short landscape, and 200% zoom when implemented.

## Class registry

| Owner / component | Classes |
| --- | --- |
| Molham: App, Navbar, Sidebar, Breadcrumbs, Footer | app-shell, app-topbar, app-brand, app-wordmark, app-breadcrumbs, app-sidebar, app-sidebar--open, app-nav, app-nav-link, app-nav-link--active, app-workspace-label, app-side-note, app-profile, app-avatar, app-mobile-toggle, app-scrim, app-main, app-footer, app-skip-link |
| Molham: page headings / shared primitives | page-heading, page-heading-actions, eyebrow, card, card-heading, button, button--primary, button--secondary, button--light, button--danger, icon-button, text-button, field, field-hint, field-error, form-grid, table-scroll, table-caption, amount, amount--positive, text-muted, text-right, sr-only, progress |
| Molham: DashboardPage/Section, StatCard, BalanceSummary | dashboard-page, dashboard-section, dashboard-stats, dashboard-stat, dashboard-stat--savings, dashboard-stat-heading, dashboard-stat-icon, dashboard-stat-value, dashboard-stat-meta, dashboard-balance, dashboard-balance-note, dashboard-grid |
| Molham: SpendingChart, BudgetAlerts, RecentTransactions | dashboard-spending, dashboard-spending-list, dashboard-spending-row, dashboard-budget-alerts, dashboard-budget-alert, dashboard-recent |
| Alaa: TransactionsPage/Section | transactions-page, transactions-section, transactions-summary, transactions-log, transactions-count, transactions-footer |
| Alaa: TransactionFilters, TransactionTable | transactions-filters, transactions-search, transactions-table, transactions-name, transactions-category, transactions-actions |
| Alaa: TransactionForm, DeleteTransactionModal | transactions-form, transactions-type-switch, transactions-type-option, transactions-type-option--selected, transactions-delete-copy |
| Alaa: BudgetsPage/Section, BudgetForm/Table/Status | budgets-page, budgets-section, budgets-intro, budgets-key, budgets-form, budgets-table, budgets-actions, budgets-usage, budgets-status, budgets-status--on-track, budgets-status--near-limit, budgets-status--exceeded, budgets-status--no-budget |
| Alaa: Modal, feedback, notifications | modal, modal-content, modal-heading, modal-actions, feedback, feedback--loading, feedback--error, feedback--empty, toast-queue, toast, toast--success, toast--error, toast--info |
| Nagham: MonthFilter (shared across features) | month-filter, month-filter-label, month-filter-input |
| Nagham: IncomePage/Section/Sources | income-page, income-section, income-overview, income-total, income-caption, income-sources, income-source, income-source-name, income-source-value, income-log |
| Nagham: MonthlyReportPage/Section, CategoryBreakdown | report-page, report-section, report-summary, report-note, report-note--overspent, report-breakdown, report-category, report-category-amount, report-budget-comparison |
| Molham: About / NotFound | about-page, about-values, about-team, not-found-page |

Income deliberately reuses `transactions-*` classes on Alaa's shared components. Report deliberately reuses `budgets-*` classes on its read-only table. Do not duplicate these under feature-specific names. Shared cards and buttons are composed with feature root classes. New optional export classes are deferred until core acceptance.

## Dynamic data and accessibility

Use native `<progress max={100} value={...}>` for percentage bars, with a visible label or aria-label. Clamp only the bar value to 0-100; display the true usage (including over 100%) and exceeded amount in adjacent text. Zero is an explicit zero value, not an indeterminate bar. No-budget usage displays No budget and omits the budget progress element. Amounts/percentages belong in HTML text/attributes, not style objects or generated CSS.

Optional category icons/colors use `.category-icon` plus a validated `data-category` literal, with fixed mappings in index.css to the category tokens. Status styling uses the explicit budgets-status modifiers. Do not inject raw user strings into class names or selectors.

Use headings in order, main/nav/section landmarks, semantic tables with captions and scoped headers, visible input labels, aria-describedby for errors, aria-current=page on active navigation, aria-expanded/aria-controls on mobile navigation, a skip link, and a visible focus ring. Never rely on color alone. Pending buttons use disabled and text indicating the operation; mark the affected region aria-busy. Initial loading, failed fetch, successful empty data and filtered-no-results are distinct visible states. Dialog behavior follows FRONTEND-CONTRACT.md.
