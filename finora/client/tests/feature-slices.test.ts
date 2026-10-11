import assert from "node:assert/strict";
import { test } from "node:test";
import { initialFinanceState, reduceFinanceState } from "../src/store/store.ts";
import {
  selectAllTimeBalance,
  selectBudgetUsage,
  selectMonthlySummary,
} from "../src/store/selectors.ts";
import type {
  ApiError,
  FinanceState,
  Transaction,
  TransactionInput,
} from "../src/types.ts";

const transaction: Transaction = {
  id: 1,
  type: "expense",
  category: "Food",
  amount: 80,
  date: "2024-02-10",
};
const budget = {
  id: 1,
  category: "Food" as const,
  month: "2024-02",
  amount: 100,
};
const failure: ApiError = {
  code: "NOT_FOUND",
  message: "Transaction not found.",
};

function reduce(
  state: FinanceState,
  action: Parameters<typeof reduceFinanceState>[1],
): FinanceState {
  return reduceFinanceState(state, action);
}

test("initial finance state starts empty and idle", () => {
  assert.deepEqual(initialFinanceState.transactions.items, []);
  assert.deepEqual(initialFinanceState.budgets.items, []);
  assert.equal(initialFinanceState.transactions.fetch.status, "idle");
  assert.equal(initialFinanceState.budgets.fetch.status, "idle");
});

test("fetches and mutations update shared records and derived totals", () => {
  let state = reduce(initialFinanceState, {
    type: "transactions/fetch-started",
    requestId: "fetch",
  });
  state = reduce(state, {
    type: "transactions/fetch-succeeded",
    requestId: "fetch",
    items: [transaction],
  });
  state = reduce(state, {
    type: "budgets/fetch-started",
    requestId: "budgets",
  });
  state = reduce(state, {
    type: "budgets/fetch-succeeded",
    requestId: "budgets",
    items: [budget],
  });
  assert.equal(selectBudgetUsage(state, "2024-02")[0].status, "near-limit");

  const income: TransactionInput = {
    type: "income",
    category: "Salary",
    amount: 100,
    date: "2024-02-01",
  };
  state = reduce(state, {
    type: "transactions/mutation-started",
    requestId: "create",
    target: { operation: "create" },
  });
  state = reduce(state, {
    type: "transactions/mutation-succeeded",
    requestId: "create",
    operation: "create",
    transaction: { ...income, id: 2 },
  });
  assert.equal(selectAllTimeBalance(state), 20);

  state = reduce(state, {
    type: "transactions/mutation-started",
    requestId: "update",
    target: { operation: "update", id: 1 },
  });
  state = reduce(state, {
    type: "transactions/mutation-succeeded",
    requestId: "update",
    operation: "update",
    transaction: { ...transaction, amount: 100.01 },
  });
  assert.equal(selectBudgetUsage(state, "2024-02")[0].status, "exceeded");
  assert.equal(selectMonthlySummary(state, "2024-02").savings, -0.01);

  state = reduce(state, {
    type: "transactions/mutation-started",
    requestId: "delete",
    target: { operation: "delete", id: 1 },
  });
  state = reduce(state, {
    type: "transactions/mutation-succeeded",
    requestId: "delete",
    operation: "delete",
    id: 1,
  });
  assert.equal(selectAllTimeBalance(state), 100);
});

test("pending operations cannot be cleared and failures preserve records", () => {
  let state = reduce(initialFinanceState, {
    type: "transactions/fetch-started",
    requestId: "fetch",
  });
  state = reduce(state, {
    type: "transactions/fetch-succeeded",
    requestId: "fetch",
    items: [transaction],
  });
  state = reduce(state, {
    type: "transactions/mutation-started",
    requestId: "delete",
    target: { operation: "delete", id: 1 },
  });
  state = reduce(state, { type: "transactions/mutation-cleared" });
  assert.equal(state.transactions.mutation.status, "pending");
  state = reduce(state, {
    type: "transactions/mutation-failed",
    requestId: "delete",
    error: failure,
  });
  assert.deepEqual(state.transactions.items, [transaction]);
  assert.deepEqual(state.transactions.mutation.error, failure);
});

test("stale responses are ignored and budget upserts deduplicate category and month", () => {
  let state = reduce(initialFinanceState, {
    type: "transactions/fetch-started",
    requestId: "current",
  });
  const pending = state;
  state = reduce(state, {
    type: "transactions/fetch-succeeded",
    requestId: "stale",
    items: [transaction],
  });
  assert.equal(state, pending);
  state = reduce(state, {
    type: "transactions/fetch-succeeded",
    requestId: "current",
    items: [transaction],
  });
  state = reduce(state, {
    type: "budgets/mutation-started",
    requestId: "save",
    target: { operation: "save", key: { category: "Food", month: "2024-02" } },
  });
  state = reduce(state, {
    type: "budgets/mutation-succeeded",
    requestId: "save",
    operation: "save",
    budget,
  });
  const changed = { ...budget, amount: 50 };
  state = reduce(state, {
    type: "budgets/mutation-started",
    requestId: "update-budget",
    target: { operation: "save", key: { category: "Food", month: "2024-02" } },
  });
  state = reduce(state, {
    type: "budgets/mutation-succeeded",
    requestId: "update-budget",
    operation: "save",
    budget: changed,
  });
  assert.equal(state.budgets.items.length, 1);
  assert.equal(selectBudgetUsage(state, "2024-02")[0].exceeded, 30);
});

