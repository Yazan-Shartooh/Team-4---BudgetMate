import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Budget, FinanceState, SharedSelectors, Transaction, TransactionFilters } from '../src/types.ts';
import * as selectors from '../src/store/selectors.ts';

// Compile-time check of every agreed selector export and signature.
const contract: SharedSelectors = selectors;
const month = '2024-02';
const all: TransactionFilters = { type: 'all', category: 'all', month: '', query: '' };
function state(items: Transaction[] = [], budgets: Budget[] = []): FinanceState {
  const request = { status: 'succeeded' as const, error: null, requestId: null };
  return {
    transactions: { items, fetch: { ...request }, mutation: { ...request, target: null } },
    budgets: { items: budgets, fetch: { ...request }, mutation: { ...request, target: null } },
  };
}
function expense(id: number, amount: number, category: 'Food' | 'Shopping' | 'Transport' = 'Food', date = `${month}-10`): Transaction {
  return { id, type: 'expense', amount, category, date };
}
function income(id: number, amount: number, date = `${month}-01`): Transaction {
  return { id, type: 'income', amount, category: 'Salary', date };
}
function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}

test('monthly totals separate all-time balance and include unbudgeted expenses', () => {
  const data = state([income(1, 100), expense(2, 20), expense(3, 5, 'Shopping'), income(4, 50, '2024-01-01')]);
  assert.deepEqual(contract.selectMonthlySummary(data, month), {
    month, income: 100, expenses: 25, savings: 75, savingsRate: 75, overspent: false, transactionCount: 3,
  });
  assert.equal(contract.selectAllTimeBalance(data), 125);
  const shopping = contract.selectBudgetUsage(data, month).find((row) => row.category === 'Shopping');
  assert.deepEqual(shopping, {
    month, category: 'Shopping', spent: 5, status: 'no-budget', budgetId: null,
    budgetAmount: null, remaining: null, exceeded: null, usagePercentage: null,
  });
});

test('empty months and zero denominators return zeros and unavailable savings rate', () => {
  const data = state([income(1, 100)]);
  assert.deepEqual(contract.selectMonthlySummary(data, '2024-03'), {
    month: '2024-03', income: 0, expenses: 0, savings: 0, savingsRate: null, overspent: false, transactionCount: 0,
  });
  assert.equal(contract.selectLargestSpendingCategory(data, month), null);
  assert.equal(contract.selectExpenseBreakdown(data, month).length, 7);
  assert.ok(contract.selectExpenseBreakdown(data, month).every((row) => row.percentage === 0 && row.amount === 0));
  assert.ok(contract.selectIncomeSources(state(), all).every((row) => row.percentage === 0));
});

test('negative savings remain negative with and without income', () => {
  const summary = contract.selectMonthlySummary(state([income(1, 10), expense(2, 15)]), month);
  assert.equal(summary.savings, -5);
  assert.equal(summary.savingsRate, -50);
  assert.equal(summary.overspent, true);
  const noIncome = contract.selectMonthlySummary(state([expense(1, 0.01)]), month);
  assert.equal(noIncome.savings, -0.01);
  assert.equal(noIncome.savingsRate, null);
  assert.equal(noIncome.overspent, true);
});

for (const [spent, expected] of [[79.99, 'on-track'], [80, 'near-limit'], [100, 'near-limit'], [100.01, 'exceeded']] as const) {
  test(`budget boundary ${spent}% is ${expected}`, () => {
    const data = state([expense(1, spent)], [{ id: 1, month, category: 'Food', amount: 100 }]);
    const food = contract.selectBudgetUsage(data, month)[0];
    assert.equal(food.status, expected);
    assert.equal(food.remaining, Math.round((100 - spent) * 100) / 100);
    assert.equal(food.exceeded, spent > 100 ? 0.01 : 0);
    assert.ok(Math.abs(food.usagePercentage! - spent) < 1e-10);
    assert.equal(contract.selectBudgetAlerts(data, month).length, expected === 'on-track' ? 0 : 1);
  });
}

test('sub-dollar budgets use exact cents and never classify rounded percentages', () => {
  const budgets: Budget[] = [{ id: 1, month, category: 'Food', amount: 0.05 }];
  assert.equal(contract.selectBudgetUsage(state([expense(1, 0.04)], budgets), month)[0].status, 'near-limit');
  assert.equal(contract.selectBudgetUsage(state([expense(1, 0.05)], budgets), month)[0].status, 'near-limit');
  const exceeded = contract.selectBudgetUsage(state([expense(1, 0.06)], budgets), month)[0];
  assert.equal(exceeded.status, 'exceeded');
  assert.equal(exceeded.exceeded, 0.01);
  assert.equal(exceeded.usagePercentage, 120);
  const almost = state([expense(1, 7999.99)], [{ id: 1, month, category: 'Food', amount: 10000 }]);
  assert.equal(contract.selectBudgetUsage(almost, month)[0].status, 'on-track');
});

