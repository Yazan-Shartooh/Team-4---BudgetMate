import { expenseCategories, incomeCategories } from './types.ts';
import type {
  ApiError, ApiErrorCode, ApiRequestOptions, Budget, CategoryLists,
  FieldName, FrontendApi, Transaction, TransactionInput,
} from './types.ts';

const fields: readonly FieldName[] = ['type', 'amount', 'category', 'date', 'note', 'month'];
const codes: readonly ApiErrorCode[] = [
  'VALIDATION_ERROR', 'NOT_FOUND', 'CONFLICT', 'NETWORK_ERROR',
  'SERVER_ERROR', 'INVALID_RESPONSE', 'ABORTED',
];
const maxAmount = 10_000_000;

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readable(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    const messages = value.map(readable).filter((message): message is string => Boolean(message));
    return messages.length ? messages.join(' ').slice(0, 1000) : undefined;
  }
  if (typeof value !== 'string') return undefined;
  const text = value.trim();
  if (!text || /[<>]|\bat\s+\S+\s*\([^)]*:\d+/i.test(text)) return undefined;
  return text.slice(0, 1000);
}

/** Serializable rejectValue for thunks, including NestJS validation messages. */
export function normalizeApiError(value: unknown, status?: number): ApiError {
  if (value instanceof Error) {
    return value.name === 'AbortError'
      ? { code: 'ABORTED', message: 'The request was cancelled.' }
      : { code: 'NETWORK_ERROR', message: 'Unable to reach the server. Check your connection and try again.' };
  }
  const outer = record(value) ? value : {};
  const body = record(outer.error) ? outer.error : outer;
  const httpStatus = status ?? (typeof outer.statusCode === 'number' ? outer.statusCode
    : typeof body.status === 'number' ? body.status : undefined);
  const fallback: ApiErrorCode = httpStatus === 400 || httpStatus === 422 ? 'VALIDATION_ERROR'
    : httpStatus === 404 ? 'NOT_FOUND' : httpStatus === 409 ? 'CONFLICT' : 'SERVER_ERROR';
  const code = typeof body.code === 'string' && codes.includes(body.code as ApiErrorCode)
    ? body.code as ApiErrorCode : fallback;
  const defaults: Record<ApiErrorCode, string> = {
    VALIDATION_ERROR: 'Check the entered information and try again.',
    NOT_FOUND: 'The requested record was not found. Reload the list and try again.',
    CONFLICT: 'This record has changed. Reload the list before trying again.',
    NETWORK_ERROR: 'Unable to reach the server. Check your connection and try again.',
    SERVER_ERROR: 'The server could not complete the request. Please try again.',
    INVALID_RESPONSE: 'The server returned unexpected data. Please reload or contact the team.',
    ABORTED: 'The request was cancelled.',
  };
  const result: ApiError = {
    code, message: httpStatus && httpStatus >= 500 ? defaults.SERVER_ERROR : readable(body.message) ?? defaults[code],
    ...(httpStatus === undefined ? {} : { status: httpStatus }),
  };
  if (record(body.fieldErrors) && !(httpStatus && httpStatus >= 500)) {
    const fieldErrors: Partial<Record<FieldName, string>> = {};
    for (const field of fields) {
      const message = readable(body.fieldErrors[field]);
      if (message) fieldErrors[field] = message;
    }
    if (Object.keys(fieldErrors).length) result.fieldErrors = fieldErrors;
  }
  return result;
}

function invalidResponse(status?: number): ApiError {
  return { code: 'INVALID_RESPONSE', message: 'The server returned data that does not match the agreed API contract.', status };
}

function validId(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
}

function validAmount(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 && value <= maxAmount
    && /^\d+(\.\d{1,2})?$/.test(String(value));
}