test("expense edits, category and month moves, and deletion recalculate budget rows", () => {
  let state = reduce(initialFinanceState, {
    type: "transactions/fetch-started",
    requestId: "transactions-fetch",
  });
  state = reduce(state, {
    type: "transactions/fetch-succeeded",
    requestId: "transactions-fetch",
    items: [transaction],
  });
  state = reduce(state, {
    type: "budgets/fetch-started",
    requestId: "budgets-fetch",
  });
  state = reduce(state, {
    type: "budgets/fetch-succeeded",
    requestId: "budgets-fetch",
    items: [
      budget,
      { id: 2, category: "Transport", month: "2024-02", amount: 100 },
      { id: 3, category: "Transport", month: "2024-03", amount: 100 },
    ],
  });

  state = reduce(state, {
    type: "transactions/mutation-started",
    requestId: "move-category",
    target: { operation: "update", id: transaction.id },
  });
  state = reduce(state, {
    type: "transactions/mutation-succeeded",
    requestId: "move-category",
    operation: "update",
    transaction: { ...transaction, category: "Transport", amount: 120 },
  });
  const february = selectBudgetUsage(state, "2024-02");
  assert.equal(february.find((row) => row.category === "Food")?.spent, 0);
  assert.equal(
    february.find((row) => row.category === "Transport")?.exceeded,
    20,
  );

  state = reduce(state, {
    type: "transactions/mutation-started",
    requestId: "move-month",
    target: { operation: "update", id: transaction.id },
  });
  state = reduce(state, {
    type: "transactions/mutation-succeeded",
    requestId: "move-month",
    operation: "update",
    transaction: {
      ...transaction,
      category: "Transport",
      amount: 120,
      date: "2024-03-01",
    },
  });
  assert.equal(
    selectBudgetUsage(state, "2024-02").find(
      (row) => row.category === "Transport",
    )?.spent,
    0,
  );
  assert.equal(
    selectBudgetUsage(state, "2024-03").find(
      (row) => row.category === "Transport",
    )?.exceeded,
    20,
  );

  state = reduce(state, {
    type: "transactions/mutation-started",
    requestId: "delete-expense",
    target: { operation: "delete", id: transaction.id },
  });
  state = reduce(state, {
    type: "transactions/mutation-succeeded",
    requestId: "delete-expense",
    operation: "delete",
    id: transaction.id,
  });
  assert.equal(
    selectBudgetUsage(state, "2024-03").find(
      (row) => row.category === "Transport",
    )?.spent,
    0,
  );
});

test("removing a budget leaves its spending in transaction totals", () => {
  let state = reduce(initialFinanceState, {
    type: "transactions/fetch-started",
    requestId: "transactions-fetch",
  });
  state = reduce(state, {
    type: "transactions/fetch-succeeded",
    requestId: "transactions-fetch",
    items: [transaction],
  });
  state = reduce(state, {
    type: "budgets/fetch-started",
    requestId: "budgets-fetch",
  });
  state = reduce(state, {
    type: "budgets/fetch-succeeded",
    requestId: "budgets-fetch",
    items: [budget],
  });
  state = reduce(state, {
    type: "budgets/mutation-started",
    requestId: "delete-budget",
    target: { operation: "delete", id: budget.id },
  });
  state = reduce(state, {
    type: "budgets/mutation-succeeded",
    requestId: "delete-budget",
    operation: "delete",
    id: budget.id,
  });

  assert.deepEqual(state.transactions.items, [transaction]);
  assert.equal(selectMonthlySummary(state, "2024-02").expenses, 80);
  const food = selectBudgetUsage(state, "2024-02").find(
    (row) => row.category === "Food",
  );
  assert.equal(food?.spent, 80);
  assert.equal(food?.status, "no-budget");
});

test("failed budget saves retain existing budgets and expose a retryable error", () => {
  let state = reduce(initialFinanceState, {
    type: "budgets/fetch-started",
    requestId: "budgets-fetch",
  });
  state = reduce(state, {
    type: "budgets/fetch-succeeded",
    requestId: "budgets-fetch",
    items: [budget],
  });
  state = reduce(state, {
    type: "budgets/mutation-started",
    requestId: "save-budget",
    target: { operation: "save", key: { category: "Food", month: "2024-02" } },
  });
  state = reduce(state, { type: "budgets/mutation-cleared" });
  assert.equal(state.budgets.mutation.status, "pending");

  state = reduce(state, {
    type: "budgets/mutation-failed",
    requestId: "save-budget",
    error: failure,
  });
  assert.deepEqual(state.budgets.items, [budget]);
  assert.deepEqual(state.budgets.mutation.error, failure);
  state = reduce(state, { type: "budgets/mutation-cleared" });
  assert.equal(state.budgets.mutation.status, "idle");
});
