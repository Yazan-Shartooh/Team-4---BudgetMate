import { useState } from "react";
import type { ComponentType } from "react";
import type { MonthFilterProps, TransactionFilters } from "../types";
import { useFinance } from "../store/hooks";
import {
  selectFilteredTotals,
  selectFilteredTransactions,
} from "../store/selectors";
import TransactionsSection from "../components/TransactionsSection";

interface TransactionsPageProps {
  MonthFilterComponent?: ComponentType<MonthFilterProps>;
}
export default function TransactionsPage({
  MonthFilterComponent,
}: TransactionsPageProps) {
  const { state, actions } = useFinance();
  const [filters, setFilters] = useState<TransactionFilters>({
    type: "all",
    category: "all",
    month: "",
    query: "",
  });
  const data = state.transactions;
  const rows = selectFilteredTransactions(state, filters);
  const totals = selectFilteredTotals(state, filters);
  return (
    <TransactionsSection
      transactions={rows}
      totals={totals}
      totalCount={data.items.length}
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
