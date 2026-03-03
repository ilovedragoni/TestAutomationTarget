import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ProductList from '../../../pages/ProductList/index';
import { renderWithProviders } from '../../test-utils';
import * as productApi from '../../../api/products';
import * as cartApi from '../../../api/cart';
import type { ProductPage } from '../../../types/product';

vi.mock('../../../api/products', () => ({
  fetchProducts: vi.fn(),
  fetchProduct: vi.fn(),
}));

vi.mock('../../../api/cart', () => ({
  fetchCart: vi.fn(),
  replaceCart: vi.fn(),
  clearServerCart: vi.fn(),
}));

const keyboard = {
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

const mouse = {
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

describe('ProductList', () => {
  beforeEach(() => {
    vi.mocked(productApi.fetchProducts).mockImplementation(
      async (search = '', categoryId = null, page = 0, size = 12) =>
        ({
          items: [keyboard, mouse],
          page,
          size,
          totalElements: 2,
          totalPages: 2,
        }) satisfies ProductPage,
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('loads products, shows the auth notice for guests, and hides add-to-cart actions', async () => {
    renderWithProviders(<ProductList />, {
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
    });

    expect(await screen.findByText('Keyboard')).toBeInTheDocument();
    expect(screen.getByText(/You need to/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add to cart' })).not.toBeInTheDocument();
    expect(productApi.fetchProducts).toHaveBeenCalledWith('', null, 0, 12);
  });

  it('searches with trimmed input and paginates to the next page', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProductList />, {
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
      },
    });

    expect(await screen.findByText('Keyboard')).toBeInTheDocument();

    await user.clear(screen.getByRole('searchbox', { name: 'Search products' }));
    await user.type(screen.getByRole('searchbox', { name: 'Search products' }), '  keyboard  ');
    await user.click(screen.getByRole('button', { name: 'Search' }));

    await waitFor(() => {
      expect(productApi.fetchProducts).toHaveBeenLastCalledWith('keyboard', null, 0, 12);
    });

    await user.click(screen.getByRole('button', { name: 'Next' }));

    await waitFor(() => {
      expect(productApi.fetchProducts).toHaveBeenLastCalledWith('keyboard', null, 1, 12);
    });
  });

  it('adds a product to the cart for authenticated users', async () => {
    vi.mocked(cartApi.replaceCart).mockResolvedValue([{ product: keyboard, quantity: 1 }]);

    const user = userEvent.setup();
    renderWithProviders(<ProductList />, {
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
      },
    });

    const keyboardRow = await screen.findByTestId('product-row-1');
    await user.click(within(keyboardRow).getByRole('button', { name: 'Add to cart' }));

    await waitFor(() => {
      expect(cartApi.replaceCart).toHaveBeenCalledWith([{ product: keyboard, quantity: 1 }]);
    });
  });
});

