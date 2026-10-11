import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as api from '../api.ts';
import type { ApiError, FinanceState, TransactionsState, Transaction, TransactionInput, UpdateTransactionInput, TransactionId } from '../types.ts';

type ThunkConfig = { state: FinanceState; rejectValue: ApiError };
const available = (state: FinanceState) => state.transactions.fetch.status !== 'pending' && state.transactions.mutation.status !== 'pending';

export const fetchTransactions = createAsyncThunk<Transaction[], void, ThunkConfig>(
  'transactions/fetchTransactions',
  async (_arg, { signal, rejectWithValue }) => {
    try { return await api.getTransactions({ signal }); }
    catch (error) { return rejectWithValue(api.normalizeApiError(error)); }
  },
  { condition: (_arg, { getState }) => available(getState()) },
);

export const createTransaction = createAsyncThunk<Transaction, TransactionInput, ThunkConfig>(
  'transactions/createTransaction',
  async (arg, { signal, rejectWithValue }) => {
    try { return await api.createTransaction(arg, { signal }); }
    catch (error) { return rejectWithValue(api.normalizeApiError(error)); }
  },
  { condition: (_arg, { getState }) => available(getState()) },
);

export const updateTransaction = createAsyncThunk<Transaction, UpdateTransactionInput, ThunkConfig>(
  'transactions/updateTransaction',
  async (arg, { signal, rejectWithValue }) => {
    try { return await api.updateTransaction(arg, { signal }); }
    catch (error) { return rejectWithValue(api.normalizeApiError(error)); }
  },
  { condition: (_arg, { getState }) => available(getState()) },
);

export const deleteTransaction = createAsyncThunk<TransactionId, TransactionId, ThunkConfig>(
  'transactions/deleteTransaction',
  async (arg, { signal, rejectWithValue }) => {
    try { return await api.deleteTransaction(arg, { signal }); }
    catch (error) { return rejectWithValue(api.normalizeApiError(error)); }
  },
  { condition: (_arg, { getState }) => available(getState()) },
);

export const initialTransactionsState: TransactionsState = {
  items: [],
  fetch: { status: 'idle', error: null, requestId: null },
  mutation: { status: 'idle', error: null, requestId: null, target: null },
};

const slice = createSlice({
  name: 'transactions',
  initialState: initialTransactionsState,
  reducers: {
    clearTransactionMutationState(state) {
      if (state.mutation.status !== 'pending') state.mutation = { status: 'idle', error: null, requestId: null, target: null };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchTransactions.pending, (state, action) => {
      state.fetch = { status: 'pending', error: null, requestId: action.meta.requestId };
    }).addCase(fetchTransactions.fulfilled, (state, action) => {
      if (state.fetch.requestId !== action.meta.requestId) return;
      state.items = action.payload;
      state.fetch.status = 'succeeded';
      state.fetch.requestId = null;
    }).addCase(fetchTransactions.rejected, (state, action) => {
      if (state.fetch.requestId !== action.meta.requestId) return;
      state.fetch.status = 'failed';
      state.fetch.requestId = null;
      state.fetch.error = action.payload ?? api.normalizeApiError(action.meta.aborted
        ? { code: 'ABORTED', message: 'Request cancelled. Reload before retrying a change.' }
        : { code: 'SERVER_ERROR', message: 'The request could not be completed. Please try again.' });
    });
    builder.addCase(createTransaction.pending, (state, action) => {
      state.mutation = { status: 'pending', error: null, requestId: action.meta.requestId, target: { operation: 'create' } };
    }).addCase(createTransaction.fulfilled, (state, action) => {
      if (state.mutation.requestId !== action.meta.requestId) return;
      const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index < 0) state.items.push(action.payload);
        else state.items[index] = action.payload;
      state.mutation.status = 'succeeded';
      state.mutation.requestId = null;
    }).addCase(createTransaction.rejected, (state, action) => {
      if (state.mutation.requestId !== action.meta.requestId) return;
      state.mutation.status = 'failed';
      state.mutation.requestId = null;
      state.mutation.error = action.payload ?? api.normalizeApiError(action.meta.aborted
        ? { code: 'ABORTED', message: 'Request cancelled. Reload before retrying a change.' }
        : { code: 'SERVER_ERROR', message: 'The request could not be completed. Please try again.' });
    });
    builder.addCase(updateTransaction.pending, (state, action) => {
      state.mutation = { status: 'pending', error: null, requestId: action.meta.requestId, target: { operation: 'update', id: action.meta.arg.id } };
    }).addCase(updateTransaction.fulfilled, (state, action) => {
      if (state.mutation.requestId !== action.meta.requestId) return;
      const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index < 0) state.items.push(action.payload);
        else state.items[index] = action.payload;
      state.mutation.status = 'succeeded';
      state.mutation.requestId = null;
    }).addCase(updateTransaction.rejected, (state, action) => {
      if (state.mutation.requestId !== action.meta.requestId) return;
      state.mutation.status = 'failed';
      state.mutation.requestId = null;
      state.mutation.error = action.payload ?? api.normalizeApiError(action.meta.aborted
        ? { code: 'ABORTED', message: 'Request cancelled. Reload before retrying a change.' }
        : { code: 'SERVER_ERROR', message: 'The request could not be completed. Please try again.' });
    });
    builder.addCase(deleteTransaction.pending, (state, action) => {
      state.mutation = { status: 'pending', error: null, requestId: action.meta.requestId, target: { operation: 'delete', id: action.meta.arg } };
    }).addCase(deleteTransaction.fulfilled, (state, action) => {
      if (state.mutation.requestId !== action.meta.requestId) return;
      state.items = state.items.filter((item) => item.id !== action.payload);
      state.mutation.status = 'succeeded';
      state.mutation.requestId = null;
    }).addCase(deleteTransaction.rejected, (state, action) => {
      if (state.mutation.requestId !== action.meta.requestId) return;
      state.mutation.status = 'failed';
      state.mutation.requestId = null;
      state.mutation.error = action.payload ?? api.normalizeApiError(action.meta.aborted
        ? { code: 'ABORTED', message: 'Request cancelled. Reload before retrying a change.' }
        : { code: 'SERVER_ERROR', message: 'The request could not be completed. Please try again.' });
    });
  },
});

export const { clearTransactionMutationState } = slice.actions;
export default slice.reducer;
