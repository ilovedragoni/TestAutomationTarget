import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import type { RootState } from '../app/store';
import * as ordersApi from '../api/orders';
import type { OrderSummary } from '../types/order';

export interface OrderState {
  items: OrderSummary[];
  loading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  items: [],
  loading: false,
  error: null,
};

export const loadOrders = createAsyncThunk<OrderSummary[], void, { rejectValue: string }>(
  'orders/loadOrders',
  async (_, { rejectWithValue }) => {
    try {
      return await ordersApi.fetchOrders();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load orders';
      return rejectWithValue(message);
    }
  },
);

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearOrderError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(loadOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to load orders';
      });
  },
});

export const { clearOrderError } = orderSlice.actions;

export const selectOrders = (state: RootState) => state.orders.items;
export const selectOrdersLoading = (state: RootState) => state.orders.loading;
export const selectOrdersError = (state: RootState) => state.orders.error;

export default orderSlice.reducer;
