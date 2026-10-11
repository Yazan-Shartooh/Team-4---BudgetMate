import type {
  ApiError,
  ApiRequestOptions,
  Budget,
  BudgetId,
  BudgetInput,
  CategoryLists,
  FrontendApi,
  Transaction,
  TransactionId,
  TransactionInput,
  UpdateTransactionInput,
} from "./types";


const BASE_URL = (
  import.meta.env?.VITE_API_BASE_URL || "http://localhost:3000/api"
).replace(/\/+$/, "");


export function normalizeApiError(error: unknown, status?: number): ApiError {
  if (error instanceof Error && error.name === "AbortError") {
    return { code: "ABORTED", message: "تم إلغاء الطلب." };
  }

  if (typeof error === "object" && error !== null) {
    const err = error as Record<string, unknown>;
    const httpStatus =
      status ??
      (typeof err.statusCode === "number" ? err.statusCode : undefined);

    let message = "حدث خطأ غير متوقع، يرجى المحاولة لاحقاً.";

   
    if (Array.isArray(err.message)) {
      message = err.message.join(" | ");
    } else if (typeof err.message === "string" && err.message.trim()) {
      message = err.message;
    }

    const code =
      httpStatus === 400 || httpStatus === 422
        ? "VALIDATION_ERROR"
        : httpStatus === 404
          ? "NOT_FOUND"
          : httpStatus === 409
            ? "CONFLICT"
            : "SERVER_ERROR";

    return {
      code,
      message,
      status: httpStatus,
    };
  }

  return {
    code: "NETWORK_ERROR",
    message: "تعذر الاتصال بالسيرفر. يرجى التأكد من تشغيل الباك إند.",
  };
}

/**
 * دالة مركزية لتنفيذ طلبات الـ HTTP
 */
async function request<T>(
  path: string,
  method: string = "GET",
  body?: unknown,
  options?: ApiRequestOptions,
): Promise<T> {
  const url = `${BASE_URL}${path}`;

  try {
    const response = await fetch(url, {
      method,
      signal: options?.signal,
      headers: {
        Accept: "application/json",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    // في حال كود 204 No Content (مثل عمليات الـ DELETE)
    if (response.status === 204) {
      return undefined as T;
    }

    const text = await response.text();
    let data: unknown;
    try {
      data = text ? JSON.parse(text) : undefined;
    } catch {
      data = undefined;
    }

    if (!response.ok) {
      throw normalizeApiError(data, response.status);
    }

    return data as T;
  } catch (err: unknown) {
    if ((err as ApiError)?.code) throw err;
    throw normalizeApiError(err);
  }
}

/**
 * عميل الـ API الذي يرتبط مباشرة مع store.ts
 */
export const api: FrontendApi = {
  // الفئات
  getCategories: (options) =>
    request<CategoryLists>("/categories", "GET", undefined, options),

  // العمليات (Transactions)
  getTransactions: (options) =>
    request<Transaction[]>("/transactions", "GET", undefined, options),

  createTransaction: (input: TransactionInput, options) =>
    request<Transaction>("/transactions", "POST", input, options),

  updateTransaction: ({ id, changes }: UpdateTransactionInput, options) =>
    request<Transaction>(`/transactions/${id}`, "PATCH", changes, options),

  deleteTransaction: async (id: TransactionId, options) => {
    await request<void>(`/transactions/${id}`, "DELETE", undefined, options);
    return id;
  },

  // الميزانيات (Budgets)
  getBudgets: (options) =>
    request<Budget[]>("/budgets", "GET", undefined, options),

  saveBudget: (input: BudgetInput, options) =>
    request<Budget>("/budgets", "PUT", input, options),

  deleteBudget: async (id: BudgetId, options) => {
    await request<void>(`/budgets/${id}`, "DELETE", undefined, options);
    return id;
  },
};

// تصدير مباشر للدوال لتتوافق مع ما يستورده store.ts
export const {
  getCategories,
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getBudgets,
  saveBudget,
  deleteBudget,
} = api;
