import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import AppShell from '../AppShell';
import { createTestStore } from './test-utils';
import * as authApi from '../api/signin';
import * as cartApi from '../api/cart';
import * as categoriesApi from '../api/categories';
import * as productApi from '../api/products';

vi.mock('../api/signin', () => ({
  signIn: vi.fn(),
  fetchSession: vi.fn(),
  logout: vi.fn(),
}));

vi.mock('../api/cart', () => ({
  fetchCart: vi.fn(),
  replaceCart: vi.fn(),
  clearServerCart: vi.fn(),
}));

vi.mock('../api/categories', () => ({
  fetchCategories: vi.fn(),
}));

vi.mock('../api/products', () => ({
  fetchProducts: vi.fn(),
  fetchProduct: vi.fn(),
}));

describe('AppShell routing', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  function renderApp(path: string) {
    const store = createTestStore();

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[path]}>
          <AppShell />
        </MemoryRouter>
      </Provider>,
    );

    return store;
  }

  it('renders the sign-in route and restores session on app load', async () => {
    vi.mocked(authApi.fetchSession).mockRejectedValue(new Error('Not authenticated'));
    vi.mocked(categoriesApi.fetchCategories).mockResolvedValue([]);

    renderApp('/signin');

    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    await waitFor(() => {
      expect(authApi.fetchSession).toHaveBeenCalled();
    });
  });

  it('redirects unauthenticated profile visits to sign-in', async () => {
    vi.mocked(authApi.fetchSession).mockRejectedValue(new Error('Not authenticated'));
    vi.mocked(categoriesApi.fetchCategories).mockResolvedValue([]);

    renderApp('/profile');

    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Profile' })).not.toBeInTheDocument();
  });

  it('shows the profile route and loads cart when the restored session is authenticated', async () => {
    vi.mocked(authApi.fetchSession).mockResolvedValue({
      token: 'token-1',
      user: {
        id: 1,
        email: 'user@example.com',
        name: 'Test User',
      },
    });
    vi.mocked(cartApi.fetchCart).mockResolvedValue([]);
    vi.mocked(categoriesApi.fetchCategories).mockResolvedValue([]);

    renderApp('/profile');

    expect(await screen.findByRole('heading', { name: 'Profile' })).toBeInTheDocument();
    await waitFor(() => {
      expect(cartApi.fetchCart).toHaveBeenCalled();
    });
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeInTheDocument();
  });

  it('applies category filtering from the route bar to product loading', async () => {
    vi.mocked(authApi.fetchSession).mockRejectedValue(new Error('Not authenticated'));
    vi.mocked(categoriesApi.fetchCategories).mockResolvedValue([
      { id: 10, name: 'Electronics', description: null },
      { id: 20, name: 'Home', description: null },
    ]);
    vi.mocked(productApi.fetchProducts).mockResolvedValue({
      items: [],
      page: 0,
      size: 12,
      totalElements: 0,
      totalPages: 0,
    });

    renderApp('/products');

    const user = userEvent.setup();
    await screen.findByRole('link', { name: 'Electronics' });
    await waitFor(() => {
      expect(productApi.fetchProducts).toHaveBeenCalledWith('', null, 0, 12);
    });

    await user.click(screen.getByRole('link', { name: 'Electronics' }));

    await waitFor(() => {
      expect(productApi.fetchProducts).toHaveBeenLastCalledWith('', 10, 0, 12);
    });
  });
});

