import * as XLSX from "xlsx";
import type {
  BudgetStatus,
  BudgetUsage,
  CategoryTotal,
  ExpenseCategory,
  Month,
  MonthlySummary,
  Transaction,
} from "../types";

/** Data for exporting the rows already filtered by an Income or Transactions view. */
export interface RecordWorkbookData {
  kind: "records";
  fileName: string;
  rows: readonly Transaction[];
}

/** Data for exporting a report month and its corresponding transactions/budgets. */
export interface ReportWorkbookData {
  kind: "report";
  fileName: string;
  month: Month;
  summary: MonthlySummary;
  transactions: readonly Transaction[];
  breakdown: readonly CategoryTotal<ExpenseCategory>[];
  largestCategory: CategoryTotal<ExpenseCategory> | null;
  budgets: readonly BudgetUsage[];
}

export type ExcelWorkbookData = RecordWorkbookData | ReportWorkbookData;

const budgetStatusLabels: Record<BudgetStatus, string> = {
  "on-track": "On track",
  "near-limit": "Near limit",
  exceeded: "Exceeded",
  "no-budget": "No budget",
};

const currencyFormat = '"$"#,##0.00';

function setNumberFormat(
  worksheet: XLSX.WorkSheet,
  row: number,
  column: number,
  format: string,
): void {
  const cell = worksheet[XLSX.utils.encode_cell({ r: row, c: column })];
  if (cell && typeof cell.v === "number") cell.z = format;
}

function transactionRows(rows: readonly Transaction[]) {
  return [
    ["Date", "Type", "Category", "Amount (USD)", "Note"],
    ...rows.map((row) => [
      row.date,
      row.type === "income" ? "Income" : "Expense",
      row.category,
      row.amount,
      row.note ?? "",
    ]),
  ];
}

/** Build workbook data without changing or refiltering the supplied rows. */
export function createExportWorkbook(data: ExcelWorkbookData): XLSX.WorkBook {
  const workbook = XLSX.utils.book_new();

  if (data.kind === "records") {
    const worksheet = XLSX.utils.aoa_to_sheet(transactionRows(data.rows));
    worksheet["!cols"] = [
      { wch: 14 },
      { wch: 12 },
      { wch: 22 },
      { wch: 18 },
      { wch: 40 },
    ];
    for (let row = 1; row <= data.rows.length; row++) {
      setNumberFormat(worksheet, row, 3, currencyFormat);
    }
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
    return workbook;
  }

  const summaryRows = [
    ["Metric", "Value"],
    ["Month", data.month],
    ["Income", data.summary.income],
    ["Expenses", data.summary.expenses],
    ["Savings", data.summary.savings],
    [
      "Savings rate",
      data.summary.savingsRate === null
        ? "N/A"
        : data.summary.savingsRate / 100,
    ],
    ["Overspent", data.summary.overspent ? "Yes" : "No"],
    ["Largest spending category", data.largestCategory?.category ?? "None"],
    ["Largest category amount", data.largestCategory?.amount ?? "N/A"],
    [],
    ["Expense category", "Amount (USD)", "Share of expenses"],
    ...data.breakdown.map((row) => [
      row.category,
      row.amount,
      row.percentage / 100,
    ]),
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows);
  summarySheet["!cols"] = [{ wch: 30 }, { wch: 24 }, { wch: 22 }];
  for (const row of [2, 3, 4, 8]) {
    setNumberFormat(summarySheet, row, 1, currencyFormat);
  }
  if (data.summary.savingsRate !== null) {
    setNumberFormat(summarySheet, 5, 1, "0.0%");
  }
  for (let row = 11; row < summaryRows.length; row++) {
    setNumberFormat(summarySheet, row, 1, currencyFormat);
    setNumberFormat(summarySheet, row, 2, "0.0%");
  }
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

  const transactionsSheet = XLSX.utils.aoa_to_sheet(
    transactionRows(data.transactions),
  );
  transactionsSheet["!cols"] = [
    { wch: 14 },
    { wch: 12 },
    { wch: 22 },
    { wch: 18 },
    { wch: 40 },
  ];
  for (let row = 1; row <= data.transactions.length; row++) {
    setNumberFormat(transactionsSheet, row, 3, currencyFormat);
  }
  XLSX.utils.book_append_sheet(workbook, transactionsSheet, "Transactions");

  const budgetRows = [
    [
      "Category",
      "Monthly budget",
      "Spent",
      "Remaining",
      "Exceeded",
      "Usage",
      "Status",
    ],
    ...data.budgets.map((row) => [
      row.category,
      row.budgetAmount ?? "No budget",
      row.spent,
      row.remaining ?? "N/A",
      row.exceeded ?? "N/A",
      row.usagePercentage === null ? "N/A" : row.usagePercentage / 100,
      budgetStatusLabels[row.status],
    ]),
  ];
  const budgetsSheet = XLSX.utils.aoa_to_sheet(budgetRows);
  budgetsSheet["!cols"] = [
    { wch: 22 },
    { wch: 20 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 14 },
    { wch: 16 },
  ];
  for (let row = 1; row < budgetRows.length; row++) {
    for (const column of [1, 2, 3, 4]) {
      setNumberFormat(budgetsSheet, row, column, currencyFormat);
    }
    setNumberFormat(budgetsSheet, row, 5, "0.0%");
  }
  XLSX.utils.book_append_sheet(workbook, budgetsSheet, "Budget comparison");
  return workbook;
}

export function sanitizeExcelFileName(fileName: string): string {
  const normalized = fileName.trim().replace(/[\\/:*?"<>|]+/g, "-");
  const base = normalized.replace(/\.xlsx$/i, "") || "finora-export";
  return `${base}.xlsx`;
}

export function downloadExcelWorkbook(
  workbook: XLSX.WorkBook,
  fileName: string,
): void {
  XLSX.writeFile(workbook, sanitizeExcelFileName(fileName), {
    bookType: "xlsx",
  });
}
