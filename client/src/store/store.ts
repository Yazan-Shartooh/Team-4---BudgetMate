import { createContext, createElement, useEffect, useReducer } from "react";
import type { Dispatch, ReactNode } from "react";
import * as api from "../api.ts";
import type {
  ApiError,
  Budget,
  BudgetId,
  BudgetInput,
  FinanceState,
  Transaction,
  TransactionId,
  TransactionInput,
  UpdateTransactionInput,
} from "../types.ts";

type TransactionMutationTarget = NonNullable<
  FinanceState["transactions"]["mutation"]["target"]
>;
type BudgetMutationTarget = NonNullable<
  FinanceState["budgets"]["mutation"]["target"]
>;

export type FinanceAction =
  | { type: "transactions/fetch-started"; requestId: string }
  | {
      type: "transactions/fetch-succeeded";
      requestId: string;
      items: Transaction[];
    }
  | { type: "transactions/fetch-failed"; requestId: string; error: ApiError }
  | {
      type: "transactions/mutation-started";
      requestId: string;
      target: TransactionMutationTarget;
    }
  | {
      type: "transactions/mutation-succeeded";
      requestId: string;
      operation: "create" | "update";
      transaction: Transaction;
    }
  | {
      type: "transactions/mutation-succeeded";
      requestId: string;
      operation: "delete";
      id: TransactionId;
    }
  | { type: "transactions/mutation-failed"; requestId: string; error: ApiError }
  | { type: "transactions/mutation-cleared" }
  | { type: "budgets/fetch-started"; requestId: string }
  | { type: "budgets/fetch-succeeded"; requestId: string; items: Budget[] }
  | { type: "budgets/fetch-failed"; requestId: string; error: ApiError }
  | {
      type: "budgets/mutation-started";
      requestId: string;
      target: BudgetMutationTarget;
    }
  | {
      type: "budgets/mutation-succeeded";
      requestId: string;
      operation: "save";
      budget: Budget;
    }
  | {
      type: "budgets/mutation-succeeded";
      requestId: string;
      operation: "delete";
      id: BudgetId;
    }
  | { type: "budgets/mutation-failed"; requestId: string; error: ApiError }
  | { type: "budgets/mutation-cleared" };

const requestState = { status: "idle" as const, error: null, requestId: null };

export const initialFinanceState: FinanceState = {
  transactions: {
    items: [],
    fetch: { ...requestState },
    mutation: { ...requestState, target: null },
  },
  budgets: {
    items: [],
    fetch: { ...requestState },
    mutation: { ...requestState, target: null },
  },
};

