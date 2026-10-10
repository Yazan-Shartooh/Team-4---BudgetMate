import { configureStore } from '@reduxjs/toolkit';
import type { Reducer } from '@reduxjs/toolkit';
import type { BudgetsState, TransactionsState } from '../types.ts';
import transactions from './transactionsSlice.ts';
import budgets from './budgetsSlice.ts';

export interface FinanceReducers {
  transactions: Reducer<TransactionsState>;
  budgets: Reducer<BudgetsState>;
}

export function createAppStore(reducers: FinanceReducers) {
  return configureStore({ reducer: reducers });
}

export const store = createAppStore({ transactions, budgets });

export type AppStore = ReturnType<typeof createAppStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
