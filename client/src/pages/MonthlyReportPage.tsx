import { useState } from "react";
import { useFinance } from "../store/hooks";
import {
  getCurrentMonth,
  selectBudgetUsage,
  selectExpenseBreakdown,
  selectLargestSpendingCategory,
  selectMonthlySummary,
  selectFilteredTransactions,
} from "../store/selectors";
import MonthlyReportSection from "../components/MonthlyReportSection";
import type { MonthlyReportSectionProps } from "../components/MonthlyReportSection";

export default function MonthlyReportPage(props: {
  report?: MonthlyReportSectionProps;
}) {
  const { state, actions } = useFinance();
  const [month, setMonth] = useState(getCurrentMonth);
  if (props.report) return <MonthlyReportSection {...props.report} />;
  const transactionState = state.transactions;
  const budgets = state.budgets;
  const summary = selectMonthlySummary(state, month);
  const breakdown = selectExpenseBreakdown(state, month);
  const largestCategory = selectLargestSpendingCategory(state, month);
  const budgetRows = selectBudgetUsage(state, month);
  const transactions = selectFilteredTransactions(state, {
    type: "all",
    category: "all",
    month,
    query: "",
  });
  const statuses = [transactionState.fetch.status, budgets.fetch.status];
  const status = statuses.includes("pending")
    ? "pending"
    : statuses.includes("failed")
      ? "failed"
      : statuses.includes("idle")
        ? "idle"
        : "succeeded";
  return (
    <MonthlyReportSection
      month={month}
      onMonthChange={setMonth}
      summary={summary}
      breakdown={breakdown}
      largestCategory={largestCategory}
      budgetRows={budgetRows}
      transactions={transactions}
      status={status}
      error={transactionState.fetch.error ?? budgets.fetch.error}
      pending={
        transactionState.mutation.status === "pending" ||
        budgets.mutation.status === "pending"
      }
      onRetry={() => {
        void actions.fetchTransactions();
        void actions.fetchBudgets();
      }}
    />
  );
}
