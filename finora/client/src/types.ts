import type { ReactNode } from 'react';

// Contract only. See ../../FRONTEND-CONTRACT.md for validation and lifecycle rules.
export const incomeCategories = ['Salary', 'Freelance', 'Gift', 'Other Income'] as const;
export const expenseCategories = [
  'Food', 'Transport', 'Housing', 'Bills', 'Health', 'Entertainment', 'Shopping',
] as const;
export type IncomeCategory = (typeof incomeCategories)[number];
export type ExpenseCategory = (typeof expenseCategories)[number];
export type Category = IncomeCategory | ExpenseCategory;
export type TransactionType = 'income' | 'expense';
export type TransactionId = number;
export type BudgetId = number;
/** Validated calendar strings, not timestamps. These aliases do not validate input. */
export type DateOnly = string; // YYYY-MM-DD
export type Month = string; // YYYY-MM
export type Money = number; // USD major units; calculate using integer cents.

export type TransactionInput = {
  amount: Money;
  date: DateOnly;
  note?: string;
} & (
  | { type: 'income'; category: IncomeCategory }
  | { type: 'expense'; category: ExpenseCategory }
);
export type Transaction = TransactionInput & {
  id: TransactionId;
  createdAt?: string; // Server ISO timestamp; never substitutes for transaction date.
};
export interface UpdateTransactionInput {
  id: TransactionId;
  changes: TransactionInput; // Complete editable fields, not a partial patch.
}
export interface BudgetKey { category: ExpenseCategory; month: Month }
export interface BudgetInput extends BudgetKey { amount: Money }
export interface Budget extends BudgetInput { id: BudgetId }
export interface CategoryLists {
  income: readonly IncomeCategory[];
  expense: readonly ExpenseCategory[];
}

export type ApiErrorCode =
  | 'VALIDATION_ERROR' | 'NOT_FOUND' | 'CONFLICT'
  | 'NETWORK_ERROR' | 'SERVER_ERROR' | 'INVALID_RESPONSE' | 'ABORTED';
export type FieldName = 'type' | 'amount' | 'category' | 'date' | 'note' | 'month';
export interface ApiError {
  code: ApiErrorCode;
  message: string;
  status?: number;
  fieldErrors?: Partial<Record<FieldName, string>>;
}
/** Proposed wire format; no corresponding backend endpoints exist yet. */
export interface ApiSuccess<T> { data: T }
export interface ApiFailure { error: ApiError }
export interface ApiRequestOptions { signal?: AbortSignal }
/** Helpers unwrap data, validate responses, and reject with normalized ApiError. */
export interface FrontendApi {
  getCategories(options?: ApiRequestOptions): Promise<CategoryLists>;
  getTransactions(options?: ApiRequestOptions): Promise<Transaction[]>;
  createTransaction(input: TransactionInput, options?: ApiRequestOptions): Promise<Transaction>;
  updateTransaction(input: UpdateTransactionInput, options?: ApiRequestOptions): Promise<Transaction>;
  deleteTransaction(id: TransactionId, options?: ApiRequestOptions): Promise<TransactionId>;
  getBudgets(options?: ApiRequestOptions): Promise<Budget[]>;
  saveBudget(input: BudgetInput, options?: ApiRequestOptions): Promise<Budget>;
  deleteBudget(id: BudgetId, options?: ApiRequestOptions): Promise<BudgetId>;
}

