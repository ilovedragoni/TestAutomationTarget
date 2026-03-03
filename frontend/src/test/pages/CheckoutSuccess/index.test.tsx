import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import CheckoutSuccess from '../../../pages/CheckoutSuccess/index';
import { createTestStore } from '../../test-utils';

describe('CheckoutSuccess', () => {
  it('renders the order confirmation details from navigation state', async () => {
    const store = createTestStore({
      auth: {
        user: { id: 1, email: 'user@example.com', name: 'User' },
        token: 'token-1',
        isAuthenticated: true,
        checkingSession: false,
        loading: false,
        signingOut: false,
        error: null,
        message: null,
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[
            {
              pathname: '/checkout/success',
              state: {
                orderId: 'ORD-123',
                message: 'Thanks for your purchase.',
              },
            },
          ]}
        >
          <Routes>
            <Route path="/checkout/success" element={<CheckoutSuccess />} />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );

    expect(await screen.findByRole('heading', { name: 'Order Confirmed' })).toBeInTheDocument();
    expect(screen.getByText('Thanks for your purchase.')).toBeInTheDocument();
    expect(screen.getByText('ORD-123')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View orders' })).toHaveAttribute('href', '/profile');
    expect(screen.getByRole('link', { name: 'Continue shopping' })).toHaveAttribute('href', '/products');
  });

  it('falls back to checkout slice state when location state is absent', async () => {
    const store = createTestStore({
      auth: {
        user: { id: 1, email: 'user@example.com', name: 'User' },
        token: 'token-1',
        isAuthenticated: true,
        checkingSession: false,
        loading: false,
        signingOut: false,
        error: null,
        message: null,
      },
      checkout: {
        submitting: false,
        error: null,
        successMessage: 'Order placed successfully from slice.',
        lastOrderId: 'ORD-SLICE',
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/checkout/success']}>
          <Routes>
            <Route path="/checkout/success" element={<CheckoutSuccess />} />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );

    expect(await screen.findByText('Order placed successfully from slice.')).toBeInTheDocument();
    expect(screen.getByText('ORD-SLICE')).toBeInTheDocument();
  });
});

