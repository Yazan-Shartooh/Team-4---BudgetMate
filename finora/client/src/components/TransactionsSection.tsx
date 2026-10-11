import { useState } from 'react';
import type { ComponentType } from 'react';
import type { ApiError, MoneyTotals, MonthFilterProps, RequestStatus, Transaction, TransactionFilters as Filters, TransactionInput } from '../types';
import { NotificationProvider, useNotifications } from '../context/NotificationContext';
import TransactionFilters from './TransactionFilters';
import TransactionTable from './TransactionTable';
import TransactionForm from './TransactionForm';
import DeleteTransactionModal from './DeleteTransactionModal';
import Modal from './Modal';
import LoadingMessage from './LoadingMessage';
import ErrorMessage from './ErrorMessage';

export interface TransactionsSectionProps {
  transactions: readonly Transaction[];
  totals: MoneyTotals;
  totalCount: number;
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  status: RequestStatus;
  error: ApiError | null;
  pending: boolean;
  mutationError: ApiError | null;
  onRetry: () => void;
  onCreate: (input: TransactionInput) => Promise<void>;
  onUpdate: (transaction: Transaction, input: TransactionInput) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onClearMutation: () => void;
  MonthFilterComponent?: ComponentType<MonthFilterProps>;
}
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

function TransactionsContent(props: TransactionsSectionProps) {
  const [editing, setEditing] = useState<Transaction | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Transaction | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { notify } = useNotifications();
  const busy = props.pending || submitting;
  const unavailable = props.status !== 'succeeded' || busy;
  const close = () => { if (!busy) { setEditing(null); setDeleting(null); props.onClearMutation(); } };
  return <section className="transactions-section page-stack" aria-label="Transactions">
    <div className="page-heading"><div><p className="eyebrow">Your money, clearly</p><h1>Transactions</h1><p>Your money in motion. Every detail in one place.</p></div>
      <button type="button" className="button button--primary" disabled={unavailable} onClick={() => { props.onClearMutation(); setEditing('new'); }}>Add transaction</button></div>
    {props.status === 'idle' && <div className="feedback"><p>Transactions have not loaded yet.</p><button type="button" className="button button--secondary" onClick={props.onRetry}>Load transactions</button></div>}
    {props.status === 'pending' && <LoadingMessage message="Loading transactions…" />}
    {props.status === 'failed' && <ErrorMessage message={props.error?.message ?? 'Unable to load transactions.'} onRetry={props.onRetry} pending={busy} />}
    {props.status === 'failed' && props.totalCount > 0 && <p className="feedback">Showing previously loaded data. Reload before making changes.</p>}
    {(props.status === 'succeeded' || props.totalCount > 0) && <>
      <div className="transactions-summary card"><div><p>Money in</p><strong className="amount amount--positive">{money.format(props.totals.income)}</strong></div><div><p>Money out</p><strong className="amount">{money.format(props.totals.expenses)}</strong></div><div><p>Net change</p><strong className="amount">{money.format(props.totals.savings)}</strong></div><p className="text-muted">Based on your current filters</p></div>
      <div className="card transactions-log" aria-busy={busy}><div className="card-heading"><h2>Transaction log</h2><span className="transactions-count">{props.transactions.length} entries</span></div>
        <TransactionFilters value={props.filters} onChange={props.onFiltersChange} disabled={busy} MonthFilterComponent={props.MonthFilterComponent} />
        <TransactionTable transactions={props.transactions} caption="Transaction history, newest first" pending={unavailable} readOnly={false}
          emptyTitle={props.totalCount ? 'No transactions match' : 'No transactions yet'} emptyDescription={props.totalCount ? 'Try another month or clear your filters.' : 'Add your first income or expense to start tracking.'}
          onEdit={(row) => { props.onClearMutation(); setEditing(row); }} onDelete={(row) => { props.onClearMutation(); setDeleting(row); }} />
        <div className="transactions-footer"><p>{props.transactions.length} matching transactions</p><p>All amounts in USD</p></div>
      </div>
    </>}
    <Modal open={editing !== null} title={editing === 'new' ? 'Add transaction' : 'Edit transaction'} onClose={close} pending={busy}>
      {editing && <TransactionForm transaction={editing === 'new' ? undefined : editing} pending={busy} error={props.mutationError} onCancel={close}
        onSubmit={async (input) => {
          setSubmitting(true);
          try {
            if (editing === 'new') await props.onCreate(input); else await props.onUpdate(editing, input);
            setEditing(null); notify({ kind: 'success', message: editing === 'new' ? 'Transaction added.' : 'Transaction updated.' });
          } finally { setSubmitting(false); }
        }} />}
    </Modal>
    <DeleteTransactionModal transaction={deleting} pending={busy} error={props.mutationError} onClose={close}
      onConfirm={async (id) => {
        setSubmitting(true);
        try { await props.onDelete(id); setDeleting(null); notify({ kind: 'success', message: 'Transaction deleted.' }); }
        finally { setSubmitting(false); }
      }} />
  </section>;
}
export default function TransactionsSection(props: TransactionsSectionProps) {
  return <NotificationProvider><TransactionsContent {...props} /></NotificationProvider>;
}
