import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CartPage from '../../../pages/CartPage/index';
import { renderWithProviders } from '../../test-utils';
import * as cartApi from '../../../api/cart';
import type { Product } from '../../../types/product';

vi.mock('../../../api/cart', () => ({
  fetchCart: vi.fn(),
  replaceCart: vi.fn(),
  clearServerCart: vi.fn(),
}));

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

describe('CartPage', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders cart items and subtotal from store state', () => {
    renderWithProviders(<CartPage />, {
      preloadedState: {
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
        cart: {
          items: [
            { product: keyboard, quantity: 2 },
            { product: mouse, quantity: 1 },
          ],
          syncing: false,
          syncError: null,
        },
      },
    });

    expect(screen.getByText('Keyboard')).toBeInTheDocument();
    expect(screen.getByText('Mouse')).toBeInTheDocument();
    expect(screen.getByText('Subtotal:')).toBeInTheDocument();
    expect(screen.getByText('$249.70')).toBeInTheDocument();
  });

  it('increments a cart item through the cart API', async () => {
    vi.mocked(cartApi.replaceCart).mockResolvedValue([{ product: keyboard, quantity: 2 }]);

    const user = userEvent.setup();
    renderWithProviders(<CartPage />, {
      preloadedState: {
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
        cart: {
          items: [{ product: keyboard, quantity: 1 }],
          syncing: false,
          syncError: null,
        },
      },
    });

    await user.click(screen.getByRole('button', { name: '+' }));

    await waitFor(() => {
      expect(cartApi.replaceCart).toHaveBeenCalledWith([{ product: keyboard, quantity: 2 }]);
    });

    const item = await screen.findByTestId('cart-item-1');
    expect(within(item).getByText('2')).toBeInTheDocument();
    expect(screen.getByText('$199.80', { selector: '#cart-subtotal' })).toBeInTheDocument();
  });

  it('clears the cart and shows the empty state', async () => {
    vi.mocked(cartApi.clearServerCart).mockResolvedValue();

    const user = userEvent.setup();
    renderWithProviders(<CartPage />, {
      preloadedState: {
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
        cart: {
          items: [{ product: keyboard, quantity: 1 }],
          syncing: false,
          syncError: null,
        },
      },
    });

    await user.click(screen.getByRole('button', { name: 'Clear cart' }));

    await waitFor(() => {
      expect(cartApi.clearServerCart).toHaveBeenCalled();
    });

    expect(await screen.findByText('Your cart is currently empty.')).toBeInTheDocument();
  });
});

