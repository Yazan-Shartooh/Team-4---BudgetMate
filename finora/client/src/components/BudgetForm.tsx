import { useId, useRef, useState } from 'react';
import { expenseCategories } from '../types';
import type { ApiError, BudgetFormProps, ExpenseCategory } from '../types';
import { normalizeApiError } from '../api';
import ErrorMessage from './ErrorMessage';

function BudgetFields({ month, initialBudget, initialCategory, pending, error, onSubmit, onCancel }: BudgetFormProps) {
  const id = useId();
  const lock = useRef(false);
  const [category, setCategory] = useState(initialBudget?.category ?? initialCategory ?? 'Food');
  const [amount, setAmount] = useState(initialBudget ? String(initialBudget.amount) : '');
  const [localError, setLocalError] = useState<ApiError | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const busy = pending || submitting;
  const visibleError = localError ?? error;
  return <form className="budgets-form" noValidate aria-busy={busy} onSubmit={async (event) => {
    event.preventDefault();
    if (busy || lock.current) return;
    const fieldErrors: NonNullable<ApiError['fieldErrors']> = {};
    if (!/^\d+(\.\d{1,2})?$/.test(amount.trim()) || Number(amount) <= 0 || Number(amount) > 10_000_000) fieldErrors.amount = 'Enter a positive budget up to $10,000,000 with at most two decimals.';
    if (!expenseCategories.includes(category)) fieldErrors.category = 'Choose an expense category.';
    if (!/^(?!0000)\d{4}-(0[1-9]|1[0-2])$/.test(month)) fieldErrors.month = 'Choose a valid month.';
    if (Object.keys(fieldErrors).length) {
      setLocalError({ code: 'VALIDATION_ERROR', message: 'Please correct the highlighted fields.', fieldErrors });
      const form = event.currentTarget;
      requestAnimationFrame(() => form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    const [whole, fraction = ''] = amount.trim().split('.');
    lock.current = true; setSubmitting(true); setLocalError(null);
    try { await onSubmit({ category, month, amount: (Number(whole) * 100 + Number(fraction.padEnd(2, '0'))) / 100 }); }
    catch (failure) { setLocalError(normalizeApiError(failure)); }
    finally { lock.current = false; setSubmitting(false); }
  }}>
    <p>Budget month: <time dateTime={month}>{month}</time></p>
    <div className="field"><label htmlFor={`${id}-category`}>Expense category</label><select id={`${id}-category`} value={category} disabled={busy || Boolean(initialBudget) || Boolean(initialCategory)}
      onChange={(event) => setCategory(event.target.value as ExpenseCategory)} aria-invalid={Boolean(visibleError?.fieldErrors?.category)} aria-describedby={visibleError?.fieldErrors?.category ? `${id}-category-error` : undefined}>
      {expenseCategories.map((value) => <option key={value}>{value}</option>)}</select>
      {visibleError?.fieldErrors?.category && <span className="field-error" id={`${id}-category-error`}>{visibleError.fieldErrors.category}</span>}</div>
    <div className="field"><label htmlFor={`${id}-amount`}>Monthly limit (USD)</label><input id={`${id}-amount`} required inputMode="decimal" placeholder="0.00" value={amount} disabled={busy} onChange={(event) => setAmount(event.target.value)}
      aria-invalid={Boolean(visibleError?.fieldErrors?.amount)} aria-describedby={visibleError?.fieldErrors?.amount ? `${id}-amount-error` : `${id}-hint`} />
      {visibleError?.fieldErrors?.amount && <span className="field-error" id={`${id}-amount-error`}>{visibleError.fieldErrors.amount}</span>}</div>
    <p className="field-hint" id={`${id}-hint`}>Saving replaces any existing budget for this category and month. Spending above the limit is still allowed.</p>
    {visibleError && <ErrorMessage message={visibleError.fieldErrors?.month ?? visibleError.message} />}
    {busy && <p role="status">Saving budget…</p>}
    <div className="modal-actions"><button type="button" className="button button--secondary" disabled={busy} onClick={onCancel}>Cancel</button>
      <button type="submit" className="button button--primary" disabled={busy}>{busy ? 'Saving…' : 'Save budget'}</button></div>
  </form>;
}
export default function BudgetForm(props: BudgetFormProps) {
  return <BudgetFields key={`${props.month}-${props.initialBudget?.id ?? props.initialCategory ?? 'new'}`} {...props} />;
}
