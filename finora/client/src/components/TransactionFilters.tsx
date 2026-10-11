import { useId } from 'react';
import type { ComponentType } from 'react';
import { expenseCategories, incomeCategories } from '../types';
import type { Category, MonthFilterProps, TransactionFiltersProps, TransactionType } from '../types';

export type TransactionFilterControlsProps = TransactionFiltersProps & { MonthFilterComponent?: ComponentType<MonthFilterProps> };

export default function TransactionFilters({ value, onChange, lockedType, disabled, MonthFilterComponent }: TransactionFilterControlsProps) {
  const id = useId();
  const type = lockedType ?? value.type;
  const categories = type === 'income' ? incomeCategories : type === 'expense' ? expenseCategories : [...incomeCategories, ...expenseCategories];
  const monthProps: MonthFilterProps = {
    id: `${id}-month`, label: 'Month', value: value.month, allowAll: true, disabled,
    onChange: (month) => onChange({ ...value, type, month }),
  };
  return <div className="transactions-filters" aria-label="Transaction filters">
    <label className="field transactions-search" htmlFor={`${id}-search`}>Search
      <input id={`${id}-search`} type="search" value={value.query} disabled={disabled} placeholder="Search notes or categories" onChange={(event) => onChange({ ...value, type, query: event.target.value })} /></label>
    {!lockedType && <div className="field"><label htmlFor={`${id}-type`}>Type</label><select id={`${id}-type`} value={type} disabled={disabled}
      onChange={(event) => {
        const next = event.target.value as TransactionType | 'all';
        const allowed: readonly string[] = next === 'income' ? incomeCategories : next === 'expense' ? expenseCategories : [...incomeCategories, ...expenseCategories];
        onChange({ ...value, type: next, category: allowed.includes(value.category) ? value.category : 'all' });
      }}><option value="all">All types</option><option value="income">Income</option><option value="expense">Expense</option></select></div>}
    <div className="field"><label htmlFor={`${id}-category`}>Category</label><select id={`${id}-category`} disabled={disabled} value={value.category}
      onChange={(event) => onChange({ ...value, type, category: event.target.value as Category | 'all' })}>
      <option value="all">All categories</option>{categories.map((category) => <option key={category}>{category}</option>)}</select></div>
    {MonthFilterComponent ? <MonthFilterComponent {...monthProps} /> :
      <label className="month-filter" htmlFor={monthProps.id}>Month<input className="month-filter-input" id={monthProps.id} type="month" value={value.month} disabled={disabled}
        onChange={(event) => { if (!event.target.value || /^(?!0000)\d{4}-(0[1-9]|1[0-2])$/.test(event.target.value)) monthProps.onChange(event.target.value); }} /></label>}
    <button type="button" className="text-button" disabled={disabled} onClick={() => onChange({ type: lockedType ?? 'all', category: 'all', month: '', query: '' })}>Clear filters</button>
  </div>;
}
