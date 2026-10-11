import type { TransactionTableProps } from '../types';
import EmptyState from './EmptyState';

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
export default function TransactionTable(props: TransactionTableProps) {
  if (!props.transactions.length) return <EmptyState title={props.emptyTitle ?? 'No transactions match'}
    description={props.emptyDescription ?? 'Try another month or clear your filters.'} />;
  const rows = [...props.transactions].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
  return <div className="table-scroll" tabIndex={0} role="region" aria-label={props.caption}>
    <table className="transactions-table"><caption className="sr-only">{props.caption}</caption>
      <thead><tr><th scope="col">Transaction</th><th scope="col">Category</th><th scope="col">Date</th><th scope="col" className="text-right">Amount</th>{!props.readOnly && <th scope="col">Actions</th>}</tr></thead>
      <tbody>{rows.map((row) => <tr key={row.id}>
        <td><div className="transactions-name"><strong>{row.note || row.category}</strong><p className="text-muted">{row.type === 'income' ? 'Income' : 'Expense'}</p></div></td>
        <td className="transactions-category">{row.category}</td><td><time dateTime={row.date}>{row.date}</time></td>
        <td className={`text-right amount${row.type === 'income' ? ' amount--positive' : ''}`}>{row.type === 'income' ? '+' : '−'}{money.format(row.amount)}</td>
        {!props.readOnly && <td><div className="transactions-actions">
          <button className="button button--light" type="button" disabled={props.pending} onClick={() => props.onEdit(row)} aria-label={`Edit ${row.note || row.category} on ${row.date}, transaction ${row.id}`}>Edit</button>
          <button className="button button--secondary" type="button" disabled={props.pending} onClick={() => props.onDelete(row)} aria-label={`Delete ${row.note || row.category} on ${row.date}, transaction ${row.id}`}>Delete</button>
        </div></td>}
      </tr>)}</tbody>
    </table></div>;
}
