// Isolated browser-test entry. Production main.tsx/store wiring are unchanged.
import { useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { FinanceProvider } from "../src/store/store";
import IncomePage from "../src/pages/IncomePage";
import DashboardPage from "../src/pages/DashboardPage";
import TransactionsPage from "../src/pages/TransactionsPage";
import BudgetsPage from "../src/pages/BudgetsPage";
import MonthlyReportPage from "../src/pages/MonthlyReportPage";
import BudgetTable from "../src/components/BudgetTable";
import { useFinance } from "../src/store/hooks";
import { getCurrentMonth, selectBudgetUsage } from "../src/store/selectors";
import "../src/index.css";

export function Fixture() {
  const [page, setPage] = useState("transactions");
  const { state } = useFinance();
  const rows = selectBudgetUsage(state, getCurrentMonth());
  return (
    <main className="page-stack">
      <nav aria-label="Test pages">
        <button
          type="button"
          className="button"
          onClick={() => setPage("transactions")}
        >
          Transactions test
        </button>
        <button
          type="button"
          className="button"
          onClick={() => setPage("income")}
        >
          Income test
        </button>
        <button
          type="button"
          className="button"
          onClick={() => setPage("dashboard")}
        >
          Dashboard test
        </button>
        <button
          type="button"
          className="button"
          onClick={() => setPage("budgets")}
        >
          Budgets test
        </button>
        <button
          type="button"
          className="button"
          onClick={() => setPage("readonly")}
        >
          Read-only test
        </button>
        <button
          type="button"
          className="button"
          onClick={() => setPage("report")}
        >
          Report test
        </button>
      </nav>
      {page === "transactions" ? (
        <TransactionsPage />
      ) : page === "income" ? (
        <IncomePage />
      ) : page === "dashboard" ? (
        <DashboardPage />
      ) : page === "budgets" ? (
        <BudgetsPage />
      ) : page === "report" ? (
        <MonthlyReportPage />
      ) : (
        <BudgetTable rows={rows} readOnly />
      )}
    </main>
  );
}
createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <FinanceProvider>
      <Fixture />
    </FinanceProvider>
  </BrowserRouter>,
);
