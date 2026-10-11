import type { BudgetTableProps } from '../types';
import BudgetStatus from './BudgetStatus';
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export default function BudgetTable(props: BudgetTableProps) {
  return <div className="table-scroll" tabIndex={0} role="region" aria-label="Category budget comparison">
    <table className="budgets-table"><caption className="sr-only">Category budget comparison{props.rows[0] ? ` for ${props.rows[0].month}` : ''}</caption>
      <thead><tr>{['Category', 'Monthly budget', 'Spent', 'Remaining / exceeded', 'Usage', 'Status'].map((heading) => <th scope="col" key={heading}>{heading}</th>)}{!props.readOnly && <th scope="col">Actions</th>}</tr></thead>
      <tbody>{props.rows.map((row) => <tr key={`${row.month}-${row.category}`}>
        <th scope="row">{row.category}</th><td>{row.budgetAmount === null ? 'No budget' : money.format(row.budgetAmount)}</td>
        <td>{money.format(row.spent)}</td><td>{row.remaining === null ? '—' : `${money.format(Math.abs(row.remaining))} ${row.remaining < 0 ? 'over' : 'left'}`}</td>
        <td className="budgets-usage">{row.usagePercentage === null ? '—' : <>{row.usagePercentage.toFixed(1)}%<progress className="progress" data-status={row.status} max={100} value={Math.min(100, Math.max(0, row.usagePercentage))} aria-label={`${row.category} budget used: ${row.usagePercentage.toFixed(1)}%`} /></>}</td>
        <td><BudgetStatus status={row.status} exceeded={row.exceeded} /></td>
        {!props.readOnly && <td><div className="budgets-actions"><button type="button" className="button button--light" disabled={props.pending} onClick={() => props.onEdit(row)} aria-label={`${row.budgetId === null ? 'Set' : 'Edit'} ${row.category} budget`}>{row.budgetId === null ? 'Set budget' : 'Edit'}</button>
          {row.budgetId !== null && row.budgetAmount !== null && <button type="button" className="button button--secondary" disabled={props.pending} aria-label={`Remove ${row.category} budget`}
            onClick={() => { if (row.budgetId !== null && row.budgetAmount !== null) props.onRemove({ id: row.budgetId, category: row.category, month: row.month, amount: row.budgetAmount }); }}>Remove</button>}
        </div></td>}
      </tr>)}</tbody>
    </table></div>;
}
