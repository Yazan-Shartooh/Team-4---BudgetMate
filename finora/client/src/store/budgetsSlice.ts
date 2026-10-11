import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as api from '../api.ts';
import type { ApiError, FinanceState, BudgetsState, Budget, BudgetInput, BudgetId } from '../types.ts';

type ThunkConfig = { state: FinanceState; rejectValue: ApiError };
const available = (state: FinanceState) => state.budgets.fetch.status !== 'pending' && state.budgets.mutation.status !== 'pending';

export const fetchBudgets = createAsyncThunk<Budget[], void, ThunkConfig>(
  'budgets/fetchBudgets',
  async (_arg, { signal, rejectWithValue }) => {
    try { return await api.getBudgets({ signal }); }
    catch (error) { return rejectWithValue(api.normalizeApiError(error)); }
  },
  { condition: (_arg, { getState }) => available(getState()) },
);

export const saveBudget = createAsyncThunk<Budget, BudgetInput, ThunkConfig>(
  'budgets/saveBudget',
  async (arg, { signal, rejectWithValue }) => {
    try { return await api.saveBudget(arg, { signal }); }
    catch (error) { return rejectWithValue(api.normalizeApiError(error)); }
  },
  { condition: (_arg, { getState }) => available(getState()) },
);

export const deleteBudget = createAsyncThunk<BudgetId, BudgetId, ThunkConfig>(
  'budgets/deleteBudget',
  async (arg, { signal, rejectWithValue }) => {
    try { return await api.deleteBudget(arg, { signal }); }
    catch (error) { return rejectWithValue(api.normalizeApiError(error)); }
  },
  { condition: (_arg, { getState }) => available(getState()) },
);

export const initialBudgetsState: BudgetsState = {
  items: [],
  fetch: { status: 'idle', error: null, requestId: null },
  mutation: { status: 'idle', error: null, requestId: null, target: null },
};

const slice = createSlice({
  name: 'budgets',
  initialState: initialBudgetsState,
  reducers: {
    clearBudgetMutationState(state) {
      if (state.mutation.status !== 'pending') state.mutation = { status: 'idle', error: null, requestId: null, target: null };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchBudgets.pending, (state, action) => {
      state.fetch = { status: 'pending', error: null, requestId: action.meta.requestId };
    }).addCase(fetchBudgets.fulfilled, (state, action) => {
      if (state.fetch.requestId !== action.meta.requestId) return;
      state.items = action.payload;
      state.fetch.status = 'succeeded';
      state.fetch.requestId = null;
    }).addCase(fetchBudgets.rejected, (state, action) => {
      if (state.fetch.requestId !== action.meta.requestId) return;
      state.fetch.status = 'failed';
      state.fetch.requestId = null;
      state.fetch.error = action.payload ?? api.normalizeApiError(action.meta.aborted
        ? { code: 'ABORTED', message: 'Request cancelled. Reload before retrying a change.' }
        : { code: 'SERVER_ERROR', message: 'The request could not be completed. Please try again.' });
    });
    builder.addCase(saveBudget.pending, (state, action) => {
      state.mutation = { status: 'pending', error: null, requestId: action.meta.requestId, target: { operation: 'save', key: { category: action.meta.arg.category, month: action.meta.arg.month } } };
    }).addCase(saveBudget.fulfilled, (state, action) => {
      if (state.mutation.requestId !== action.meta.requestId) return;
      state.items = state.items.filter((item) => item.id !== action.payload.id
          && !(item.category === action.payload.category && item.month === action.payload.month));
        state.items.push(action.payload);
      state.mutation.status = 'succeeded';
      state.mutation.requestId = null;
    }).addCase(saveBudget.rejected, (state, action) => {
      if (state.mutation.requestId !== action.meta.requestId) return;
      state.mutation.status = 'failed';
      state.mutation.requestId = null;
      state.mutation.error = action.payload ?? api.normalizeApiError(action.meta.aborted
        ? { code: 'ABORTED', message: 'Request cancelled. Reload before retrying a change.' }
        : { code: 'SERVER_ERROR', message: 'The request could not be completed. Please try again.' });
    });
    builder.addCase(deleteBudget.pending, (state, action) => {
      state.mutation = { status: 'pending', error: null, requestId: action.meta.requestId, target: { operation: 'delete', id: action.meta.arg } };
    }).addCase(deleteBudget.fulfilled, (state, action) => {
      if (state.mutation.requestId !== action.meta.requestId) return;
      state.items = state.items.filter((item) => item.id !== action.payload);
      state.mutation.status = 'succeeded';
      state.mutation.requestId = null;
    }).addCase(deleteBudget.rejected, (state, action) => {
      if (state.mutation.requestId !== action.meta.requestId) return;
      state.mutation.status = 'failed';
      state.mutation.requestId = null;
      state.mutation.error = action.payload ?? api.normalizeApiError(action.meta.aborted
        ? { code: 'ABORTED', message: 'Request cancelled. Reload before retrying a change.' }
        : { code: 'SERVER_ERROR', message: 'The request could not be completed. Please try again.' });
    });
  },
});

export const { clearBudgetMutationState } = slice.actions;
export default slice.reducer;
