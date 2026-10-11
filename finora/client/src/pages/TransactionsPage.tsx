import { useContext, useState } from 'react';
import type { ComponentType } from 'react';
import { ReactReduxContext } from 'react-redux';
import type { MonthFilterProps, TransactionFilters } from '../types';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { selectFilteredTotals, selectFilteredTransactions } from '../store/selectors';
import { clearTransactionMutationState, createTransaction, deleteTransaction, fetchTransactions, updateTransaction } from '../store/transactionsSlice';
import TransactionsSection from '../components/TransactionsSection';
import ErrorMessage from '../components/ErrorMessage';

interface TransactionsPageProps { MonthFilterComponent?: ComponentType<MonthFilterProps> }
function ConnectedTransactionsPage({ MonthFilterComponent }: TransactionsPageProps) {
  const dispatch = useAppDispatch();
  const [filters, setFilters] = useState<TransactionFilters>({ type: 'all', category: 'all', month: '', query: '' });
  const data = useAppSelector((state) => state.transactions);
  const rows = useAppSelector((state) => selectFilteredTransactions(state, filters));
  const totals = useAppSelector((state) => selectFilteredTotals(state, filters));
  return <TransactionsSection transactions={rows} totals={totals} totalCount={data.items.length} filters={filters} onFiltersChange={setFilters}
    status={data.fetch.status} error={data.fetch.error} pending={data.mutation.status === 'pending'} mutationError={data.mutation.error}
    onRetry={() => { void dispatch(fetchTransactions()); }} onClearMutation={() => { dispatch(clearTransactionMutationState()); }}
    onCreate={async (input) => { await dispatch(createTransaction(input)).unwrap(); }}
    onUpdate={async (transaction, changes) => { await dispatch(updateTransaction({ id: transaction.id, changes })).unwrap(); }}
    onDelete={async (id) => { await dispatch(deleteTransaction(id)).unwrap(); }} MonthFilterComponent={MonthFilterComponent} />;
}

export default function TransactionsPage(props: TransactionsPageProps) {
  const redux = useContext(ReactReduxContext);
  return <div className="transactions-page">{redux ? <ConnectedTransactionsPage {...props} /> : <>
    <div className="page-heading"><div><h1>Transactions</h1><p>Your money in motion. Every detail in one place.</p></div></div>
    <ErrorMessage message="Transactions are unavailable while the application connection is being completed. Please try again later." />
  </>}</div>;
}
