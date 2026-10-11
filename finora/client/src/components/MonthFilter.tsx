import type { MonthFilterProps } from '../types';

export default function MonthFilter({ id, label, value, onChange, allowAll = false, disabled = false }: MonthFilterProps) {
  return <div className="month-filter">
    <label className="month-filter-label" htmlFor={id}>{label}</label>
    <input className="month-filter-input" id={id} type="month" value={value}
      min="0001-01" max="9999-12" required={!allowAll} disabled={disabled}
      aria-describedby={allowAll ? `${id}-hint` : undefined}
      onChange={(event) => {
        const month = event.target.value;
        if ((allowAll && month === '') || /^(?!0000)\d{4}-(0[1-9]|1[0-2])$/.test(month)) onChange(month);
      }} />
    {allowAll && <span className="field-hint" id={`${id}-hint`}>Leave empty for all months.</span>}
  </div>;
}
