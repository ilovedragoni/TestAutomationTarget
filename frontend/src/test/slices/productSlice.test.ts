import { describe, expect, it } from 'vitest';

import productsReducer, {
  clearCurrent,
  clearMessage,
  loadProduct,
  loadProducts,
  setCategoryId,
  setPage,
  setSearch,
  type ProductsState,
} from '../../slices/productSlice';
import type { Product } from '../../types/product';

const keyboard: Product = {
  id: 1,
  name: 'Keyboard',
  description: 'Mechanical keyboard',
  price: 99.9,
  category: {
    id: 10,
    name: 'Electronics',
    description: null,
  },
};

const mouse: Product = {
  ...keyboard,
  id: 2,
  name: 'Mouse',
  price: 49.9,
};

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

describe('productSlice reducer', () => {
  it('updates search and resets page', () => {
    const nextState = productsReducer(
      {
        ...initialState,
        page: 3,
      },
      setSearch('keyboard'),
    );

    expect(nextState.search).toBe('keyboard');
    expect(nextState.page).toBe(0);
  });

  it('updates category and resets page', () => {
    const nextState = productsReducer(
      {
        ...initialState,
        page: 2,
      },
      setCategoryId(10),
    );

    expect(nextState.categoryId).toBe(10);
    expect(nextState.page).toBe(0);
  });

  it('does not allow a negative page', () => {
    const nextState = productsReducer(initialState, setPage(-5));

    expect(nextState.page).toBe(0);
  });

  it('stores paged products from loadProducts.fulfilled', () => {
    const nextState = productsReducer(
      {
        ...initialState,
        loading: true,
      },
      loadProducts.fulfilled(
        {
          items: [keyboard, mouse],
          page: 1,
          size: 24,
          totalPages: 3,
          totalElements: 50,
        },
        'request-id',
        undefined,
      ),
    );

    expect(nextState.loading).toBe(false);
    expect(nextState.items).toEqual([keyboard, mouse]);
    expect(nextState.page).toBe(1);
    expect(nextState.size).toBe(24);
    expect(nextState.totalPages).toBe(3);
    expect(nextState.totalElements).toBe(50);
  });

  it('stores current product from loadProduct.fulfilled', () => {
    const nextState = productsReducer(
      {
        ...initialState,
        loading: true,
      },
      loadProduct.fulfilled(keyboard, 'request-id', keyboard.id),
    );

    expect(nextState.loading).toBe(false);
    expect(nextState.current).toEqual(keyboard);
  });

  it('stores errors and clears transient state', () => {
    const rejectedState = productsReducer(
      initialState,
      loadProducts.rejected(new Error('boom'), 'request-id', undefined, 'Failed to load products'),
    );
    const withCurrent = productsReducer(
      {
        ...rejectedState,
        current: keyboard,
        message: 'stale message',
      },
      clearCurrent(),
    );
    const cleared = productsReducer(withCurrent, clearMessage());

    expect(rejectedState.error).toBe('Failed to load products');
    expect(withCurrent.current).toBeNull();
    expect(cleared.error).toBeNull();
    expect(cleared.message).toBeNull();
  });
});

