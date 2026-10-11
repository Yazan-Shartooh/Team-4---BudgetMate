import { useId } from 'react';
import type { ApiError, BudgetUsage, CategoryTotal, ExpenseCategory, Month, MonthlySummary, RequestStatus } from '../types';
import BudgetTable from './BudgetTable';
import CategoryBreakdown from './CategoryBreakdown';
import MonthFilter from './MonthFilter';
import LoadingMessage from './LoadingMessage';
import ErrorMessage from './ErrorMessage';
import EmptyState from './EmptyState';

export interface MonthlyReportSectionProps {
  month: Month;
  onMonthChange: (month: Month) => void;
  summary: MonthlySummary;
  breakdown: readonly CategoryTotal<ExpenseCategory>[];
  largestCategory: CategoryTotal<ExpenseCategory> | null;
  budgetRows: readonly BudgetUsage[];
  status: RequestStatus;
  error: ApiError | null;
  pending?: boolean;
  onRetry: () => void;
}
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export default function MonthlyReportSection(props: MonthlyReportSectionProps) {
  const id = useId();
  const { summary, largestCategory } = props;
  return <section className="report-section page-stack" aria-labelledby={`${id}-title`} aria-busy={props.status === 'pending' || props.pending}>
    <div className="page-heading">
      <div><p className="eyebrow">Your monthly perspective</p><h1 id={`${id}-title`}>Monthly report</h1><p>See your income, spending, and savings together.</p></div>
      <MonthFilter id={`${id}-month`} label="Report month" value={props.month} onChange={(month) => { if (month) props.onMonthChange(month); }} />
    </div>
    {props.status === 'idle' && <div className="feedback"><p>Report data have not loaded yet.</p><button type="button" className="button button--secondary" disabled={props.pending} onClick={props.onRetry}>Load report</button></div>}
    {props.status === 'pending' && <LoadingMessage message="Loading monthly report…" />}
    {props.status === 'failed' && <ErrorMessage message={props.error?.message ?? 'Unable to load the monthly report.'} onRetry={props.onRetry} pending={props.pending} />}
    {props.status === 'succeeded' && <>
      {summary.transactionCount === 0 && <EmptyState title="No transactions this month" description="Income, expenses, and savings are zero. Any budgets you set still appear below." />}
      <div className="report-summary">
        <section className="card feature-card"><h2>Income</h2><p className="amount">{money.format(summary.income)}</p></section>
        <section className="card feature-card"><h2>Expenses</h2><p className="amount">{money.format(summary.expenses)}</p></section>
        <section className="card feature-card"><h2>Savings</h2><p className="amount">{money.format(summary.savings)}</p>
          <p>Savings rate: {summary.savingsRate === null ? 'N/A' : `${summary.savingsRate.toFixed(1)}%`}</p>
          {summary.savingsRate === null && <p className="field-hint">A savings rate is unavailable without income.</p>}
        </section>
      </div>
      {summary.overspent && <p className="report-note report-note--overspent">Overspent: expenses exceeded income this month. Savings are {money.format(summary.savings)}.</p>}
      <section className="card" aria-labelledby={`${id}-spending`}>
        <div className="card-heading"><h2 id={`${id}-spending`}>Spending by category</h2></div>
        <p className="report-note">{largestCategory
          ? <>Largest spending category: <strong>{largestCategory.category}</strong> — {money.format(largestCategory.amount)} ({largestCategory.percentage.toFixed(1)}% of expenses).</>
          : 'No spending this month. There is no largest spending category.'}</p>
        <CategoryBreakdown rows={props.breakdown} />
      </section>
      <section className="report-budget-comparison card" aria-labelledby={`${id}-budgets`}>
        <div className="card-heading"><h2 id={`${id}-budgets`}>Budget comparison</h2></div>
        <p className="report-note">Compare each category’s spending with its monthly limit. Unbudgeted spending is included in expenses.</p>
        <BudgetTable rows={props.budgetRows} readOnly />
      </section>
    </>}
  </section>;
}
