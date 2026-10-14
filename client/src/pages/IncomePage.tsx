import { useState } from "react";
import type { ComponentType } from "react";
import type { MonthFilterProps, TransactionFilters } from "../types";
import { useFinance } from "../store/hooks";
import {
  getCurrentMonth,
  selectFilteredTotals,
  selectFilteredTransactions,
  selectIncomeSources,
} from "../store/selectors";
import IncomeSection from "../components/IncomeSection";

interface IncomePageProps {
  MonthFilterComponent?: ComponentType<MonthFilterProps>;
}

export default function IncomePage({ MonthFilterComponent }: IncomePageProps) {
  const { state, actions } = useFinance();
  const [filters, setFilters] = useState<TransactionFilters>(() => ({
    type: "income",
    category: "all",
    month: getCurrentMonth(),
    query: "",
  }));
  const data = state.transactions;
  const rows = selectFilteredTransactions(state, filters);
  const totals = selectFilteredTotals(state, filters);
  const sources = selectIncomeSources(state, filters);
  const totalIncomeCount = selectFilteredTransactions(state, {
    type: "income",
    category: "all",
    month: "",
    query: "",
  }).length;

  return (
    <IncomeSection
      transactions={rows}
      sources={sources}
      total={totals.income}
      totalIncomeCount={totalIncomeCount}
      filters={filters}
      onFiltersChange={setFilters}
      status={data.fetch.status}
      error={data.fetch.error}
      pending={data.mutation.status === "pending"}
      mutationError={data.mutation.error}
      onRetry={() => {
        void actions.fetchTransactions();
      }}
      onClearMutation={actions.clearTransactionMutationState}
      onCreate={async (input) => {
        await actions.createTransaction(input);
      }}
      onUpdate={async (transaction, changes) => {
        await actions.updateTransaction({ id: transaction.id, changes });
      }}
      onDelete={async (id) => {
        await actions.deleteTransaction(id);
      }}
      MonthFilterComponent={MonthFilterComponent}
    />
  );
}
