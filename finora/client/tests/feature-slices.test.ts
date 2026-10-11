import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createAppStore } from '../src/store/store.ts';
import transactionsReducer, { createTransaction, updateTransaction, deleteTransaction, fetchTransactions, clearTransactionMutationState } from '../src/store/transactionsSlice.ts';
import budgetsReducer, { saveBudget, deleteBudget, fetchBudgets, clearBudgetMutationState } from '../src/store/budgetsSlice.ts';
import { selectAllTimeBalance, selectBudgetUsage, selectMonthlySummary } from '../src/store/selectors.ts';
import type { ApiError, Transaction, TransactionInput } from '../src/types.ts';

const makeStore = () => createAppStore({ transactions: transactionsReducer, budgets: budgetsReducer });
const transaction: Transaction = { id: 1, type: 'expense', category: 'Food', amount: 80, date: '2024-02-10' };
const budget = { id: 1, category: 'Food' as const, month: '2024-02', amount: 100 };
const failure: ApiError = { code: 'NOT_FOUND', message: 'Transaction not found.' };

test('slice initial states use the agreed keys without seed records', () => {
  const state = makeStore().getState();
  for (const slice of [state.transactions, state.budgets]) {
    assert.deepEqual(slice.items, []);
    assert.equal(slice.fetch.status, 'idle');
    assert.equal(slice.mutation.target, null);
  }
});

test('confirmed fetch/create/edit/delete update one shared state and derived totals', () => {
  const store = makeStore();
  store.dispatch(fetchTransactions.pending('fetch'));
  store.dispatch(fetchTransactions.fulfilled([transaction], 'fetch'));
  store.dispatch(fetchBudgets.pending('budgets'));
  store.dispatch(fetchBudgets.fulfilled([budget], 'budgets'));
  assert.equal(selectBudgetUsage(store.getState(), '2024-02')[0].status, 'near-limit');
  const input: TransactionInput = { type: 'income', category: 'Salary', amount: 100, date: '2024-02-01' };
  store.dispatch(createTransaction.pending('create', input));
  store.dispatch(createTransaction.fulfilled({ ...input, id: 2 }, 'create', input));
  assert.equal(selectAllTimeBalance(store.getState()), 20);
  const update = { id: 1, changes: { ...transaction, amount: 100.01 } };
  store.dispatch(updateTransaction.pending('update', update));
  store.dispatch(updateTransaction.fulfilled({ ...transaction, amount: 100.01 }, 'update', update));
  assert.equal(selectBudgetUsage(store.getState(), '2024-02')[0].status, 'exceeded');
  assert.equal(selectMonthlySummary(store.getState(), '2024-02').savings, -0.01);
  store.dispatch(deleteTransaction.pending('delete', 1));
  store.dispatch(deleteTransaction.fulfilled(1, 'delete', 1));
  assert.equal(selectAllTimeBalance(store.getState()), 100);
});

test('pending operations cannot be cleared; failures retain data and expose retryable errors', () => {
  const store = makeStore();
  store.dispatch(fetchTransactions.pending('fetch'));
  store.dispatch(fetchTransactions.fulfilled([transaction], 'fetch'));
  store.dispatch(deleteTransaction.pending('delete', 1));
  store.dispatch(clearTransactionMutationState());
  assert.equal(store.getState().transactions.mutation.status, 'pending');
  store.dispatch(deleteTransaction.rejected(null, 'delete', 1, failure));
  assert.deepEqual(store.getState().transactions.items, [transaction]);
  assert.deepEqual(store.getState().transactions.mutation.error, failure);
  store.dispatch(clearTransactionMutationState());
  assert.equal(store.getState().transactions.mutation.status, 'idle');
});

test('stale fulfilled/rejected responses cannot overwrite the current request', () => {
  const store = makeStore();
  store.dispatch(fetchTransactions.pending('current'));
  store.dispatch(fetchTransactions.fulfilled([transaction], 'old'));
  store.dispatch(fetchTransactions.rejected(null, 'old', undefined, failure));
  assert.equal(store.getState().transactions.fetch.status, 'pending');
  assert.deepEqual(store.getState().transactions.items, []);
  store.dispatch(fetchTransactions.fulfilled([transaction], 'current'));
  store.dispatch(deleteTransaction.fulfilled(1, 'old-delete', 1));
  assert.equal(store.getState().transactions.items.length, 1);
});

test('atomic budget upsert deduplicates category/month and removal preserves spending', () => {
  const store = makeStore();
  store.dispatch(fetchTransactions.pending('fetch'));
  store.dispatch(fetchTransactions.fulfilled([transaction], 'fetch'));
  store.dispatch(saveBudget.pending('save', budget));
  store.dispatch(clearBudgetMutationState());
  assert.equal(store.getState().budgets.mutation.status, 'pending');
  store.dispatch(saveBudget.fulfilled(budget, 'save', budget));
  const changed = { ...budget, amount: 50 };
  store.dispatch(saveBudget.pending('change', changed));
  store.dispatch(saveBudget.fulfilled(changed, 'change', changed));
  assert.equal(store.getState().budgets.items.length, 1);
  assert.equal(selectBudgetUsage(store.getState(), '2024-02')[0].exceeded, 30);
  store.dispatch(deleteBudget.pending('delete', 1));
  store.dispatch(deleteBudget.fulfilled(1, 'delete', 1));
  assert.equal(selectBudgetUsage(store.getState(), '2024-02')[0].status, 'no-budget');
  assert.equal(selectMonthlySummary(store.getState(), '2024-02').expenses, 80);
});

test('thunk conditions reject duplicate and overlapping requests without replacing pending state', async () => {
  const store = makeStore();
  store.dispatch(fetchTransactions.pending('active-fetch'));
  const duplicate = await store.dispatch(fetchTransactions());
  assert.ok(fetchTransactions.rejected.match(duplicate) && duplicate.meta.condition);
  const mutation = await store.dispatch(createTransaction(transaction));
  assert.ok(createTransaction.rejected.match(mutation) && mutation.meta.condition);
  assert.equal(store.getState().transactions.fetch.requestId, 'active-fetch');
  store.dispatch(saveBudget.pending('active-save', budget));
  const fetch = await store.dispatch(fetchBudgets());
  assert.ok(fetchBudgets.rejected.match(fetch) && fetch.meta.condition);
  const remove = await store.dispatch(deleteBudget(1));
  assert.ok(deleteBudget.rejected.match(remove) && remove.meta.condition);
  assert.equal(store.getState().budgets.mutation.requestId, 'active-save');
});

test('unconfigured real API fails visibly, never loading mock data', async () => {
  const store = makeStore();
  await store.dispatch(fetchTransactions());
  assert.equal(store.getState().transactions.fetch.status, 'failed');
  assert.match(store.getState().transactions.fetch.error!.message, /VITE_API_BASE_URL/);
  assert.deepEqual(store.getState().transactions.items, []);
});
