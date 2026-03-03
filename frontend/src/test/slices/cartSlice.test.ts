import { describe, expect, it } from 'vitest';

import cartReducer, {
  addToCartServer,
  clearCart,
  clearCartSyncError,
  clearCartServer,
  decrementQuantityServer,
  loadServerCart,
  removeFromCartServer,
  selectCartCount,
  selectCartSubtotal,
  type CartState,
} from '../../slices/cartSlice';
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
  id: 2,
  name: 'Mouse',
  description: 'Gaming mouse',
  price: 49.9,
  category: {
    id: 10,
    name: 'Electronics',
    description: null,
  },
};

const initialState: CartState = {
  items: [],
  syncing: false,
  syncError: null,
};

describe('cartSlice reducer', () => {
  it('stores loaded cart items on loadServerCart.fulfilled', () => {
    const nextState = cartReducer(
      initialState,
      loadServerCart.fulfilled(
        [
          { product: keyboard, quantity: 2 },
          { product: mouse, quantity: 1 },
        ],
        'request-id',
        undefined,
      ),
    );

    expect(nextState.syncing).toBe(false);
    expect(nextState.items).toHaveLength(2);
    expect(nextState.items[0]!.quantity).toBe(2);
  });

  it('records a sync error on rejected cart mutations', () => {
    const nextState = cartReducer(
      initialState,
      addToCartServer.rejected(new Error('boom'), 'request-id', keyboard, 'Failed to update cart'),
    );

    expect(nextState.syncing).toBe(false);
    expect(nextState.syncError).toBe('Failed to update cart');
  });

  it('replaces items with server response for fulfilled mutations', () => {
    const stateWithItems: CartState = {
      ...initialState,
      items: [{ product: keyboard, quantity: 1 }],
      syncing: true,
    };

    const nextState = cartReducer(
      stateWithItems,
      decrementQuantityServer.fulfilled([], 'request-id', keyboard.id),
    );

    expect(nextState.syncing).toBe(false);
    expect(nextState.items).toEqual([]);
  });

  it('clears cart items and sync errors via reducers', () => {
    const dirtyState: CartState = {
      items: [{ product: keyboard, quantity: 1 }],
      syncing: false,
      syncError: 'Failed to sync cart',
    };

    const afterErrorClear = cartReducer(dirtyState, clearCartSyncError());
    const afterCartClear = cartReducer(afterErrorClear, clearCart());

    expect(afterErrorClear.syncError).toBeNull();
    expect(afterCartClear.items).toEqual([]);
  });

  it('handles clearCartServer.fulfilled by emptying items', () => {
    const stateWithItems: CartState = {
      ...initialState,
      items: [{ product: keyboard, quantity: 3 }],
      syncing: true,
    };

    const nextState = cartReducer(
      stateWithItems,
      clearCartServer.fulfilled([], 'request-id', undefined),
    );

    expect(nextState.syncing).toBe(false);
    expect(nextState.items).toEqual([]);
  });

  it('computes cart selectors from item quantities and prices', () => {
    const rootState = {
      cart: {
        ...initialState,
        items: [
          { product: keyboard, quantity: 2 },
          { product: mouse, quantity: 1 },
        ],
      },
    };

    expect(selectCartCount(rootState as never)).toBe(3);
    expect(selectCartSubtotal(rootState as never)).toBeCloseTo(249.7);
  });

  it('removes item list returned from removeFromCartServer.fulfilled', () => {
    const stateWithItems: CartState = {
      ...initialState,
      items: [
        { product: keyboard, quantity: 1 },
        { product: mouse, quantity: 1 },
      ],
    };

    const nextState = cartReducer(
      stateWithItems,
      removeFromCartServer.fulfilled([{ product: mouse, quantity: 1 }], 'request-id', keyboard.id),
    );

    expect(nextState.items).toEqual([{ product: mouse, quantity: 1 }]);
  });
});