export function reduceFinanceState(
  state: FinanceState,
  action: FinanceAction,
): FinanceState {
  switch (action.type) {
    case "transactions/fetch-started":
      return {
        ...state,
        transactions: {
          ...state.transactions,
          fetch: {
            status: "pending",
            error: null,
            requestId: action.requestId,
          },
        },
      };
    case "transactions/fetch-succeeded":
      if (state.transactions.fetch.requestId !== action.requestId) return state;
      return {
        ...state,
        transactions: {
          ...state.transactions,
          items: action.items,
          fetch: { status: "succeeded", error: null, requestId: null },
        },
      };
    case "transactions/fetch-failed":
      if (state.transactions.fetch.requestId !== action.requestId) return state;
      return {
        ...state,
        transactions: {
          ...state.transactions,
          fetch: { status: "failed", error: action.error, requestId: null },
        },
      };
    case "transactions/mutation-started":
      return {
        ...state,
        transactions: {
          ...state.transactions,
          mutation: {
            status: "pending",
            error: null,
            requestId: action.requestId,
            target: action.target,
          },
        },
      };
    case "transactions/mutation-succeeded": {
      if (state.transactions.mutation.requestId !== action.requestId)
        return state;
      const items =
        action.operation === "delete"
          ? state.transactions.items.filter((item) => item.id !== action.id)
          : [
              ...state.transactions.items.filter(
                (item) => item.id !== action.transaction.id,
              ),
              action.transaction,
            ];
      return {
        ...state,
        transactions: {
          ...state.transactions,
          items,
          mutation: {
            status: "succeeded",
            error: null,
            requestId: null,
            target: state.transactions.mutation.target,
          },
        },
      };
    }
    case "transactions/mutation-failed":
      if (state.transactions.mutation.requestId !== action.requestId)
        return state;
      return {
        ...state,
        transactions: {
          ...state.transactions,
          mutation: {
            status: "failed",
            error: action.error,
            requestId: null,
            target: state.transactions.mutation.target,
          },
        },
      };
    case "transactions/mutation-cleared":
      if (state.transactions.mutation.status === "pending") return state;
      return {
        ...state,
        transactions: {
          ...state.transactions,
          mutation: {
            status: "idle",
            error: null,
            requestId: null,
            target: null,
          },
        },
      };
    case "budgets/fetch-started":
      return {
        ...state,
        budgets: {
          ...state.budgets,
          fetch: {
            status: "pending",
            error: null,
            requestId: action.requestId,
          },
        },
      };
    case "budgets/fetch-succeeded":
      if (state.budgets.fetch.requestId !== action.requestId) return state;
      return {
        ...state,
        budgets: {
          ...state.budgets,
          items: action.items,
          fetch: { status: "succeeded", error: null, requestId: null },
        },
      };
    case "budgets/fetch-failed":
      if (state.budgets.fetch.requestId !== action.requestId) return state;
      return {
        ...state,
        budgets: {
          ...state.budgets,
          fetch: { status: "failed", error: action.error, requestId: null },
        },
      };
    case "budgets/mutation-started":
      return {
        ...state,
        budgets: {
          ...state.budgets,
          mutation: {
            status: "pending",
            error: null,
            requestId: action.requestId,
            target: action.target,
          },
        },
      };
    case "budgets/mutation-succeeded": {
      if (state.budgets.mutation.requestId !== action.requestId) return state;
      const items =
        action.operation === "delete"
          ? state.budgets.items.filter((item) => item.id !== action.id)
          : [
              ...state.budgets.items.filter(
                (item) =>
                  item.id !== action.budget.id &&
                  !(
                    item.category === action.budget.category &&
                    item.month === action.budget.month
                  ),
              ),
              action.budget,
            ];
      return {
        ...state,
        budgets: {
          ...state.budgets,
          items,
          mutation: {
            status: "succeeded",
            error: null,
            requestId: null,
            target: state.budgets.mutation.target,
          },
        },
      };
    }
    case "budgets/mutation-failed":
      if (state.budgets.mutation.requestId !== action.requestId) return state;
      return {
        ...state,
        budgets: {
          ...state.budgets,
          mutation: {
            status: "failed",
            error: action.error,
            requestId: null,
            target: state.budgets.mutation.target,
          },
        },
      };
    case "budgets/mutation-cleared":
      if (state.budgets.mutation.status === "pending") return state;
      return {
        ...state,
        budgets: {
          ...state.budgets,
          mutation: {
            status: "idle",
            error: null,
            requestId: null,
            target: null,
          },
        },
      };
  }
}

export interface FinanceActions {
  fetchTransactions(): Promise<void>;
  createTransaction(input: TransactionInput): Promise<Transaction>;
  updateTransaction(input: UpdateTransactionInput): Promise<Transaction>;
  deleteTransaction(id: TransactionId): Promise<TransactionId>;
  clearTransactionMutationState(): void;
  fetchBudgets(): Promise<void>;
  saveBudget(input: BudgetInput): Promise<Budget>;
  deleteBudget(id: BudgetId): Promise<BudgetId>;
  clearBudgetMutationState(): void;
}

export interface FinanceContextValue {
  state: FinanceState;
  actions: FinanceActions;
}
export const FinanceContext = createContext<FinanceContextValue | null>(null);

let requestSequence = 0;
const nextRequestId = () => String(++requestSequence);

function reportError(error: unknown): ApiError {
  return api.normalizeApiError(error);
}

async function fetchTransactions(
  dispatch: Dispatch<FinanceAction>,
  signal?: AbortSignal,
): Promise<void> {
  const requestId = nextRequestId();
  dispatch({ type: "transactions/fetch-started", requestId });
  try {
    const items = await api.getTransactions({ signal });
    dispatch({ type: "transactions/fetch-succeeded", requestId, items });
  } catch (error) {
    dispatch({
      type: "transactions/fetch-failed",
      requestId,
      error: reportError(error),
    });
  }
}

