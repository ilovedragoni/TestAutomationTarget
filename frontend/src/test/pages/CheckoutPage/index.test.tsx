import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CheckoutPage from '../../../pages/CheckoutPage/index';
import { renderWithProviders } from '../../test-utils';
import * as profileApi from '../../../api/profile';

vi.mock('../../../api/profile', () => ({
  fetchAddresses: vi.fn(),
  fetchPaymentMethods: vi.fn(),
}));

describe('CheckoutPage', () => {
  beforeEach(() => {
    vi.mocked(profileApi.fetchAddresses).mockResolvedValue([]);
    vi.mocked(profileApi.fetchPaymentMethods).mockResolvedValue([]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('shows auth-required notice for signed-out users', () => {
    renderWithProviders(<CheckoutPage />, {
      preloadedState: {
        auth: {
          user: null,
          token: null,
          isAuthenticated: false,
          checkingSession: false,
          loading: false,
          signingOut: false,
          error: null,
          message: null,
        },
      },
      route: '/checkout',
    });

    expect(screen.getByText('Checkout')).toBeInTheDocument();
    expect(screen.getByText(/You need to/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'sign in' })).toHaveAttribute('href', '/signin');
  });

  it('shows empty-cart state for authenticated users without items', () => {
    renderWithProviders(<CheckoutPage />, {
      preloadedState: {
        auth: {
          user: {
            id: 1,
            email: 'user@example.com',
            name: 'User',
          },
          token: 'token-1',
          isAuthenticated: true,
          checkingSession: false,
          loading: false,
          signingOut: false,
          error: null,
          message: null,
        },
      },
      route: '/checkout',
    });

    expect(screen.getByText('Your cart is empty, so there is nothing to check out yet.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Browse products' })).toHaveAttribute('href', '/products');
  });

  it('shows client-side validation errors when required checkout fields are missing', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CheckoutPage />, {
      preloadedState: {
        auth: {
          user: {
            id: 1,
            email: 'user@example.com',
            name: 'User',
          },
          token: 'token-1',
          isAuthenticated: true,
          checkingSession: false,
          loading: false,
          signingOut: false,
          error: null,
          message: null,
        },
        cart: {
          items: [
            {
              product: {
                id: 1,
                name: 'Keyboard',
                description: 'Mechanical keyboard',
                price: 99.9,
                category: {
                  id: 10,
                  name: 'Electronics',
                  description: null,
                },
              },
              quantity: 1,
            },
          ],
          syncing: false,
          syncError: null,
        },
      },
      route: '/checkout',
    });

    await waitFor(() => {
      expect(profileApi.fetchAddresses).toHaveBeenCalled();
      expect(profileApi.fetchPaymentMethods).toHaveBeenCalled();
    });

    await user.click(screen.getByRole('button', { name: 'Place order' }));

    expect(await screen.findByText('Enter your full name.')).toBeInTheDocument();
    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument();
    expect(screen.getByText('Enter a valid street address.')).toBeInTheDocument();
    expect(screen.getByText('Card number must be 13 to 19 digits.')).toBeInTheDocument();
  });
});

