import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '../app/store';
import * as api from '../api/products';
import type { Product, ProductFilters, ProductPage } from '../types/product';

export interface ProductsState {
  items: Product[];
  current: Product | null;
  search: string;
  categoryId: number | null;
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
  loading: boolean;
  error: string | null;
  message: string | null;
}

const initialState: ProductsState = {
  items: [],
  current: null,
  search: '',
  categoryId: null,
  page: 0,
  size: 12,
  totalPages: 0,
  totalElements: 0,
  loading: false,
  error: null,
  message: null,
};

export const loadProducts = createAsyncThunk<
  ProductPage,
  ProductFilters | void,
  { rejectValue: string }
>('products/load', async (filters, { rejectWithValue }) => {
  try {
    const search = filters?.search ?? '';
    const categoryId = filters?.categoryId ?? null;
    const page = filters?.page ?? 0;
    const size = filters?.size ?? 12;
    return await api.fetchProducts(search, categoryId, page, size);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load products';
    return rejectWithValue(message);
  }
});

export const loadProduct = createAsyncThunk<Product, number, { rejectValue: string }>(
  'products/loadOne',
  async (id, { rejectWithValue }) => {
    try {
      return await api.fetchProduct(id);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load product';
      return rejectWithValue(message);
    }
  },
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
      state.page = 0;
    },
    setCategoryId(state, action: PayloadAction<number | null>) {
      state.categoryId = action.payload;
      state.page = 0;
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = Math.max(0, action.payload);
    },
    clearCurrent(state) {
      state.current = null;
    },
    clearMessage(state) {
      state.message = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload.items) ? action.payload.items : [];
        state.page = Number.isFinite(action.payload.page) ? action.payload.page : 0;
        state.size = Number.isFinite(action.payload.size) ? action.payload.size : state.size;
        state.totalPages = Number.isFinite(action.payload.totalPages) ? action.payload.totalPages : 0;
        state.totalElements = Number.isFinite(action.payload.totalElements) ? action.payload.totalElements : state.items.length;
      })
      .addCase(loadProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Unknown error';
      })
      .addCase(loadProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(loadProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Unknown error';
      });
  },
});

export const { setSearch, setCategoryId, setPage, clearCurrent, clearMessage } = productsSlice.actions;

export const selectProducts = (state: RootState) => state.products.items;
export const selectCurrentProduct = (state: RootState) => state.products.current;
export const selectLoading = (state: RootState) => state.products.loading;
export const selectError = (state: RootState) => state.products.error;

export default productsSlice.reducer;
