import { useState } from "react";
import { Link } from "react-router-dom";
import { useFinance } from "../store/hooks";
import {
  getCurrentMonth,
  selectAllTimeBalance,
  selectBudgetAlerts,
  selectExpenseBreakdown,
  selectLargestSpendingCategory,
  selectMonthlySummary,
  selectRecentTransactions,
} from "../store/selectors";
import { pageRoutes } from "../types";
import CategoryBreakdown from "../components/CategoryBreakdown";
import BudgetStatus from "../components/BudgetStatus";
import EmptyState from "../components/EmptyState";
import ErrorMessage from "../components/ErrorMessage";
import LoadingMessage from "../components/LoadingMessage";
import MonthFilter from "../components/MonthFilter";
import TransactionTable from "../components/TransactionTable";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function DashboardPage() {
  const { state, actions } = useFinance();
  const [month, setMonth] = useState(getCurrentMonth);
  const transactionState = state.transactions;
  const budgetState = state.budgets;
  const summary = selectMonthlySummary(state, month);
  const allTimeBalance = selectAllTimeBalance(state);
  const breakdown = selectExpenseBreakdown(state, month);
  const largestCategory = selectLargestSpendingCategory(state, month);
  const alerts = selectBudgetAlerts(state, month);
  const recent = selectRecentTransactions(state, 5);
  const statuses = [transactionState.fetch.status, budgetState.fetch.status];
  const status = statuses.includes("pending")
    ? "pending"
    : statuses.includes("failed")
      ? "failed"
      : statuses.includes("idle")
        ? "idle"
        : "succeeded";
  const pending =
    transactionState.mutation.status === "pending" ||
    budgetState.mutation.status === "pending";
  const error = transactionState.fetch.error ?? budgetState.fetch.error;
  const retry = () => {
    void actions.fetchTransactions();
    void actions.fetchBudgets();
  };

  return (
    <section
      className="dashboard-section page-stack"
      aria-labelledby="dashboard-title"
      aria-busy={status === "pending" || pending}
    >
      <div className="page-heading">
        <div>
          <p className="eyebrow">Your money, in one view</p>
          <h1 id="dashboard-title">Dashboard</h1>
          <p>Track this month alongside your overall balance.</p>
        </div>
        <MonthFilter
          id="dashboard-month"
          label="Month"
          value={month}
          onChange={setMonth}
          disabled={pending}
        />
      </div>
      {status === "idle" && (
        <div className="feedback">
          <p>Your financial data have not loaded yet.</p>
          <button
            type="button"
            className="button button--secondary"
            onClick={retry}
          >
            Load dashboard
          </button>
        </div>
      )}
      {status === "pending" && (
        <LoadingMessage message="Loading your financial overview…" />
      )}
      {status === "failed" && (
        <ErrorMessage
          message={error?.message ?? "Unable to load the dashboard."}
          onRetry={retry}
          pending={pending}
        />
      )}
      {status === "succeeded" && (
        <>
          {summary.transactionCount === 0 && (
            <EmptyState
              title="No transactions this month"
              description="Monthly totals are zero. Your all-time balance and recent activity remain available below."
            />
          )}
          <div className="dashboard-stats">
            <section className="card dashboard-stat">
              <div className="dashboard-stat-heading">
                <h2>Income</h2>
              </div>
              <p className="dashboard-stat-value amount amount--positive">
                {money.format(summary.income)}
              </p>
            </section>
            <section className="card dashboard-stat">
              <div className="dashboard-stat-heading">
                <h2>Expenses</h2>
              </div>
              <p className="dashboard-stat-value amount">
                {money.format(summary.expenses)}
              </p>
            </section>
            <section className="card dashboard-stat dashboard-stat--savings">
              <div className="dashboard-stat-heading">
                <h2>Savings</h2>
              </div>
              <p className="dashboard-stat-value amount">
                {money.format(summary.savings)}
              </p>
              <p className="dashboard-stat-meta">
                Savings rate:{" "}
                {summary.savingsRate === null
                  ? "N/A"
                  : `${summary.savingsRate.toFixed(1)}%`}
                {summary.overspent ? " · Overspent" : ""}
              </p>
            </section>
          </div>
          <div className="dashboard-balance">
            <span>All-time balance</span>
            <strong className="amount">{money.format(allTimeBalance)}</strong>
          </div>
          <div className="dashboard-grid">
            <section
              className="card"
              aria-labelledby="dashboard-spending-title"
            >
              <div className="card-heading">
                <h2 id="dashboard-spending-title">Spending by category</h2>
                <Link to={pageRoutes.report}>View report</Link>
              </div>
              {largestCategory && (
                <p className="report-note">
                  Largest category: <strong>{largestCategory.category}</strong>{" "}
                  · {money.format(largestCategory.amount)} (
                  {largestCategory.percentage.toFixed(1)}%).
                </p>
              )}
              <CategoryBreakdown rows={breakdown} />
            </section>
            <section className="card" aria-labelledby="dashboard-alerts-title">
              <div className="card-heading">
                <h2 id="dashboard-alerts-title">Budget alerts</h2>
                <Link to={pageRoutes.budgets}>Manage budgets</Link>
              </div>
              {alerts.length ? (
                <ul className="dashboard-spending-list">
                  {alerts.map((alert) => (
                    <li
                      className="dashboard-spending-row"
                      key={`${alert.month}-${alert.category}`}
                    >
                      <span>
                        {alert.category} · Spent {money.format(alert.spent)}
                      </span>
                      <BudgetStatus
                        status={alert.status}
                        exceeded={alert.exceeded}
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No categories are near or over their budget this month.</p>
              )}
            </section>
          </div>
          <section
            className="card dashboard-recent"
            aria-labelledby="dashboard-recent-title"
          >
            <div className="card-heading">
              <h2 id="dashboard-recent-title">Recent transactions</h2>
              <Link to={pageRoutes.transactions}>View transactions</Link>
            </div>
            <TransactionTable
              transactions={recent}
              caption="Five most recent transactions"
              readOnly
              emptyTitle="No transactions yet"
              emptyDescription="New activity will appear here."
            />
          </section>
        </>
      )}
    </section>
  );
}
