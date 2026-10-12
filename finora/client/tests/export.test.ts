import assert from "node:assert/strict";
import { test } from "node:test";
import * as XLSX from "xlsx";
import { createExportWorkbook } from "../src/utils/excelWorkbook.ts";
import type { BudgetUsage, Transaction } from "../src/types.ts";

const filteredIncome: Transaction = {
  id: 9,
  type: "income",
  category: "Freelance",
  amount: 123.45,
  date: "2026-10-09",
  note: "Filtered row",
};

test("record workbook contains exactly the supplied filtered rows", () => {
  const workbook = createExportWorkbook({
    kind: "records",
    fileName: "income-2026-10.xlsx",
    rows: [filteredIncome],
  });
  const bytes = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  const reopened = XLSX.read(bytes, { type: "buffer" });
  const rows = XLSX.utils.sheet_to_json(reopened.Sheets.Transactions, {
    header: 1,
  });

  assert.equal(bytes.subarray(0, 2).toString("hex"), "504b");
  assert.deepEqual(reopened.SheetNames, ["Transactions"]);
  assert.deepEqual(rows, [
    ["Date", "Type", "Category", "Amount (USD)", "Note"],
    ["2026-10-09", "Income", "Freelance", 123.45, "Filtered row"],
  ]);
});

test("monthly report workbook has summary, selected-month transactions and budget comparison", () => {
  const transaction: Transaction = {
    id: 10,
    type: "expense",
    category: "Food",
    amount: 25,
    date: "2024-02-10",
  };
  const noBudget: BudgetUsage = {
    category: "Food",
    month: "2024-02",
    budgetId: null,
    budgetAmount: null,
    spent: 25,
    remaining: null,
    exceeded: null,
    usagePercentage: null,
    status: "no-budget",
  };
  const workbook = createExportWorkbook({
    kind: "report",
    fileName: "report-2024-02.xlsx",
    month: "2024-02",
    summary: {
      month: "2024-02",
      income: 0,
      expenses: 25,
      savings: -25,
      savingsRate: null,
      overspent: true,
      transactionCount: 1,
    },
    transactions: [transaction],
    breakdown: [{ category: "Food", amount: 25, percentage: 100 }],
    largestCategory: { category: "Food", amount: 25, percentage: 100 },
    budgets: [noBudget],
  });
  const bytes = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  const reopened = XLSX.read(bytes, { type: "buffer" });
  const summary = reopened.Sheets.Summary;
  const transactions = reopened.Sheets.Transactions;
  const budgets = reopened.Sheets["Budget comparison"];

  assert.deepEqual(reopened.SheetNames, [
    "Summary",
    "Transactions",
    "Budget comparison",
  ]);
  assert.equal(summary.B2.v, "2024-02");
  assert.equal(summary.B5.v, -25);
  assert.equal(summary.B6.v, "N/A");
  assert.equal(summary.C12.v, 1);
  assert.equal(transactions.A2.v, "2024-02-10");
  assert.equal(transactions.D2.v, 25);
  assert.equal(budgets.A2.v, "Food");
  assert.equal(budgets.B2.v, "No budget");
  assert.equal(budgets.G2.v, "No budget");
});
