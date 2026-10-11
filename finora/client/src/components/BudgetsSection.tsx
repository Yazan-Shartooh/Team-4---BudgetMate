import { useId, useRef, useState } from 'react';
import type { ComponentType } from 'react';
import type { ApiError, Budget, BudgetInput, BudgetUsage, MonthFilterProps, RequestStatus } from '../types';
import { normalizeApiError } from '../api';
import { NotificationProvider, useNotifications } from '../context/NotificationContext';
import BudgetTable from './BudgetTable';
import BudgetForm from './BudgetForm';
import Modal from './Modal';
import LoadingMessage from './LoadingMessage';
import ErrorMessage from './ErrorMessage';
import MonthFilter from './MonthFilter';

export interface BudgetsSectionProps {
  month: string;
  onMonthChange: (month: string) => void;
  rows: readonly BudgetUsage[];
  status: RequestStatus;
  error: ApiError | null;
  pending: boolean;
  mutationError: ApiError | null;
  onRetry: () => void;
  onSave: (input: BudgetInput) => Promise<void>;
  onRemove: (id: number) => Promise<void>;
  onClearMutation: () => void;
  MonthFilterComponent?: ComponentType<MonthFilterProps>;
}

function BudgetsContent(props: BudgetsSectionProps) {
  const id = useId();
  const [editing, setEditing] = useState<BudgetUsage | null>(null);
  const [removing, setRemoving] = useState<Budget | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<ApiError | null>(null);
  const lock = useRef(false);
  const { notify } = useNotifications();
  const busy = props.pending || submitting;
  const close = () => { if (!busy) { setEditing(null); setRemoving(null); setLocalError(null); props.onClearMutation(); } };
  const MonthControl = props.MonthFilterComponent ?? MonthFilter;
  const monthProps: MonthFilterProps = { id: `${id}-month`, label: 'Budget month', value: props.month, disabled: busy || Boolean(editing || removing), onChange: (month) => { if (month) props.onMonthChange(month); } };
  const existing: Budget | undefined = editing?.budgetId != null && editing.budgetAmount != null
    ? { id: editing.budgetId, category: editing.category, month: editing.month, amount: editing.budgetAmount } : undefined;
  return <section className="budgets-section page-stack" aria-label="Budgets">
    <div className="page-heading"><div><p className="eyebrow">Plan with purpose</p><h1>Budgets</h1><p>Give every category a little direction.</p></div>
      <MonthControl {...monthProps} /></div>
    <div className="budgets-intro"><p>Unbudgeted spending is still included in all totals.</p><div className="budgets-key"><span className="budgets-status budgets-status--on-track">On track: under 80%</span><span className="budgets-status budgets-status--near-limit">Near limit: 80–100%</span><span className="budgets-status budgets-status--exceeded">Exceeded: over 100%</span></div></div>
    {props.status === 'idle' && <div className="feedback"><p>Budget and spending data have not loaded yet.</p><button type="button" className="button button--secondary" onClick={props.onRetry}>Load budgets and spending</button></div>}
    {props.status === 'pending' && <LoadingMessage message="Loading budgets and spending…" />}
    {props.status === 'failed' && <ErrorMessage message={props.error?.message ?? 'Unable to load budgets and spending.'} onRetry={props.onRetry} pending={busy} />}
    {props.status === 'succeeded' && <div className="card" aria-busy={busy}><div className="card-heading"><h2>Monthly category budgets</h2></div>
      {!props.rows.some((row) => row.budgetId !== null) && <p className="feedback">No budgets set for this month. Set a limit for any category below.</p>}
      <BudgetTable rows={props.rows} readOnly={false} pending={busy} onEdit={(row) => { props.onClearMutation(); setEditing(row); }}
        onRemove={(budget) => { props.onClearMutation(); setLocalError(null); setRemoving(budget); }} />
    </div>}
    <Modal open={Boolean(editing)} title={existing ? 'Edit monthly budget' : 'Set monthly budget'} pending={busy} onClose={close}>
      {editing && <BudgetForm month={editing.month} initialBudget={existing} initialCategory={editing.category} error={props.mutationError} pending={busy} onCancel={close}
        onSubmit={async (input) => {
          setSubmitting(true);
          try { await props.onSave(input); setEditing(null); notify({ kind: 'success', message: 'Monthly budget saved.' }); }
          finally { setSubmitting(false); }
        }} />}
    </Modal>
    <Modal open={Boolean(removing)} title="Remove monthly budget?" pending={busy} onClose={close} initialFocusId={`${id}-keep`}>
      <p>Remove the {removing?.category} budget for {removing?.month}? Your spending records will remain.</p>
      {(localError ?? props.mutationError) && <ErrorMessage message={(localError ?? props.mutationError)!.message} />}
      {busy && <p role="status">Removing budget…</p>}
      <div className="modal-actions"><button id={`${id}-keep`} type="button" className="button button--secondary" disabled={busy} onClick={close}>Keep budget</button>
        <button type="button" className="button button--danger" disabled={busy} onClick={async () => {
          if (!removing || busy || lock.current) return;
          lock.current = true; setSubmitting(true); setLocalError(null);
          try { await props.onRemove(removing.id); setRemoving(null); notify({ kind: 'success', message: 'Monthly budget removed.' }); }
          catch (failure) { setLocalError(normalizeApiError(failure)); }
          finally { lock.current = false; setSubmitting(false); }
        }}>{busy ? 'Removing…' : 'Remove budget'}</button></div>
    </Modal>
  </section>;
}
export default function BudgetsSection(props: BudgetsSectionProps) {
  return <NotificationProvider><BudgetsContent {...props} /></NotificationProvider>;
}
