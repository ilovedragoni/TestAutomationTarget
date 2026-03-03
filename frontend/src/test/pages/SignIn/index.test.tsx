import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import SignIn from '../../../pages/SignIn/index';
import { renderWithProviders } from '../../test-utils';
import * as signInApi from '../../../api/signin';

vi.mock('../../../api/signin', () => ({
  signIn: vi.fn(),
  fetchSession: vi.fn(),
  logout: vi.fn(),
}));

describe('SignIn', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('submits trimmed credentials and updates auth state on success', async () => {
    vi.mocked(signInApi.signIn).mockResolvedValue({
      token: 'token-1',
      user: {
        id: 1,
        email: 'user@example.com',
        name: 'Test User',
      },
    });

    const user = userEvent.setup();
    const { store } = renderWithProviders(<SignIn />);

    await user.type(screen.getByLabelText('Email'), '  user@example.com  ');
    await user.type(screen.getByLabelText('Password'), 'secret123');
    await user.click(screen.getByLabelText('Remember me'));
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(signInApi.signIn).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'secret123',
        rememberMe: false,
      });
    });

    await waitFor(() => {
      expect(store.getState().auth.isAuthenticated).toBe(true);
    });
    expect(store.getState().auth.user?.email).toBe('user@example.com');
  });

  it('shows an auth error when sign-in fails', async () => {
    vi.mocked(signInApi.signIn).mockRejectedValue(new Error('Invalid email or password'));

    const user = userEvent.setup();
    renderWithProviders(<SignIn />);

    await user.type(screen.getByLabelText('Email'), 'user@example.com');
    await user.type(screen.getByLabelText('Password'), 'wrong-password');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password');
  });
});

