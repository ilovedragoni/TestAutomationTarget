import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import SignUp from '../../../pages/SignUp/index';
import { renderWithProviders } from '../../test-utils';
import * as signUpApi from '../../../api/signup';

vi.mock('../../../api/signup', () => ({
  signUp: vi.fn(),
}));

describe('SignUp', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('shows a mismatch message and disables submit until passwords match', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SignUp />);

    await user.type(screen.getByLabelText('Password'), 'secret123');
    await user.type(screen.getByLabelText('Confirm password'), 'different123');

    expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign up' })).toBeDisabled();
  });

  it('submits trimmed registration data and shows the registered email', async () => {
    vi.mocked(signUpApi.signUp).mockResolvedValue({
      message: 'Account created successfully.',
      user: {
        id: 1,
        email: 'new@example.com',
        name: 'New User',
      },
    });

    const user = userEvent.setup();
    renderWithProviders(<SignUp />);

    await user.type(screen.getByLabelText('Full name'), '  New User  ');
    await user.type(screen.getByLabelText('Email'), '  new@example.com  ');
    await user.type(screen.getByLabelText('Password'), 'secret123');
    await user.type(screen.getByLabelText('Confirm password'), 'secret123');
    await user.click(screen.getByRole('button', { name: 'Sign up' }));

    await waitFor(() => {
      expect(signUpApi.signUp).toHaveBeenCalledWith({
        name: 'New User',
        email: 'new@example.com',
        password: 'secret123',
      });
    });

    expect(await screen.findByRole('alert')).toHaveTextContent('Account created successfully.');
    expect(screen.getByText(/Registered as/)).toBeInTheDocument();
    expect(screen.getByText('new@example.com')).toBeInTheDocument();
  });

  it('shows a signup error when registration fails', async () => {
    vi.mocked(signUpApi.signUp).mockRejectedValue(new Error('Email already exists'));

    const user = userEvent.setup();
    renderWithProviders(<SignUp />);

    await user.type(screen.getByLabelText('Full name'), 'New User');
    await user.type(screen.getByLabelText('Email'), 'new@example.com');
    await user.type(screen.getByLabelText('Password'), 'secret123');
    await user.type(screen.getByLabelText('Confirm password'), 'secret123');
    await user.click(screen.getByRole('button', { name: 'Sign up' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Email already exists');
  });
});