export type RequestStatus = 'idle' | 'pending' | 'succeeded' | 'failed';
export interface RequestState {
  status: RequestStatus;
  error: ApiError | null;
  requestId: string | null;
}
export interface MutationState<Target> extends RequestState { target: Target | null }
export interface TransactionsState {
  items: Transaction[];
  fetch: RequestState;
  mutation: MutationState<
    | { operation: 'create' }
    | { operation: 'update' | 'delete'; id: TransactionId }
  >;
}
export interface BudgetsState {
  items: Budget[];
  fetch: RequestState;
  mutation: MutationState<
    | { operation: 'save'; key: BudgetKey }
    | { operation: 'delete'; id: BudgetId }
  >;
}
/** Structural selector input. store.ts will infer RootState and AppDispatch. */
export interface FinanceState {
  transactions: TransactionsState;
  budgets: BudgetsState;
}
export interface TransactionFilters {
  type: TransactionType | 'all';
  category: Category | 'all';
  month: Month | ''; // Empty means all history.
  query: string;
}
export interface MoneyTotals { income: Money; expenses: Money; savings: Money }
export interface MonthlySummary extends MoneyTotals {
  month: Month;
  savingsRate: number | null; // Percentage; null when income is zero.
  overspent: boolean;
  transactionCount: number;
}
export interface CategoryTotal<C extends Category = Category> {
  category: C;
  amount: Money;
  percentage: number; // Zero when the relevant income/expense denominator is zero.
}
export type BudgetStatus = 'on-track' | 'near-limit' | 'exceeded' | 'no-budget';
export interface BudgetUsage extends BudgetKey {
  budgetId: BudgetId | null;
  budgetAmount: Money | null;
  spent: Money;
  remaining: Money | null; // Signed: negative when exceeded.
  exceeded: Money | null; // max(spent - budget, 0); null if no budget.
  usagePercentage: number | null; // Not clamped; display actual usage above 100%.
  status: BudgetStatus;
}
/** Named exports required from store/selectors.ts; no calculations implemented here. */
export interface SharedSelectors {
  selectTransactions(state: FinanceState): readonly Transaction[];
  selectBudgets(state: FinanceState): readonly Budget[];
  selectFilteredTransactions(state: FinanceState, filters: TransactionFilters): readonly Transaction[];
  selectFilteredTotals(state: FinanceState, filters: TransactionFilters): MoneyTotals;
  selectIncomeSources(state: FinanceState, filters: TransactionFilters): readonly CategoryTotal<IncomeCategory>[];
  selectMonthlySummary(state: FinanceState, month: Month): MonthlySummary;
  selectAllTimeBalance(state: FinanceState): Money;
  selectExpenseBreakdown(state: FinanceState, month: Month): readonly CategoryTotal<ExpenseCategory>[];
  selectRecentTransactions(state: FinanceState, limit?: number, month?: Month): readonly Transaction[];
  selectBudgetUsage(state: FinanceState, month: Month): readonly BudgetUsage[];
  selectBudgetAlerts(state: FinanceState, month: Month): readonly BudgetUsage[];
  selectLargestSpendingCategory(state: FinanceState, month: Month): CategoryTotal<ExpenseCategory> | null;
}

export interface ModalProps {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  description?: string;
  pending?: boolean;
  initialFocusId?: string;
}
export interface LoadingMessageProps { message?: string }
export interface ErrorMessageProps { message: string; onRetry?: () => void; pending?: boolean }
export interface EmptyStateProps { title: string; description?: string; action?: ReactNode }
export interface Notification { id: string; kind: 'success' | 'error' | 'info'; message: string }
export interface NotificationContextValue {
  notifications: readonly Notification[];
  notify: (notification: Omit<Notification, 'id'>) => void;
  dismiss: (id: string) => void;
}
export interface ToastQueueProps {
  notifications: readonly Notification[];
  onDismiss: (id: string) => void;
}
export interface MonthFilterProps {
  id: string;
  label: string;
  value: Month | '';
  onChange: (month: Month | '') => void;
  allowAll?: boolean; // Default false: a valid month is required.
  disabled?: boolean;
}
export interface BudgetStatusProps { status: BudgetStatus; exceeded?: Money | null }
export type BudgetTableProps = {
  rows: readonly BudgetUsage[];
  pending?: boolean;
} & (
  | { readOnly: true; onEdit?: never; onRemove?: never }
  | { readOnly: false; onEdit: (row: BudgetUsage) => void; onRemove: (budget: Budget) => void }
);
export interface BudgetFormProps {
  month: Month;
  initialBudget?: Budget;
  initialCategory?: ExpenseCategory;
  pending: boolean;
  error: ApiError | null;
  onSubmit: (input: BudgetInput) => Promise<void>;
  onCancel: () => void;
}
export interface TransactionFormProps {
  transaction?: Transaction; // Omitted for create.
  initialType?: TransactionType; // Default expense.
  lockedType?: TransactionType; // Income screen passes income.
  pending: boolean;
  error: ApiError | null;
  onSubmit: (input: TransactionInput) => Promise<void>;
  onCancel: () => void;
}
export type TransactionTableProps = {
  transactions: readonly Transaction[];
  caption: string;
  pending?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
} & (
  | { readOnly: true; onEdit?: never; onDelete?: never }
  | { readOnly: false; onEdit: (transaction: Transaction) => void; onDelete: (transaction: Transaction) => void }
);
export interface TransactionFiltersProps {
  value: TransactionFilters;
  onChange: (filters: TransactionFilters) => void;
  lockedType?: TransactionType;
  disabled?: boolean;
}
export interface DeleteTransactionModalProps {
  transaction: Transaction | null; // Null closes the dialog.
  pending: boolean;
  error: ApiError | null;
  onConfirm: (id: TransactionId) => Promise<void>;
  onClose: () => void;
}

export const pageRoutes = {
  dashboard: '/', transactions: '/transactions', addTransaction: '/transactions/new',
  income: '/income', budgets: '/budgets', report: '/reports/monthly', about: '/about',
} as const;
export type PageRoute = (typeof pageRoutes)[keyof typeof pageRoutes];
