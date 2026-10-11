import { createSelector } from '@reduxjs/toolkit';
import { expenseCategories, incomeCategories } from '../types.ts';
import type {
  BudgetUsage, Category, CategoryTotal, FinanceState, MoneyTotals,
  Month, MonthlySummary, Transaction, TransactionFilters,
} from '../types.ts';

/** Evaluate at render/day rollover, not once when the module is loaded. */
export function getCurrentMonth(now = new Date()): Month {
  return `${String(now.getFullYear()).padStart(4, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function safeCents(value: number): number {
  if (!Number.isSafeInteger(value)) throw new RangeError('Financial total exceeds safe cent precision.');
  return value;
}

function cents(amount: number): number {
  return safeCents(Math.round(amount * 100));
}

function totalCents(rows: readonly Transaction[], type: Transaction['type']): number {
  return rows.reduce((sum, row) => row.type === type ? safeCents(sum + cents(row.amount)) : sum, 0);
}

function totals(rows: readonly Transaction[]): MoneyTotals {
  const income = totalCents(rows, 'income');
  const expenses = totalCents(rows, 'expense');
  return { income: income / 100, expenses: expenses / 100, savings: safeCents(income - expenses) / 100 };
}

function newestFirst(rows: readonly Transaction[]): Transaction[] {
  return [...rows].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
}

function matches(row: Transaction, filters: TransactionFilters): boolean {
  const query = filters.query.trim().toLowerCase();
  return (filters.type === 'all' || row.type === filters.type)
    && (filters.category === 'all' || row.category === filters.category)
    && (!filters.month || row.date.slice(0, 7) === filters.month)
    && (!query || `${row.note ?? ''} ${row.category}`.toLowerCase().includes(query));
}

function categoryTotals<C extends Category>(
  rows: readonly Transaction[], categories: readonly C[], type: Transaction['type'],
): CategoryTotal<C>[] {
  const denominator = totalCents(rows, type);
  return categories.map((category) => {
    const amount = totalCents(rows.filter((row) => row.category === category), type);
    return { category, amount: amount / 100, percentage: denominator ? amount / denominator * 100 : 0 };
  }).sort((a, b) => b.amount - a.amount || categories.indexOf(a.category) - categories.indexOf(b.category));
}

export const selectTransactions = (state: FinanceState): readonly Transaction[] => state.transactions.items;
export const selectBudgets = (state: FinanceState) => state.budgets.items;
const selectedMonth = (_state: FinanceState, month: Month) => month;
const selectedFilters = (_state: FinanceState, filters: TransactionFilters) => filters;

export const selectFilteredTransactions = createSelector(
  [selectTransactions, selectedFilters],
  (rows, filters) => newestFirst(rows.filter((row) => matches(row, filters))),
);

export const selectFilteredTotals = createSelector([selectFilteredTransactions], totals);

export const selectIncomeSources = createSelector(
  [selectTransactions, selectedFilters],
  (rows, filters) => categoryTotals(
    rows.filter((row) => matches(row, { ...filters, type: 'income' })), incomeCategories, 'income',
  ),
);

const selectMonthTransactions = createSelector(
  [selectTransactions, selectedMonth],
  (rows, month) => rows.filter((row) => row.date.slice(0, 7) === month),
);

export const selectMonthlySummary = createSelector(
  [selectMonthTransactions, selectedMonth],
  (rows, month): MonthlySummary => {
    const summary = totals(rows);
    return {
      ...summary, month, transactionCount: rows.length, overspent: summary.savings < 0,
      savingsRate: summary.income === 0 ? null : cents(summary.savings) / cents(summary.income) * 100,
    };
  },
);

export const selectAllTimeBalance = createSelector([selectTransactions], (rows) => totals(rows).savings);

export const selectExpenseBreakdown = createSelector(
  [selectMonthTransactions], (rows) => categoryTotals(rows, expenseCategories, 'expense'),
);

export const selectRecentTransactions = createSelector(
  [
    selectTransactions,
    (_state: FinanceState, limit = 5) => limit,
    (_state: FinanceState, _limit?: number, month?: Month) => month,
  ],
  (rows, limit, month) => {
    if (!Number.isFinite(limit) || limit <= 0) return [];
    return newestFirst(month ? rows.filter((row) => row.date.slice(0, 7) === month) : rows)
      .slice(0, Math.floor(limit));
  },
);

export const selectBudgetUsage = createSelector(
  [selectExpenseBreakdown, selectBudgets, selectedMonth],
  (breakdown, budgets, month): BudgetUsage[] => expenseCategories.map((category) => {
    const spent = breakdown.find((row) => row.category === category)?.amount ?? 0;
    const budget = budgets.find((row) => row.category === category && row.month === month);
    if (!budget) return {
      category, month, spent, budgetId: null, budgetAmount: null,
      remaining: null, exceeded: null, usagePercentage: null, status: 'no-budget',
    };
    const spentCents = cents(spent);
    const budgetCents = cents(budget.amount);
    // ceil(80% of integer cents) without multiplying a large total by 100.
    const nearThreshold = Math.floor(budgetCents / 5) * 4 + Math.ceil((budgetCents % 5) * 4 / 5);
    return {
      category, month, spent, budgetId: budget.id, budgetAmount: budget.amount,
      remaining: safeCents(budgetCents - spentCents) / 100,
      exceeded: Math.max(safeCents(spentCents - budgetCents), 0) / 100,
      usagePercentage: spentCents / budgetCents * 100,
      status: spentCents > budgetCents ? 'exceeded' : spentCents >= nearThreshold ? 'near-limit' : 'on-track',
    };
  }),
);

export const selectBudgetAlerts = createSelector(
  [selectBudgetUsage], (rows) => rows.filter((row) => row.status === 'near-limit' || row.status === 'exceeded'),
);

export const selectLargestSpendingCategory = createSelector(
  [selectExpenseBreakdown], (rows) => rows[0]?.amount > 0 ? rows[0] : null,
);