function validMonth(value: unknown): value is string {
  return typeof value === 'string' && /^(?!0000)\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

function validDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || !validMonth(value.slice(0, 7))) return false;
  const [year, month, day] = value.split('-').map(Number);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const now = new Date();
  const today = `${String(now.getFullYear()).padStart(4, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  return day >= 1 && day <= days[month - 1] && value <= today;
}

function includes(values: readonly string[], value: unknown): boolean {
  return typeof value === 'string' && values.includes(value);
}

function validTransactionInput(value: unknown): boolean {
  if (!record(value)) return false;
  return validAmount(value.amount) && validDate(value.date)
    && (value.note === undefined || (typeof value.note === 'string' && value.note.length <= 120))
    && (value.type === 'income' ? includes(incomeCategories, value.category)
      : value.type === 'expense' && includes(expenseCategories, value.category));
}

function isTransaction(value: unknown): value is Transaction {
  return record(value) && validId(value.id) && validTransactionInput(value)
    && (value.createdAt === undefined || (typeof value.createdAt === 'string'
      && /^\d{4}-\d{2}-\d{2}T/.test(value.createdAt) && Number.isFinite(Date.parse(value.createdAt))));
}

function validBudgetInput(value: unknown): boolean {
  return record(value) && validAmount(value.amount) && validMonth(value.month)
    && includes(expenseCategories, value.category);
}

function isBudget(value: unknown): value is Budget {
  return record(value) && validId(value.id) && validBudgetInput(value);
}

function uniqueRows<T extends { id: number }>(value: unknown, guard: (row: unknown) => row is T): value is T[] {
  return Array.isArray(value) && value.every(guard) && new Set(value.map((row) => row.id)).size === value.length;
}

function isBudgets(value: unknown): value is Budget[] {
  return uniqueRows(value, isBudget) && new Set(value.map((row) => `${row.month}/${row.category}`)).size === value.length;
}

function isCategories(value: unknown): value is CategoryLists {
  if (!record(value)) return false;
  return ([['income', incomeCategories], ['expense', expenseCategories]] as const).every(([key, expected]) => {
    const actual = value[key];
    return Array.isArray(actual) && actual.length === expected.length
      && new Set(actual).size === expected.length && actual.every((category) => includes(expected, category));
  });
}

function requireInput(valid: boolean, message: string): void {
  if (!valid) throw { code: 'VALIDATION_ERROR', message } satisfies ApiError;
}

function transactionBody(input: TransactionInput) {
  // Never send server-owned IDs/timestamps even if a caller passes a full record.
  return {
    type: input.type, amount: input.amount, category: input.category,
    date: input.date, note: input.note?.trim(),
  };
}

export interface ApiClientOptions {
  baseUrl?: string;
  fetch?: typeof globalThis.fetch;
  timeoutMs?: number;
}

/** Uses the proposed endpoints, with no fallback records or automatic mutation retries. */
export function createApiClient({ baseUrl, fetch: fetchOverride, timeoutMs = 15_000 }: ApiClientOptions): FrontendApi {
  const base = baseUrl?.trim().replace(/\/+$/, '');

  async function request<T>(
    path: string, method: string, guard: (value: unknown) => value is T,
    options?: ApiRequestOptions, body?: unknown,
  ): Promise<T> {
    if (!base || !(/^(https?:\/\/|\/(?!\/))/.test(base))) {
      throw { code: 'SERVER_ERROR', message: 'The API is not configured. Set VITE_API_BASE_URL to the confirmed backend URL.' } satisfies ApiError;
    }
    const controller = new AbortController();
    const abort = () => controller.abort();
    let timedOut = false;
    if (options?.signal?.aborted) abort();
    options?.signal?.addEventListener('abort', abort, { once: true });
    const timer = setTimeout(() => { timedOut = true; controller.abort(); }, timeoutMs);
    try {
      if (controller.signal.aborted) throw { code: 'ABORTED', message: 'The request was cancelled.' } satisfies ApiError;
      const response = await (fetchOverride ?? globalThis.fetch)(`${base}${path}`, {
        method, signal: controller.signal, cache: 'no-store',
        headers: { Accept: 'application/json', ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
      // Read inside the timeout: a stalled response body must not leave forms pending.
      const text = await response.text();
      let payload: unknown;
      try { payload = JSON.parse(text); } catch { payload = undefined; }
      if (!response.ok) {
        const error = normalizeApiError(payload, response.status);
        if (response.status === 404 && /^\/transactions\/\d+$/.test(path)) {
          error.message = 'Transaction not found. Reload the list and try again.';
        }
        throw error;
      }
      if (!record(payload) || !guard(payload.data)) throw invalidResponse(response.status);
      return payload.data;
    } catch (error) {
      if (controller.signal.aborted) {
        throw {
          code: timedOut ? 'NETWORK_ERROR' : 'ABORTED',
          message: timedOut
            ? 'The request timed out. Reload the data before retrying a change; the server may have saved it.'
            : 'The request was cancelled. Reload the data before retrying a change.',
        } satisfies ApiError;
      }
      throw normalizeApiError(error);
    } finally {
      clearTimeout(timer);
      options?.signal?.removeEventListener('abort', abort);
    }
  }

  return {
    getCategories: (options) => request('/categories', 'GET', isCategories, options),
    getTransactions: (options) => request('/transactions', 'GET', (value): value is Transaction[] => uniqueRows(value, isTransaction), options),
    async createTransaction(input, options) {
      requireInput(validTransactionInput(input), 'Enter a positive amount with at most two decimals, a matching category, and a valid date on or before today. Notes may contain up to 120 characters.');
      return request('/transactions', 'POST', isTransaction, options, transactionBody(input));
    },
    async updateTransaction({ id, changes }, options) {
      requireInput(validId(id) && validTransactionInput(changes), 'Choose an existing transaction and provide a valid amount, category, date, and note.');
      return request(`/transactions/${id}`, 'PUT', (value): value is Transaction => isTransaction(value) && value.id === id,
        options, transactionBody(changes));
    },
    async deleteTransaction(id, options) {
      requireInput(validId(id), 'Choose an existing transaction to delete.');
      return request(`/transactions/${id}`, 'DELETE', (value): value is number => value === id, options);
    },
    getBudgets: (options) => request('/budgets', 'GET', isBudgets, options),
    async saveBudget(input, options) {
      requireInput(validBudgetInput(input), 'Choose an expense category, a valid month, and a positive budget with at most two decimals.');
      return request('/budgets', 'PUT', (value): value is Budget => isBudget(value)
        && value.category === input.category && value.month === input.month, options,
        { category: input.category, month: input.month, amount: input.amount });
    },
    async deleteBudget(id, options) {
      requireInput(validId(id), 'Choose an existing budget to delete.');
      return request(`/budgets/${id}`, 'DELETE', (value): value is number => value === id, options);
    },
  };
}

// Missing configuration fails explicitly on request, not on module import.
const api = createApiClient({ baseUrl: import.meta.env?.VITE_API_BASE_URL });
export const {
  getCategories, getTransactions, createTransaction, updateTransaction,
  deleteTransaction, getBudgets, saveBudget, deleteBudget,
} = api;
