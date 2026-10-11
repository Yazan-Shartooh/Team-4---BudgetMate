import type { CategoryTotal, ExpenseCategory } from '../types';

export interface CategoryBreakdownProps {
  rows: readonly CategoryTotal<ExpenseCategory>[];
}
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export default function CategoryBreakdown({ rows }: CategoryBreakdownProps) {
  return <ul className="report-breakdown" aria-label="Spending by category">
    {rows.map((row) => <li className="report-category" key={row.category}>
      <span>{row.category}</span>
      <span className="report-category-amount">{money.format(row.amount)} · {row.percentage.toFixed(1)}%</span>
      <progress className="progress" max={100} value={Math.min(100, Math.max(0, row.percentage))}
        aria-label={`${row.category}: ${row.percentage.toFixed(1)}% of monthly spending`} />
    </li>)}
  </ul>;
}
