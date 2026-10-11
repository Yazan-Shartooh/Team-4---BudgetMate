import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createApiClient, normalizeApiError } from '../src/api.ts';
import { expenseCategories, incomeCategories } from '../src/types.ts';
import type { TransactionInput } from '../src/types.ts';

const transaction = { id: 7, type: 'expense' as const, category: 'Food' as const, amount: 0.29, date: '2024-02-29', note: 'Lunch' };
const budget = { id: 2, category: 'Food' as const, month: '2024-02', amount: 100 };
const baseUrl = 'https://example.test/api';
function fixture(payload: unknown, status = 200) {
  return createApiClient({ baseUrl, fetch: async () => new Response(JSON.stringify(payload), { status }) });
}

test('all eight operations use contract URLs, methods, bodies, envelopes and authoritative responses', async () => {
  const responses = [
    { income: incomeCategories, expense: expenseCategories }, [transaction],
    transaction, { ...transaction, amount: 0.3 }, 7, [budget], budget, 2,
  ];
  const requests: { url: string; method?: string; body: unknown }[] = [];
  const api = createApiClient({ baseUrl: `${baseUrl}/`, fetch: async (url, init) => {
    requests.push({ url: String(url), method: init?.method, body: init?.body ? JSON.parse(String(init.body)) : undefined });
    assert.equal(init?.cache, 'no-store');
    assert.equal(new Headers(init?.headers).get('Accept'), 'application/json');
    return new Response(JSON.stringify({ data: responses.shift() }));
  } });
  await api.getCategories();
  assert.deepEqual(await api.getTransactions(), [transaction]);
  const { id, ...input } = transaction;
  assert.deepEqual(await api.createTransaction({ ...transaction, note: ' Lunch ' }), transaction);
  assert.equal((await api.updateTransaction({ id, changes: { ...input, amount: 0.3 } })).amount, 0.3);
  assert.equal(await api.deleteTransaction(id), id);
  await api.getBudgets();
  await api.saveBudget(budget);
  await api.deleteBudget(budget.id);
  assert.deepEqual(requests.map(({ url, method }) => [url, method]), [
    [`${baseUrl}/categories`, 'GET'], [`${baseUrl}/transactions`, 'GET'],
    [`${baseUrl}/transactions`, 'POST'], [`${baseUrl}/transactions/7`, 'PUT'],
    [`${baseUrl}/transactions/7`, 'DELETE'], [`${baseUrl}/budgets`, 'GET'],
    [`${baseUrl}/budgets`, 'PUT'], [`${baseUrl}/budgets/2`, 'DELETE'],
  ]);
  assert.deepEqual(requests[2].body, input);
  assert.deepEqual(requests[3].body, { ...input, amount: 0.3 });
  assert.deepEqual(requests[6].body, { category: 'Food', month: '2024-02', amount: 100 });
});

test('missing API configuration rejects explicitly without making a request', async () => {
  let called = false;
  const api = createApiClient({ fetch: async () => { called = true; throw new Error(); } });
  await assert.rejects(api.getTransactions(), { code: 'SERVER_ERROR', message: /VITE_API_BASE_URL/ });
  assert.equal(called, false);
});

test('normalizes NestJS validation arrays and agreed field errors into readable serializable errors', async () => {
  await assert.rejects(fixture({ statusCode: 400, message: ['amount must be positive', 'date is required'] }, 400).getTransactions(), {
    code: 'VALIDATION_ERROR', status: 400, message: 'amount must be positive date is required',
  });
  assert.deepEqual(normalizeApiError({ error: {
    code: 'VALIDATION_ERROR', message: 'Check your amount.', fieldErrors: { amount: 'Enter a positive amount.', bogus: 'ignored' },
  } }, 400), {
    code: 'VALIDATION_ERROR', message: 'Check your amount.', status: 400, fieldErrors: { amount: 'Enter a positive amount.' },
  });
});

test('missing transaction and conflicts produce useful messages', async () => {
  await assert.rejects(fixture({}, 404).deleteTransaction(7), {
    code: 'NOT_FOUND', status: 404, message: 'Transaction not found. Reload the list and try again.',
  });
  await assert.rejects(fixture({}, 409).saveBudget(budget), { code: 'CONFLICT', message: /Reload/ });
});

