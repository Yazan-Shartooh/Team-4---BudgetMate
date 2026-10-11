import { useContext, useState } from 'react';
import { ReactReduxContext } from 'react-redux';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { getCurrentMonth, selectBudgetUsage, selectExpenseBreakdown, selectLargestSpendingCategory, selectMonthlySummary } from '../store/selectors';
import { fetchBudgets } from '../store/budgetsSlice';
import { fetchTransactions } from '../store/transactionsSlice';
import MonthlyReportSection from '../components/MonthlyReportSection';
import type { MonthlyReportSectionProps } from '../components/MonthlyReportSection';
import ErrorMessage from '../components/ErrorMessage';

function ConnectedMonthlyReportPage() {
  const dispatch = useAppDispatch();
  const [month, setMonth] = useState(getCurrentMonth);
  const transactions = useAppSelector((state) => state.transactions);
  const budgets = useAppSelector((state) => state.budgets);
  const summary = useAppSelector((state) => selectMonthlySummary(state, month));
  const breakdown = useAppSelector((state) => selectExpenseBreakdown(state, month));
  const largestCategory = useAppSelector((state) => selectLargestSpendingCategory(state, month));
  const budgetRows = useAppSelector((state) => selectBudgetUsage(state, month));
  const statuses = [transactions.fetch.status, budgets.fetch.status];
  const status = statuses.includes('pending') ? 'pending' : statuses.includes('failed') ? 'failed' : statuses.includes('idle') ? 'idle' : 'succeeded';
  return <MonthlyReportSection month={month} onMonthChange={setMonth} summary={summary} breakdown={breakdown}
    largestCategory={largestCategory} budgetRows={budgetRows} status={status}
    error={transactions.fetch.error ?? budgets.fetch.error}
    pending={transactions.mutation.status === 'pending' || budgets.mutation.status === 'pending'}
    onRetry={() => { void dispatch(fetchTransactions()); void dispatch(fetchBudgets()); }} />;
}

// Props support previews before the shared application bootstrap is connected.
export default function MonthlyReportPage(props: { report?: MonthlyReportSectionProps }) {
  const redux = useContext(ReactReduxContext);
  return <div className="report-page">{props.report ? <MonthlyReportSection {...props.report} /> : redux ? <ConnectedMonthlyReportPage /> : <>
    <div className="page-heading"><div><h1>Monthly report</h1><p>See your income, spending, and savings together.</p></div></div>
    <ErrorMessage message="Monthly reports are unavailable while the application connection is being completed. Please try again later." />
  </>}</div>;
}
