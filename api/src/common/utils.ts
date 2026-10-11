/** Convert money to integer cents to avoid floating-point arithmetic drift. */
export function toCents(value: number): number {
  return Math.round((value + Number.EPSILON) * 100);
}

export function fromCents(cents: number): number {
  return cents / 100;
}

export function round1(value: number): number {
  return Math.round((value + Number.EPSILON) * 10) / 10;
}

export function isValidMonth(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

/** Validate both the YYYY-MM-DD shape and the actual calendar date. */
export function isValidDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }

  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

/** Uses the server's local calendar date, as required by the assignment. */
export function todayISO(): string {
  const now = new Date();
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
}

export function currentMonth(): string {
  return todayISO().slice(0, 7);
}

export function monthOf(date: string): string {
  return date.slice(0, 7);
}

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}