test('network, server and non-JSON failures never turn into seed data or leak raw error pages', async () => {
  const network = createApiClient({ baseUrl, fetch: async () => { throw new TypeError('fetch failed'); } });
  await assert.rejects(network.getTransactions(), { code: 'NETWORK_ERROR', message: /Unable to reach/ });
  await assert.rejects(fixture({ message: 'Database stack and secrets' }, 500).getBudgets(), {
    code: 'SERVER_ERROR', status: 500, message: 'The server could not complete the request. Please try again.',
  });
  const html = createApiClient({ baseUrl, fetch: async () => new Response('<html>Failure</html>', { status: 502 }) });
  await assert.rejects(html.getTransactions(), { code: 'SERVER_ERROR', message: /server could not/ });
});

test('malformed successes, invalid records and duplicate identities are rejected', async () => {
  const invalid = [
    [transaction], { data: null }, { data: [transaction, transaction] },
    { data: [{ ...transaction, date: '26/10' }] }, { data: [{ ...transaction, date: '2023-02-29' }] },
    { data: [{ ...transaction, category: 'Salary' }] }, { data: [{ ...transaction, amount: 0.001 }] },
    { data: [{ ...transaction, amount: 0 }] }, { data: [{ ...transaction, id: '7' }] },
    { data: [{ ...transaction, date: '9999-01-01' }] },
  ];
  for (const payload of invalid) await assert.rejects(fixture(payload).getTransactions(), { code: 'INVALID_RESPONSE' });
  await assert.rejects(fixture({ data: [budget, { ...budget, id: 3 }] }).getBudgets(), { code: 'INVALID_RESPONSE' });
  await assert.rejects(fixture({ data: { income: ['Salary'], expense: expenseCategories } }).getCategories(), { code: 'INVALID_RESPONSE' });
});

test('responses cannot update or delete the wrong identity', async () => {
  await assert.rejects(fixture({ data: { ...transaction, id: 8 } }).updateTransaction({ id: 7, changes: transaction }), { code: 'INVALID_RESPONSE' });
  await assert.rejects(fixture({ data: 8 }).deleteTransaction(7), { code: 'INVALID_RESPONSE' });
  await assert.rejects(fixture({ data: 3 }).deleteBudget(2), { code: 'INVALID_RESPONSE' });
  await assert.rejects(fixture({ data: { ...budget, month: '2024-03' } }).saveBudget(budget), { code: 'INVALID_RESPONSE' });
});

test('invalid mutation inputs are rejected before fetch, including repeated/outdated invalid IDs', async () => {
  let calls = 0;
  const api = createApiClient({ baseUrl, fetch: async () => { calls++; return new Response('{}'); } });
  for (const amount of [0, -1, NaN, Infinity, 1.001, 10_000_001]) {
    await assert.rejects(api.createTransaction({ ...transaction, amount }), { code: 'VALIDATION_ERROR' });
  }
  await assert.rejects(api.createTransaction({ ...transaction, category: 'Salary' } as unknown as TransactionInput), { code: 'VALIDATION_ERROR' });
  await assert.rejects(api.createTransaction({ ...transaction, date: '2024-02-30' }), { code: 'VALIDATION_ERROR' });
  await assert.rejects(api.saveBudget({ ...budget, month: '2024-13' }), { code: 'VALIDATION_ERROR' });
  await assert.rejects(api.deleteTransaction(0), { code: 'VALIDATION_ERROR' });
  await assert.rejects(api.deleteBudget(NaN), { code: 'VALIDATION_ERROR' });
  assert.equal(calls, 0);
});

test('pre-aborted requests do not fetch; active cancellations and timeouts normalize and do not retry', async () => {
  const before = new AbortController();
  before.abort();
  let calls = 0;
  const fetch: typeof globalThis.fetch = async (_url, init) => {
    calls++;
    return new Promise((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
    });
  };
  const api = createApiClient({ baseUrl, fetch, timeoutMs: 20 });
  await assert.rejects(api.getTransactions({ signal: before.signal }), { code: 'ABORTED' });
  assert.equal(calls, 0);
  const active = new AbortController();
  const request = api.getBudgets({ signal: active.signal });
  active.abort();
  await assert.rejects(request, { code: 'ABORTED' });
  await assert.rejects(api.createTransaction(transaction), { code: 'NETWORK_ERROR', message: /timed out.*may have saved/ });
  assert.equal(calls, 2);
});
