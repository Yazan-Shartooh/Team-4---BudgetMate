# Finora demo and English presentation

## Reset and prepare

Start both applications using the root README. Restart only the API to return to the initial data. Dates are generated for the server's current month (M), previous month (M-1), and two months ago (M-2); never change the clock or type a fixed template date. Use day 01 of M for demo entries, which is always valid. There are 32 transactions and six budgets.

| Month | Income | Expenses | Savings | Savings rate |
| --- | ---: | ---: | ---: | ---: |
| M | $1,500.00 | $858.50 | $641.50 | 42.8% |
| M-1 | $1,500.00 | $967.90 | $532.10 | 35.5% |
| M-2 | $1,000.00 | $1,140.00 | -$140.00 | -14.0% |

Initial all-time balance: **$1,033.60**. In M: Food spent $185.50 / $300 (61.8%, On track), Transport $83 / $100 (83%, Near limit), Entertainment $95 / $80 (118.8%, Exceeded by $15). Housing is the largest expense category. Unbudgeted expenses still count.

## Repeatable walkthrough (about 8 minutes)

1. **Yazan:** Open Dashboard, explain the problem and introduce the six members. Confirm the initial figures above.
2. **Mulham:** Show the sidebar, shared totals and About. Explain that browser refresh reloads the current server records, while server restart resets them. Show the all-time balance separately from monthly savings.
3. **Alaa / A:** Open Add transaction. Try amount `0` and show its rejection. Enter an expense of `20`, Food, M-01, note `Demo groceries`. Save. Expenses become $878.50, savings $621.50, all-time balance $1,013.60, Food spending $205.50. Refresh and verify the record remains.
4. **Alaa / B:** Edit Demo groceries to `30`: expenses $888.50, savings $611.50, Food $215.50. Delete it through confirmation. All figures return to the initial values.
5. **Alaa / C:** On Budgets for M, edit Food to `200`, set Health to `100`, and Shopping to `50`. Add a Food expense of `20`, note `Demo budget crossing`. Food now shows $205.50 spent and Exceeded by $5.50. Edit its budget to `250`: Near limit at 82.2%. Remove Food's budget: No budget, but $205.50 spending remains. Leave this expense in place.
6. **Nagham:** On Income, add Freelance income `50`, M-01, note `Demo freelance`. Current income becomes $1,550, expenses $878.50, savings $671.50, savings rate 43.3%, all-time balance $1,063.60. Explain that Income and Transactions share records. Export the current month's income.
7. **Nagham / D:** On Monthly report, show M ($1,550 / $878.50 / $671.50). Switch to M-1 (table above), then M-2 (overspent), then a month four months ago (zeros and N/A savings rate). Return to M and export the report. Its sheets are Summary, Transactions, and Budget comparison; category spending is in Summary.
8. **Hamid and Esmaeel:** Explain server validation and the request/response path. On Transactions combine Expense + Food + M; export the four displayed rows. Clear filters. Explain error/retry behavior and close with known limitations. Restart the API after the demo to prepare the next run.

## Each member's English section

These sections follow the project PDF, frontend ownership notes, and repository history. Each member should adjust the wording to match the work they personally performed; scripts are preparation, not proof of authorship or understanding.

**Yazan Shartouh — team leader, project coordination and seed data**

“Finora helps a person understand where their money goes. We record income and expenses, compare spending with monthly budgets, and show savings. I coordinated the project and helped prepare and integrate the prototype and sample data. Our sample months demonstrate normal spending, a budget warning, an exceeded budget, and negative savings.”

**Hamid Al Haj — NestJS backend**

“My section is the backend API. Controllers receive HTTP requests, validation checks the input, and services manage records in memory. We reject invalid amounts, dates and categories. A browser refresh reads the same running server, so changes remain visible. Restarting the server restores the sample data. No database is used.”

**Esmaeel Mahfoud — integration and project assembly**

“My section is connecting the application pieces. The frontend sends requests to the NestJS API and updates shared state only after a successful response. Transaction edits use PATCH, budget saves use PUT, and deletes return no content. We align the API address, allowed browser origins, categories and validation rules so the screens work together.”

**Mulham Al Kasir — frontend foundation, shared calculations and design**

“My section is the application shell, navigation, dashboard, shared calculations and Finora styling. All CSS is in one file. Monthly savings are income minus expenses for one month, while the overall balance uses the full history. The screens derive their values from the same records. About explains the team and the limits of in-memory data.”

**Alaa Ismaiel — transactions, budgets and feedback**

“My section is recording and correcting transactions and managing budgets. The form rejects zero or negative amounts, extra decimal places and future dates. Editing or deleting a transaction recalculates the affected views. Budgets are unique for a category and month. Below 80 percent is On track; 80 through 100 percent is Near limit; above 100 percent is Exceeded. We allow real spending even when it exceeds a budget.”

**Nagham Jaza — income, reports, month controls and export**

“My section is the Income view and monthly reports. Income uses the same transaction records and forms. When I change the report month, totals, category percentages and budget comparisons all change. Savings can be negative. If income is zero, the savings rate is N/A. Excel exports contain the currently filtered records or the selected report month.”

## Rehearsal and understanding check — pending people

Alaa and Nagham could not join this session, so **no live team rehearsal or individual understanding has been verified**. The automated walkthrough verifies software behavior only.

Before presenting, each of the six members must speak their section and answer without reading:

- What happens from clicking Save until every screen updates? (Form validation -> API -> service validation -> in-memory record -> response -> shared state -> derived views.)
- What survives browser reload? What resets on server restart?
- Why do monthly savings and all-time balance differ?
- What happens at exactly 80%, exactly 100%, and above 100% of a budget?
- Why does removing a budget leave expense totals unchanged?
- What appears when income is zero or the selected month has no transactions?

Alaa: perform A-C and one invalid case without help; explain category/month edits and duplicate budget updates. Nagham: perform D and income edits across months; compare downloaded workbook values with the screen. Have each explain the other's data flow. Record the rehearsal date and any corrections in FINAL-CHECKLIST.md only after the members actually participate.
