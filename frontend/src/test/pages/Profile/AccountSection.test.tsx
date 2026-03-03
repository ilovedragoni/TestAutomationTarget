import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import AccountSection from '../../../pages/Profile/AccountSection';
import { renderWithProviders } from '../../test-utils';
import * as profileApi from '../../../api/profile';

vi.mock('../../../api/profile', () => ({
  updateAccount: vi.fn(),
  changePassword: vi.fn(),
  deleteAccount: vi.fn(),
}));

describe('AccountSection', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('shows read-only account details before editing', () => {
    renderWithProviders(<AccountSection />, {
      preloadedState: {
        auth: {
          user: {
            id: 1,
            email: 'user@example.com',
            name: 'Test User',
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
    });

    expect(screen.getByText('Email: user@example.com')).toBeInTheDocument();
    expect(screen.getByText('Name: Test User')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit account details' })).toBeInTheDocument();
  });

  it('blocks invalid account updates client-side', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AccountSection />, {
      preloadedState: {
        auth: {
          user: {
            id: 1,
            email: 'user@example.com',
            name: 'Test User',
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
    });

    await user.click(screen.getByRole('button', { name: 'Edit account details' }));
    await user.clear(screen.getByLabelText('Name'));
    await user.type(screen.getByLabelText('Name'), 'A');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText('Name must be at least 2 characters.')).toBeInTheDocument();
    expect(profileApi.updateAccount).not.toHaveBeenCalled();
  });

  it('saves valid account updates and returns to read-only mode', async () => {
    vi.mocked(profileApi.updateAccount).mockResolvedValue({
      id: 1,
      email: 'updated@example.com',
      name: 'Updated User',
    });

    const user = userEvent.setup();
    renderWithProviders(<AccountSection />, {
      preloadedState: {
        auth: {
          user: {
            id: 1,
            email: 'user@example.com',
            name: 'Test User',
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
    });

    await user.click(screen.getByRole('button', { name: 'Edit account details' }));
    await user.clear(screen.getByLabelText('Name'));
    await user.type(screen.getByLabelText('Name'), 'Updated User');
    await user.clear(screen.getByLabelText('Email'));
    await user.type(screen.getByLabelText('Email'), 'updated@example.com');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => {
      expect(profileApi.updateAccount).toHaveBeenCalledWith({
        name: 'Updated User',
        email: 'updated@example.com',
      });
    });

    expect(await screen.findByText('Account details updated.')).toBeInTheDocument();
    expect(screen.getByText('Email: updated@example.com')).toBeInTheDocument();
    expect(screen.getByText('Name: Updated User')).toBeInTheDocument();
  });
});

