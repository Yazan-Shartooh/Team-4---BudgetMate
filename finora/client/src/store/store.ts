import { configureStore } from '@reduxjs/toolkit';
import type { Reducer } from '@reduxjs/toolkit';
import type { BudgetsState, TransactionsState } from '../types.ts';

export interface FinanceReducers {
  transactions: Reducer<TransactionsState>;
  budgets: Reducer<BudgetsState>;
}

/**
 * Pass Alaa's default slice exports here once available. Both slice files are
 * currently empty; intentionally do not substitute mock or no-op reducers.
 * See finora/SHARED-DATA-REPORT.md for the remaining singleton/bootstrap wiring.
 */
export function createAppStore(reducers: FinanceReducers) {
  return configureStore({ reducer: reducers });
}

export type AppStore = ReturnType<typeof createAppStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
