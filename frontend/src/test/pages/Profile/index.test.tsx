import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Profile from '../../../pages/Profile/index';
import { renderWithProviders } from '../../test-utils';
import * as ordersApi from '../../../api/orders';
import * as profileApi from '../../../api/profile';

vi.mock('../../../api/orders', () => ({
  fetchOrders: vi.fn(),
}));

vi.mock('../../../api/profile', () => ({
  fetchAddresses: vi.fn(),
  createAddress: vi.fn(),
  deleteAddress: vi.fn(),
  setDefaultAddress: vi.fn(),
  fetchPaymentMethods: vi.fn(),
  createPaymentMethod: vi.fn(),
  deletePaymentMethod: vi.fn(),
  setDefaultPaymentMethod: vi.fn(),
  updateAccount: vi.fn(),
  changePassword: vi.fn(),
  deleteAccount: vi.fn(),
}));

describe('Profile section switching', () => {
  beforeEach(() => {
    vi.mocked(ordersApi.fetchOrders).mockResolvedValue([
      {
        orderId: 'ORD-100',
        status: 'PLACED',
        createdAt: '2026-03-01T12:00:00Z',
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
      },
    ]);
    vi.mocked(profileApi.fetchAddresses).mockResolvedValue([
      {
        id: 1,
        label: 'Home',
        fullName: 'User Name',
        email: 'user@example.com',
        address: 'Main Street 1',
        city: 'Oslo',
        postalCode: '0150',
        country: 'Norway',
        isDefault: true,
      },
    ]);
    vi.mocked(profileApi.fetchPaymentMethods).mockResolvedValue([
      {
        id: 1,
        label: 'Primary',
        method: 'card',
        cardLast4: '4242',
        cardExpiry: '01/30',
        isDefault: true,
      },
    ]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('switches between profile subsections and loads section data when needed', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Profile />, {
      preloadedState: {
        auth: {
          user: { id: 1, email: 'user@example.com', name: 'User Name' },
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

    expect(await screen.findByRole('heading', { name: 'Order history' })).toBeInTheDocument();
    expect(screen.getByText('ORD-100')).toBeInTheDocument();
    await waitFor(() => {
      expect(ordersApi.fetchOrders).toHaveBeenCalled();
    });

    await user.click(screen.getByRole('button', { name: 'Addresses' }));
    expect(await screen.findByRole('heading', { name: 'Saved addresses' })).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    await waitFor(() => {
      expect(profileApi.fetchAddresses).toHaveBeenCalled();
    });

    await user.click(screen.getByRole('button', { name: 'Payment Methods' }));
    expect(await screen.findByRole('heading', { name: 'Saved payment methods' })).toBeInTheDocument();
    expect(screen.getByText('Primary')).toBeInTheDocument();
    await waitFor(() => {
      expect(profileApi.fetchPaymentMethods).toHaveBeenCalled();
    });

    await user.click(screen.getByRole('button', { name: 'Notifications' }));
    expect(await screen.findByRole('heading', { name: 'Notifications' })).toBeInTheDocument();
    expect(screen.getByText('This section is not connected to backend at all.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Account' }));
    expect(await screen.findByRole('heading', { name: 'Account details' })).toBeInTheDocument();
    expect(screen.getByText('Email: user@example.com')).toBeInTheDocument();
  });
});

