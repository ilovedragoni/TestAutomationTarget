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

function addOne(items: CartItem[], product: Product): CartItem[] {
  const existingItem = items.find((item) => item.product.id === product.id);
  if (!existingItem) {
    return [...items, { product, quantity: 1 }];
  }
  return items.map((item) =>
    item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
  );
}

function decrementOne(items: CartItem[], productId: number): CartItem[] {
  const existingItem = items.find((item) => item.product.id === productId);
  if (!existingItem) {
    return items;
  }
  if (existingItem.quantity <= 1) {
    return items.filter((item) => item.product.id !== productId);
  }
  return items.map((item) =>
    item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item,
  );
}

export const addToCartServer = createAsyncThunk<
  CartItem[],
  Product,
  { state: RootState; rejectValue: string }
>('cart/addToCartServer', async (product, { getState, rejectWithValue }) => {
  try {
    const items = getState().cart.items;
    return await cartApi.replaceCart(addOne(items, product));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update cart';
    return rejectWithValue(message);
  }
});

export const decrementQuantityServer = createAsyncThunk<
  CartItem[],
  number,
  { state: RootState; rejectValue: string }
>('cart/decrementQuantityServer', async (productId, { getState, rejectWithValue }) => {
  try {
    const items = getState().cart.items;
    return await cartApi.replaceCart(decrementOne(items, productId));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update cart';
    return rejectWithValue(message);
  }
});

export const removeFromCartServer = createAsyncThunk<
  CartItem[],
  number,
  { state: RootState; rejectValue: string }
>('cart/removeFromCartServer', async (productId, { getState, rejectWithValue }) => {
  try {
    const items = getState().cart.items.filter((item) => item.product.id !== productId);
    return await cartApi.replaceCart(items);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update cart';
    return rejectWithValue(message);
  }
});

export const clearCartServer = createAsyncThunk<CartItem[], void, { rejectValue: string }>(
  'cart/clearCartServer',
  async (_, { rejectWithValue }) => {
    try {
      await cartApi.clearServerCart();
      return [];
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to clear cart';
      return rejectWithValue(message);
    }
  },
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
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
      .addCase(addToCartServer.pending, (state) => {
        state.syncing = true;
        state.syncError = null;
      })
      .addCase(addToCartServer.fulfilled, (state, action) => {
        state.syncing = false;
        state.items = action.payload;
      })
      .addCase(addToCartServer.rejected, (state, action) => {
        state.syncing = false;
        state.syncError = action.payload ?? 'Failed to update cart';
      })
      .addCase(decrementQuantityServer.pending, (state) => {
        state.syncing = true;
        state.syncError = null;
      })
      .addCase(decrementQuantityServer.fulfilled, (state, action) => {
        state.syncing = false;
        state.items = action.payload;
      })
      .addCase(decrementQuantityServer.rejected, (state, action) => {
        state.syncing = false;
        state.syncError = action.payload ?? 'Failed to update cart';
      })
      .addCase(removeFromCartServer.pending, (state) => {
        state.syncing = true;
        state.syncError = null;
      })
      .addCase(removeFromCartServer.fulfilled, (state, action) => {
        state.syncing = false;
        state.items = action.payload;
      })
      .addCase(removeFromCartServer.rejected, (state, action) => {
        state.syncing = false;
        state.syncError = action.payload ?? 'Failed to update cart';
      })
      .addCase(clearCartServer.pending, (state) => {
        state.syncing = true;
        state.syncError = null;
      })
      .addCase(clearCartServer.fulfilled, (state, action) => {
        state.syncing = false;
        state.items = action.payload;
      })
      .addCase(clearCartServer.rejected, (state, action) => {
        state.syncing = false;
        state.syncError = action.payload ?? 'Failed to clear cart';
      });
  },
});

export const { clearCart, clearCartSyncError } = cartSlice.actions;

export const selectCartItems = (state: RootState) => state.cart.items;
export const selectCartCount = (state: RootState) =>
  state.cart.items.reduce((total, item) => total + item.quantity, 0);
export const selectCartSubtotal = (state: RootState) =>
  state.cart.items.reduce((total, item) => total + item.product.price * item.quantity, 0);
export const selectCartSyncing = (state: RootState) => state.cart.syncing;
export const selectCartSyncError = (state: RootState) => state.cart.syncError;

export default cartSlice.reducer;
