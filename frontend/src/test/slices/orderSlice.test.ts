import { describe, expect, it } from 'vitest';

import ordersReducer, {
  clearOrderError,
  loadOrders,
  type OrderState,
} from '../../slices/orderSlice';
import type { OrderSummary } from '../../types/order';

const order: OrderSummary = {
  orderId: 'ORD-10',
  status: 'accepted',
  createdAt: '2026-03-03T12:00:00Z',
  currency: 'USD',
  subtotal: 149.8,
  items: [
    {
      productId: 1,
      productName: 'Keyboard',
      unitPrice: 99.9,
      quantity: 1,
      lineTotal: 99.9,
    },
  ],
};

const initialState: OrderState = {
  items: [],
  loading: false,
  error: null,
};

describe('orderSlice reducer', () => {
  it('sets loading and clears error on loadOrders.pending', () => {
    const nextState = ordersReducer(
      {
        ...initialState,
        error: 'stale error',
      },
      loadOrders.pending('request-id', undefined),
    );

    expect(nextState.loading).toBe(true);
    expect(nextState.error).toBeNull();
  });

  it('stores orders on loadOrders.fulfilled', () => {
    const nextState = ordersReducer(
      {
        ...initialState,
        loading: true,
      },
      loadOrders.fulfilled([order], 'request-id', undefined),
    );

    expect(nextState.loading).toBe(false);
    expect(nextState.items).toEqual([order]);
  });

  it('stores and clears errors', () => {
    const rejectedState = ordersReducer(
      initialState,
      loadOrders.rejected(new Error('boom'), 'request-id', undefined, 'Failed to load orders'),
    );
    const clearedState = ordersReducer(rejectedState, clearOrderError());

    expect(rejectedState.loading).toBe(false);
    expect(rejectedState.error).toBe('Failed to load orders');
    expect(clearedState.error).toBeNull();
  });
});

