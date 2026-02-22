import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '../app/store';
import * as cartApi from '../api/cart';
import type { Product } from '../types/product';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  syncing: boolean;
  syncError: string | null;
}

const initialState: CartState = {
  items: [],
  syncing: false,
  syncError: null,
};

export const loadServerCart = createAsyncThunk<CartItem[], void, { rejectValue: string }>(
  'cart/loadServerCart',
  async (_, { rejectWithValue }) => {
    try {
      return await cartApi.fetchCart();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load cart';
      return rejectWithValue(message);
    }
  },
);

export const mergeGuestCart = createAsyncThunk<CartItem[], CartItem[], { rejectValue: string }>(
  'cart/mergeGuestCart',
  async (guestItems, { rejectWithValue }) => {
    try {
      return await cartApi.mergeCart(guestItems);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to merge cart';
      return rejectWithValue(message);
    }
  },
);

export const syncCartToServer = createAsyncThunk<void, CartItem[], { rejectValue: string }>(
  'cart/syncCartToServer',
  async (items, { rejectWithValue }) => {
    try {
      await cartApi.replaceCart(items);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sync cart';
      return rejectWithValue(message);
    }
  },
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    hydrateCart(state, action: PayloadAction<CartItem[]>) {
      state.items = action.payload;
    },
    addToCart(state, action: PayloadAction<Product>) {
      const existingItem = state.items.find((item) => item.product.id === action.payload.id);
      if (existingItem) {
        existingItem.quantity += 1;
        return;
      }

      state.items.push({ product: action.payload, quantity: 1 });
    },
    decrementQuantity(state, action: PayloadAction<number>) {
      const existingItem = state.items.find((item) => item.product.id === action.payload);
      if (!existingItem) {
        return;
      }

      if (existingItem.quantity <= 1) {
        state.items = state.items.filter((item) => item.product.id !== action.payload);
        return;
      }

      existingItem.quantity -= 1;
    },
    removeFromCart(state, action: PayloadAction<number>) {
      state.items = state.items.filter((item) => item.product.id !== action.payload);
    },
    clearCart(state) {
      state.items = [];
    },
    clearCartSyncError(state) {
      state.syncError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadServerCart.pending, (state) => {
        state.syncing = true;
        state.syncError = null;
      })
      .addCase(loadServerCart.fulfilled, (state, action) => {
        state.syncing = false;
        state.items = action.payload;
      })
      .addCase(loadServerCart.rejected, (state, action) => {
        state.syncing = false;
        state.syncError = action.payload ?? 'Failed to load cart';
      })
      .addCase(mergeGuestCart.pending, (state) => {
        state.syncing = true;
        state.syncError = null;
      })
      .addCase(mergeGuestCart.fulfilled, (state, action) => {
        state.syncing = false;
        state.items = action.payload;
      })
      .addCase(mergeGuestCart.rejected, (state, action) => {
        state.syncing = false;
        state.syncError = action.payload ?? 'Failed to merge cart';
      })
      .addCase(syncCartToServer.pending, (state) => {
        state.syncing = true;
        state.syncError = null;
      })
      .addCase(syncCartToServer.fulfilled, (state) => {
        state.syncing = false;
      })
      .addCase(syncCartToServer.rejected, (state, action) => {
        state.syncing = false;
        state.syncError = action.payload ?? 'Failed to sync cart';
      });
  },
});

export const { hydrateCart, addToCart, decrementQuantity, removeFromCart, clearCart, clearCartSyncError } = cartSlice.actions;

export const selectCartItems = (state: RootState) => state.cart.items;
export const selectCartCount = (state: RootState) =>
  state.cart.items.reduce((total, item) => total + item.quantity, 0);
export const selectCartSubtotal = (state: RootState) =>
  state.cart.items.reduce((total, item) => total + item.product.price * item.quantity, 0);
export const selectCartSyncing = (state: RootState) => state.cart.syncing;
export const selectCartSyncError = (state: RootState) => state.cart.syncError;

export default cartSlice.reducer;
