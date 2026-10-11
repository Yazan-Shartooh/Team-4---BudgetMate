import { useId, useRef, useState } from 'react';
import { expenseCategories, incomeCategories } from '../types';
import type { ApiError, ExpenseCategory, IncomeCategory, TransactionFormProps, TransactionInput, TransactionType } from '../types';
import { normalizeApiError } from '../api';
import ErrorMessage from './ErrorMessage';

function today() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function TransactionFields({ transaction, initialType = 'expense', lockedType, pending, error, onSubmit, onCancel }: TransactionFormProps) {
  const id = useId();
  const [type, setType] = useState<TransactionType>(lockedType ?? transaction?.type ?? initialType);
  const [amount, setAmount] = useState(transaction ? String(transaction.amount) : '');
  const [category, setCategory] = useState<string>(transaction?.category ?? ((lockedType ?? initialType) === 'income' ? 'Salary' : 'Food'));
  const [date, setDate] = useState(transaction?.date ?? today());
  const [note, setNote] = useState(transaction?.note ?? '');
  const [localError, setLocalError] = useState<ApiError | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const lock = useRef(false);
  const busy = pending || submitting;
  const visibleError = localError ?? error;
  const categories = type === 'income' ? incomeCategories : expenseCategories;
  const invalid = (field: 'amount' | 'category' | 'date' | 'note') => Boolean(visibleError?.fieldErrors?.[field]);
  const feedback = (field: 'amount' | 'category' | 'date' | 'note') => invalid(field)
    ? <span className="field-error" id={`${id}-${field}-error`}>{visibleError?.fieldErrors?.[field]}</span> : null;
  return <form className="transactions-form" noValidate aria-busy={busy} onSubmit={async (event) => {
    event.preventDefault();
    if (busy || lock.current) return;
    const form = event.currentTarget;
    const fieldErrors: NonNullable<ApiError['fieldErrors']> = {};
    if (!/^\d+(\.\d{1,2})?$/.test(amount.trim()) || Number(amount) <= 0 || Number(amount) > 10_000_000) fieldErrors.amount = 'Enter an amount greater than zero, up to $10,000,000, with at most two decimal places.';
    if (!(categories as readonly string[]).includes(category)) fieldErrors.category = 'Choose a category matching the transaction type.';
    const parsed = new Date(`${date}T12:00:00`);
    const [year, month, day] = date.split('-').map(Number);
    if (!/^(?!0000)\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(parsed.getTime()) || parsed.getFullYear() !== year || parsed.getMonth() + 1 !== month || parsed.getDate() !== day || date > today()) fieldErrors.date = 'Choose a valid date on or before today.';
    if (note.trim().length > 120) fieldErrors.note = 'Keep the note to 120 characters or fewer.';
    if (Object.keys(fieldErrors).length) {
      setLocalError({ code: 'VALIDATION_ERROR', message: 'Please correct the highlighted fields.', fieldErrors });
      requestAnimationFrame(() => form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    const [whole, fraction = ''] = amount.trim().split('.');
    const value = (Number(whole) * 100 + Number(fraction.padEnd(2, '0'))) / 100;
    const common = { amount: value, date, note: note.trim() || undefined };
    const input: TransactionInput = type === 'income'
      ? { ...common, type, category: category as IncomeCategory }
      : { ...common, type, category: category as ExpenseCategory };
    lock.current = true; setSubmitting(true); setLocalError(null);
    try { await onSubmit(input); }
    catch (failure) { setLocalError(normalizeApiError(failure)); }
    finally { lock.current = false; setSubmitting(false); }
  }}>
    {!lockedType && <div className="transactions-type-switch" role="group" aria-label="Transaction type">
      {(['income', 'expense'] as const).map((value) => <button type="button" key={value} disabled={busy} aria-pressed={type === value}
        className={`transactions-type-option${type === value ? ' transactions-type-option--selected' : ''}`}
        onClick={() => { setType(value); setCategory(value === 'income' ? 'Salary' : 'Food'); setLocalError(null); }}>
        {value === 'income' ? 'Income' : 'Expense'}</button>)}
    </div>}
    {lockedType && <p>{lockedType === 'income' ? 'Income' : 'Expense'} transaction</p>}
    <div className="field"><label htmlFor={`${id}-amount`}>Amount (USD)</label><input id={`${id}-amount`} inputMode="decimal" required autoComplete="off" placeholder="0.00" value={amount} disabled={busy}
      aria-invalid={invalid('amount')} aria-describedby={invalid('amount') ? `${id}-amount-error` : undefined} onChange={(event) => setAmount(event.target.value)} />{feedback('amount')}</div>
    <div className="form-grid">
      <div className="field"><label htmlFor={`${id}-category`}>Category</label><select id={`${id}-category`} required disabled={busy} value={category} onChange={(event) => setCategory(event.target.value)}
        aria-invalid={invalid('category')} aria-describedby={invalid('category') ? `${id}-category-error` : undefined}>
        <option value="">Choose a category</option>{categories.map((value) => <option key={value}>{value}</option>)}</select>{feedback('category')}</div>
      <div className="field"><label htmlFor={`${id}-date`}>Date</label><input id={`${id}-date`} type="date" required max={today()} value={date} disabled={busy} onChange={(event) => setDate(event.target.value)}
        aria-invalid={invalid('date')} aria-describedby={invalid('date') ? `${id}-date-error` : undefined} />{feedback('date')}</div>
    </div>
    <div className="field"><label htmlFor={`${id}-note`}>Note (optional)</label><input id={`${id}-note`} value={note} disabled={busy} maxLength={120} onChange={(event) => setNote(event.target.value)}
      aria-invalid={invalid('note')} aria-describedby={invalid('note') ? `${id}-note-error` : undefined} />{feedback('note')}</div>
    {visibleError && <ErrorMessage message={visibleError.message} />}
    {busy && <p role="status">Saving transaction…</p>}
    <div className="modal-actions"><button type="button" className="button button--secondary" disabled={busy} onClick={onCancel}>Cancel</button>
      <button type="submit" className="button button--primary" disabled={busy}>{busy ? 'Saving…' : transaction ? 'Save changes' : 'Add transaction'}</button></div>
  </form>;
}

export default function TransactionForm(props: TransactionFormProps) {
  return <TransactionFields key={`${props.transaction?.id ?? 'new'}-${props.lockedType ?? props.initialType ?? 'expense'}`} {...props} />;
}
