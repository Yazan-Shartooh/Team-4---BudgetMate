import { useId, useRef, useState } from 'react';
import type { ApiError, DeleteTransactionModalProps } from '../types';
import { normalizeApiError } from '../api';
import Modal from './Modal';
import ErrorMessage from './ErrorMessage';

function DeleteDialog({ transaction, pending, error, onConfirm, onClose }: DeleteTransactionModalProps) {
  const id = useId();
  const lock = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<ApiError | null>(null);
  const busy = pending || submitting;
  return <Modal open={Boolean(transaction)} title="Delete transaction?" onClose={onClose} pending={busy} initialFocusId={id}>
    <p className="transactions-delete-copy">Remove {transaction?.note || transaction?.category} ({transaction?.date})? All related totals will be recalculated after deletion.</p>
    {(localError ?? error) && <ErrorMessage message={(localError ?? error)!.message} />}
    {busy && <p role="status">Deleting transaction…</p>}
    <div className="modal-actions"><button id={id} type="button" className="button button--secondary" disabled={busy} onClick={onClose}>Keep transaction</button>
      <button type="button" className="button button--danger" disabled={busy} onClick={async () => {
        if (!transaction || busy || lock.current) return;
        lock.current = true; setSubmitting(true); setLocalError(null);
        try { await onConfirm(transaction.id); }
        catch (failure) { setLocalError(normalizeApiError(failure)); }
        finally { lock.current = false; setSubmitting(false); }
      }}>{busy ? 'Deleting…' : 'Delete transaction'}</button></div>
  </Modal>;
}
export default function DeleteTransactionModal(props: DeleteTransactionModalProps) {
  return <DeleteDialog key={props.transaction?.id ?? 'closed'} {...props} />;
}
