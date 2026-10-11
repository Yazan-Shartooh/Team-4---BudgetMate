export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: number;
  type: TransactionType;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  note: string; // Empty string when the user supplied no note.
  createdAt: string; // ISO timestamp used to break ties in date sorting.
}

export interface TransactionFilter {
  type?: TransactionType;
  category?: string;
  month?: string; // YYYY-MM
}

export type BudgetStatus = 'on_track' | 'near_limit' | 'exceeded' | 'no_budget';

export interface Budget {
  id: number;
  category: string;
  month: string; // YYYY-MM
  amount: number;
}

export interface BudgetUsage {
  category: string;
  month: string;
  budgetId: number | null;
  budget: number | null;
  spent: number;
  remaining: number | null;
  exceededBy: number;
  percentUsed: number | null;
  status: BudgetStatus;
}

export interface SeedTransaction {
  id: number;
  type: TransactionType;
  amount: number;
  category: string;
  date: string;
  note?: string;
}

export interface SeedBudget {
  id: number;
  category: string;
  month: string;
  amount: number;
}