test('decimal money remains consistent across summaries, categories, filters and budgets', () => {
  const data = state([income(1, 0.3), expense(2, 0.1), expense(3, 0.2)], [
    { id: 1, month, category: 'Food', amount: 0.3 },
  ]);
  assert.equal(contract.selectMonthlySummary(data, month).expenses, 0.3);
  assert.equal(contract.selectMonthlySummary(data, month).savings, 0);
  assert.equal(contract.selectAllTimeBalance(data), 0);
  assert.equal(contract.selectFilteredTotals(data, all).expenses, 0.3);
  assert.equal(contract.selectExpenseBreakdown(data, month)[0].amount, 0.3);
  assert.equal(contract.selectExpenseBreakdown(data, month)[0].percentage, 100);
  assert.equal(contract.selectBudgetUsage(data, month)[0].remaining, 0);
  assert.equal(contract.selectBudgetUsage(data, month)[0].status, 'near-limit');
});

test('combined filters, optional notes, income-only sources and deterministic ties', () => {
  const data = state([
    { ...income(1, 75), note: 'Monthly salary' },
    { id: 2, type: 'income', category: 'Gift', amount: 25, date: `${month}-10` },
    expense(3, 10), expense(4, 10, 'Transport'), income(5, 99, '2024-01-01'),
  ]);
  const filtered = { ...all, type: 'income' as const, category: 'Salary' as const, month, query: ' SALARY ' };
  assert.deepEqual(contract.selectFilteredTransactions(data, filtered).map((row) => row.id), [1]);
  assert.deepEqual(contract.selectFilteredTransactions(data, { ...filtered, query: 'absent' }), []);
  const sources = contract.selectIncomeSources(data, { ...all, type: 'expense', month });
  assert.equal(sources.length, 4);
  assert.deepEqual(sources[0], { category: 'Salary', amount: 75, percentage: 75 });
  assert.deepEqual(sources[1], { category: 'Gift', amount: 25, percentage: 25 });
  assert.equal(contract.selectLargestSpendingCategory(data, month)?.category, 'Food');
  assert.equal(contract.selectExpenseBreakdown(data, month)[0].percentage, 50);
});

test('recent rows are newest first across history, tie by numeric ID, with optional month', () => {
  const data = state([expense(2, 1), income(3, 1, '2024-03-01'), expense(10, 1), income(4, 1, '2024-01-01')]);
  assert.deepEqual(contract.selectRecentTransactions(data).map((row) => row.id), [3, 10, 2, 4]);
  assert.deepEqual(contract.selectRecentTransactions(data, 1, month).map((row) => row.id), [10]);
  assert.deepEqual(contract.selectRecentTransactions(data, 0), []);
  assert.deepEqual(contract.selectRecentTransactions(data, -1), []);
});

test('selectors do not mutate frozen state and memoize unchanged inputs', () => {
  const data = deepFreeze(state([expense(1, 20), income(2, 100)], [{ id: 1, category: 'Food', month, amount: 25 }]));
  const before = JSON.stringify(data);
  contract.selectFilteredTransactions(data, all);
  contract.selectFilteredTotals(data, all);
  contract.selectIncomeSources(data, all);
  contract.selectRecentTransactions(data);
  contract.selectAllTimeBalance(data);
  contract.selectLargestSpendingCategory(data, month);
  contract.selectBudgetAlerts(data, month);
  assert.strictEqual(contract.selectBudgetUsage(data, month), contract.selectBudgetUsage(data, month));
  assert.strictEqual(contract.selectMonthlySummary(data, month), contract.selectMonthlySummary(data, month));
  assert.equal(JSON.stringify(data), before);
});

test('replacement state after edits, month/category moves, deletion and budget removal recalculates', () => {
  const budgets: Budget[] = [{ id: 1, month, category: 'Food', amount: 100 }];
  const initial = state([income(1, 200), expense(2, 110)], budgets);
  assert.equal(contract.selectBudgetUsage(initial, month)[0].status, 'exceeded');
  const edited = state([income(1, 200), expense(2, 80)], budgets);
  assert.equal(contract.selectBudgetUsage(edited, month)[0].status, 'near-limit');
  const moved = state([income(1, 200), expense(2, 80, 'Transport', '2024-03-01')], budgets);
  assert.equal(contract.selectMonthlySummary(moved, month).expenses, 0);
  assert.equal(contract.selectLargestSpendingCategory(moved, '2024-03')?.category, 'Transport');
  assert.equal(contract.selectAllTimeBalance(moved), 120);
  assert.equal(contract.selectAllTimeBalance(state([income(1, 200)], budgets)), 200);
  const removedBudget = state(edited.transactions.items);
  assert.equal(contract.selectBudgetUsage(removedBudget, month)[0].status, 'no-budget');
  assert.equal(contract.selectMonthlySummary(removedBudget, month).expenses, 80);
});

test('current month comes from local runtime date on each call, including rollover', () => {
  assert.equal(selectors.getCurrentMonth(new Date(2031, 11, 31, 23, 59)), '2031-12');
  assert.equal(selectors.getCurrentMonth(new Date(2032, 0, 1, 0, 1)), '2032-01');
  const now = new Date();
  assert.equal(selectors.getCurrentMonth(), `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
});

test('unsafe cent aggregates fail explicitly instead of silently losing money', () => {
  const data = state([income(1, Number.MAX_SAFE_INTEGER / 100), income(2, 1)]);
  assert.throws(() => contract.selectAllTimeBalance(data), /safe cent precision/);
});