async function fetchBudgets(
  dispatch: Dispatch<FinanceAction>,
  signal?: AbortSignal,
): Promise<void> {
  const requestId = nextRequestId();
  dispatch({ type: "budgets/fetch-started", requestId });
  try {
    const items = await api.getBudgets({ signal });
    dispatch({ type: "budgets/fetch-succeeded", requestId, items });
  } catch (error) {
    dispatch({
      type: "budgets/fetch-failed",
      requestId,
      error: reportError(error),
    });
  }
}

async function mutate<T>(
  dispatch: Dispatch<FinanceAction>,
  started: (requestId: string) => FinanceAction,
  succeeded: (requestId: string, result: T) => FinanceAction,
  failed: (requestId: string, error: ApiError) => FinanceAction,
  operation: () => Promise<T>,
): Promise<T> {
  const requestId = nextRequestId();
  dispatch(started(requestId));
  try {
    const result = await operation();
    dispatch(succeeded(requestId, result));
    return result;
  } catch (error) {
    const normalized = reportError(error);
    dispatch(failed(requestId, normalized));
    throw normalized;
  }
}

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reduceFinanceState, initialFinanceState);
  const actions: FinanceActions = {
    fetchTransactions: () => fetchTransactions(dispatch),
    createTransaction: (input) =>
      mutate(
        dispatch,
        (requestId) => ({
          type: "transactions/mutation-started",
          requestId,
          target: { operation: "create" },
        }),
        (requestId, transaction) => ({
          type: "transactions/mutation-succeeded",
          requestId,
          operation: "create",
          transaction,
        }),
        (requestId, error) => ({
          type: "transactions/mutation-failed",
          requestId,
          error,
        }),
        () => api.createTransaction(input),
      ),
    updateTransaction: (input) =>
      mutate(
        dispatch,
        (requestId) => ({
          type: "transactions/mutation-started",
          requestId,
          target: { operation: "update", id: input.id },
        }),
        (requestId, transaction) => ({
          type: "transactions/mutation-succeeded",
          requestId,
          operation: "update",
          transaction,
        }),
        (requestId, error) => ({
          type: "transactions/mutation-failed",
          requestId,
          error,
        }),
        () => api.updateTransaction(input),
      ),
    deleteTransaction: (id) =>
      mutate(
        dispatch,
        (requestId) => ({
          type: "transactions/mutation-started",
          requestId,
          target: { operation: "delete", id },
        }),
        (requestId, deletedId) => ({
          type: "transactions/mutation-succeeded",
          requestId,
          operation: "delete",
          id: deletedId,
        }),
        (requestId, error) => ({
          type: "transactions/mutation-failed",
          requestId,
          error,
        }),
        () => api.deleteTransaction(id),
      ),
    clearTransactionMutationState: () =>
      dispatch({ type: "transactions/mutation-cleared" }),
    fetchBudgets: () => fetchBudgets(dispatch),
    saveBudget: (input) =>
      mutate(
        dispatch,
        (requestId) => ({
          type: "budgets/mutation-started",
          requestId,
          target: {
            operation: "save",
            key: { category: input.category, month: input.month },
          },
        }),
        (requestId, budget) => ({
          type: "budgets/mutation-succeeded",
          requestId,
          operation: "save",
          budget,
        }),
        (requestId, error) => ({
          type: "budgets/mutation-failed",
          requestId,
          error,
        }),
        () => api.saveBudget(input),
      ),
    deleteBudget: (id) =>
      mutate(
        dispatch,
        (requestId) => ({
          type: "budgets/mutation-started",
          requestId,
          target: { operation: "delete", id },
        }),
        (requestId, deletedId) => ({
          type: "budgets/mutation-succeeded",
          requestId,
          operation: "delete",
          id: deletedId,
        }),
        (requestId, error) => ({
          type: "budgets/mutation-failed",
          requestId,
          error,
        }),
        () => api.deleteBudget(id),
      ),
    clearBudgetMutationState: () =>
      dispatch({ type: "budgets/mutation-cleared" }),
  };

  useEffect(() => {
    const controller = new AbortController();
    void fetchTransactions(dispatch, controller.signal);
    void fetchBudgets(dispatch, controller.signal);
    return () => controller.abort();
  }, []);

  return createElement(
    FinanceContext.Provider,
    { value: { state, actions } },
    children,
  );
}
