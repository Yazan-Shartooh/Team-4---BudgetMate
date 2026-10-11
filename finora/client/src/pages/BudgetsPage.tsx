import { useState } from "react";
import type { ComponentType } from "react";
import type { MonthFilterProps } from "../types";
import { useFinance } from "../store/hooks";
import { getCurrentMonth, selectBudgetUsage } from "../store/selectors";
import BudgetsSection from "../components/BudgetsSection";
import type { BudgetsSectionProps } from "../components/BudgetsSection";

interface BudgetsPageProps {
  MonthFilterComponent?: ComponentType<MonthFilterProps>;
  budgets?: BudgetsSectionProps;
}
export default function BudgetsPage(props: BudgetsPageProps) {
  const { state, actions } = useFinance();
  const [month, setMonth] = useState(getCurrentMonth);
  const transactions = state.transactions;
  const budgets = state.budgets;
  const rows = selectBudgetUsage(state, month);
  const statuses = [transactions.fetch.status, budgets.fetch.status];
  const status = statuses.includes("pending")
    ? "pending"
    : statuses.includes("failed")
      ? "failed"
      : statuses.includes("idle")
        ? "idle"
        : "succeeded";
  return (
    <BudgetsSection
      month={month}
      onMonthChange={setMonth}
      rows={rows}
      status={status}
      error={transactions.fetch.error ?? budgets.fetch.error}
      pending={
        budgets.mutation.status === "pending" ||
        transactions.mutation.status === "pending"
      }
      mutationError={budgets.mutation.error}
      onRetry={() => {
        void actions.fetchTransactions();
        void actions.fetchBudgets();
      }}
      onClearMutation={actions.clearBudgetMutationState}
      onSave={async (input) => {
        await actions.saveBudget(input);
      }}
      onRemove={async (id) => {
        await actions.deleteBudget(id);
      }}
      MonthFilterComponent={props.MonthFilterComponent}
    />
  );
}
