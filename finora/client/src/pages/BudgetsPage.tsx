import { useContext, useState } from 'react';
import type { ComponentType } from 'react';
import { ReactReduxContext } from 'react-redux';
import type { MonthFilterProps } from '../types';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { getCurrentMonth, selectBudgetUsage } from '../store/selectors';
import { clearBudgetMutationState, deleteBudget, fetchBudgets, saveBudget } from '../store/budgetsSlice';
import { fetchTransactions } from '../store/transactionsSlice';
import BudgetsSection from '../components/BudgetsSection';
import type { BudgetsSectionProps } from '../components/BudgetsSection';
import ErrorMessage from '../components/ErrorMessage';

interface BudgetsPageProps { MonthFilterComponent?: ComponentType<MonthFilterProps>; budgets?: BudgetsSectionProps }
function ConnectedBudgetsPage({ MonthFilterComponent }: BudgetsPageProps) {
  const dispatch = useAppDispatch();
  const [month, setMonth] = useState(getCurrentMonth);
  const transactions = useAppSelector((state) => state.transactions);
  const budgets = useAppSelector((state) => state.budgets);
  const rows = useAppSelector((state) => selectBudgetUsage(state, month));
  const statuses = [transactions.fetch.status, budgets.fetch.status];
  const status = statuses.includes('pending') ? 'pending' : statuses.includes('failed') ? 'failed' : statuses.includes('idle') ? 'idle' : 'succeeded';
  return <BudgetsSection month={month} onMonthChange={setMonth} rows={rows} status={status} error={transactions.fetch.error ?? budgets.fetch.error}
    pending={budgets.mutation.status === 'pending' || transactions.mutation.status === 'pending'} mutationError={budgets.mutation.error}
    onRetry={() => { void dispatch(fetchTransactions()); void dispatch(fetchBudgets()); }}
    onClearMutation={() => { dispatch(clearBudgetMutationState()); }} onSave={async (input) => { await dispatch(saveBudget(input)).unwrap(); }}
    onRemove={async (id) => { await dispatch(deleteBudget(id)).unwrap(); }} MonthFilterComponent={MonthFilterComponent} />;
}

export default function BudgetsPage(props: BudgetsPageProps) {
  const redux = useContext(ReactReduxContext);
  return <div className="budgets-page">{props.budgets ? <BudgetsSection {...props.budgets} /> : redux ? <ConnectedBudgetsPage {...props} /> : <>
    <div className="page-heading"><div><h1>Budgets</h1><p>Give every category a little direction.</p></div></div>
    <ErrorMessage message="Budgets are unavailable while the application connection is being completed. Please try again later." />
  </>}</div>;
}
