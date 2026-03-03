import { describe, expect, it } from 'vitest';

import checkoutReducer, {
  clearCheckoutFeedback,
  placeOrder,
  type CheckoutState,
} from '../../slices/checkoutSlice';

const initialState: CheckoutState = {
  submitting: false,
  error: null,
  successMessage: null,
  lastOrderId: null,
};

describe('checkoutSlice reducer', () => {
  it('sets submitting state on placeOrder.pending', () => {
    const nextState = checkoutReducer(
      {
        ...initialState,
        error: 'Old error',
        successMessage: 'Old message',
        lastOrderId: 'ORD-OLD',
      },
      placeOrder.pending('request-id', {
        items: [],
        subtotal: 0,
        currency: 'USD',
      }),
    );

    expect(nextState.submitting).toBe(true);
    expect(nextState.error).toBeNull();
    expect(nextState.successMessage).toBeNull();
    expect(nextState.lastOrderId).toBeNull();
  });

  it('stores order success payload on placeOrder.fulfilled', () => {
    const nextState = checkoutReducer(
      {
        ...initialState,
        submitting: true,
      },
      placeOrder.fulfilled(
        {
          orderId: 'ORD-10',
          status: 'accepted',
          message: 'Order placed successfully.',
        },
        'request-id',
        {
          items: [],
          subtotal: 0,
          currency: 'USD',
        },
      ),
    );

    expect(nextState.submitting).toBe(false);
    expect(nextState.successMessage).toBe('Order placed successfully.');
    expect(nextState.lastOrderId).toBe('ORD-10');
  });

  it('stores errors on placeOrder.rejected and clears feedback', () => {
    const rejectedState = checkoutReducer(
      initialState,
      placeOrder.rejected(
        new Error('boom'),
        'request-id',
        {
          items: [],
          subtotal: 0,
          currency: 'USD',
        },
        'Failed to place order',
      ),
    );

    const clearedState = checkoutReducer(
      {
        ...rejectedState,
        successMessage: 'Order placed successfully.',
        lastOrderId: 'ORD-10',
      },
      clearCheckoutFeedback(),
    );

    expect(rejectedState.submitting).toBe(false);
    expect(rejectedState.error).toBe('Failed to place order');
    expect(clearedState.error).toBeNull();
    expect(clearedState.successMessage).toBeNull();
    expect(clearedState.lastOrderId).toBeNull();
  });
});

