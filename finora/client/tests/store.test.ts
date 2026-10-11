import assert from "node:assert/strict";
import { test } from "node:test";
import { initialFinanceState, reduceFinanceState } from "../src/store/store.ts";
test("finance updates are immutable and isolated between provider instances", () => {
  const first = reduceFinanceState(initialFinanceState, {
    type: "transactions/fetch-started",
    requestId: "first-request",
  });
  const second = initialFinanceState;
  assert.equal(first.transactions.fetch.status, "pending");
  assert.equal(second.transactions.fetch.status, "idle");
  assert.equal(initialFinanceState.transactions.fetch.status, "idle");
});

test("stale fetch failures leave the active request unchanged", () => {
  const active = reduceFinanceState(initialFinanceState, {
    type: "budgets/fetch-started",
    requestId: "active-request",
  });
  const unchanged = reduceFinanceState(active, {
    type: "budgets/fetch-failed",
    requestId: "stale-request",
    error: { code: "SERVER_ERROR", message: "Request failed." },
  });
  assert.equal(unchanged, active);
  assert.equal(unchanged.budgets.fetch.status, "pending");
});
