import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import type { RootState } from '../app/store';
import * as checkoutApi from '../api/checkout';
import type { CheckoutRequest, CheckoutResponse } from '../types/checkout';

export interface CheckoutState {
  submitting: boolean;
  error: string | null;
  successMessage: string | null;
  lastOrderId: string | null;
}

const initialState: CheckoutState = {
  submitting: false,
  error: null,
  successMessage: null,
  lastOrderId: null,
};

export const placeOrder = createAsyncThunk<CheckoutResponse, CheckoutRequest, { rejectValue: string }>(
  'checkout/placeOrder',
  async (payload, { rejectWithValue }) => {
    try {
      return await checkoutApi.submitCheckout(payload);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to place order';
      return rejectWithValue(message);
    }
  },
);

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    clearCheckoutFeedback(state) {
      state.error = null;
      state.successMessage = null;
      state.lastOrderId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(placeOrder.pending, (state) => {
        state.submitting = true;
        state.error = null;
        state.successMessage = null;
        state.lastOrderId = null;
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.submitting = false;
        state.successMessage = action.payload.message;
        state.lastOrderId = action.payload.orderId;
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload ?? 'Failed to place order';
      });
  },
});

export const { clearCheckoutFeedback } = checkoutSlice.actions;

export const selectCheckoutSubmitting = (state: RootState) => state.checkout.submitting;
export const selectCheckoutError = (state: RootState) => state.checkout.error;
export const selectCheckoutSuccessMessage = (state: RootState) => state.checkout.successMessage;
export const selectCheckoutLastOrderId = (state: RootState) => state.checkout.lastOrderId;

export default checkoutSlice.reducer;
