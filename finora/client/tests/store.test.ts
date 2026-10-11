import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { createAppStore } from '../src/store/store.ts';
import { selectAllTimeBalance } from '../src/store/selectors.ts';
import type { BudgetsState, Transaction, TransactionsState } from '../src/types.ts';

test('store factory registers supplied reducers, supports thunks and keeps instances isolated', async () => {
  // Test-only reducers: this does not verify or replace Alaa's missing slices.
  const request = { status: 'idle' as const, error: null, requestId: null };
  const initialTransactions: TransactionsState = {
    items: [], fetch: { ...request }, mutation: { ...request, target: null },
  };
  const initialBudgets: BudgetsState = {
    items: [], fetch: { ...request }, mutation: { ...request, target: null },
  };
  const load = createAsyncThunk('test/load', async (): Promise<Transaction[]> => [
    { id: 1, type: 'income', amount: 0.3, category: 'Salary', date: '2024-02-01' },
    { id: 2, type: 'expense', amount: 0.1, category: 'Food', date: '2024-02-02' },
  ]);
  const transactions = createSlice({
    name: 'testTransactions', initialState: initialTransactions, reducers: {},
    extraReducers: (builder) => builder.addCase(load.fulfilled, (state, action) => { state.items = action.payload; }),
  });
  const budgets = createSlice({ name: 'testBudgets', initialState: initialBudgets, reducers: {} });
  const reducers = { transactions: transactions.reducer, budgets: budgets.reducer };
  const store = createAppStore(reducers);
  const separate = createAppStore(reducers);
  assert.deepEqual(Object.keys(store.getState()), ['transactions', 'budgets']);
  await store.dispatch(load()).unwrap();
  assert.equal(selectAllTimeBalance(store.getState()), 0.2);
  assert.equal(selectAllTimeBalance(separate.getState()), 0);
});
