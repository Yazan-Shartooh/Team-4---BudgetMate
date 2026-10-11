import type { BudgetStatusProps } from '../types';
const labels = { 'on-track': 'On track', 'near-limit': 'Near limit', exceeded: 'Exceeded', 'no-budget': 'No budget' };
export default function BudgetStatus({ status, exceeded }: BudgetStatusProps) {
  return <span className={`budgets-status budgets-status--${status}`}>{labels[status]}
    {status === 'exceeded' && exceeded != null && ` by ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(exceeded)}`}</span>;
}
