import { describe, expect, it } from 'vitest';

import authReducer, { clearAuthFeedback, signIn, signOutLocal } from '../../slices/authSlice';
import type { AuthState } from '../../slices/authSlice';

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  checkingSession: true,
  loading: false,
  signingOut: false,
  error: null,
  message: null,
};

describe('authSlice reducer', () => {
  it('handles signIn.fulfilled', () => {
    const nextState = authReducer(
      initialState,
      signIn.fulfilled(
        {
          token: 'token-1',
          user: {
            id: 1,
            email: 'user@example.com',
            name: 'User',
          },
          expiresAt: '2026-12-01T00:00:00Z',
        },
        'request-id',
        {
          email: 'user@example.com',
          password: 'secret123',
          rememberMe: true,
        },
      ),
    );

    expect(nextState.loading).toBe(false);
    expect(nextState.checkingSession).toBe(false);
    expect(nextState.isAuthenticated).toBe(true);
    expect(nextState.token).toBe('token-1');
    expect(nextState.user?.email).toBe('user@example.com');
    expect(nextState.message).toBe('Signed in successfully.');
  });

  it('clears feedback without touching auth state', () => {
    const dirtyState: AuthState = {
      ...initialState,
      isAuthenticated: true,
      error: 'Bad credentials',
      message: 'Signed in successfully.',
    };

    const nextState = authReducer(dirtyState, clearAuthFeedback());

    expect(nextState.error).toBeNull();
    expect(nextState.message).toBeNull();
    expect(nextState.isAuthenticated).toBe(true);
  });

  it('signs out locally and resets auth flags', () => {
    const authenticatedState: AuthState = {
      ...initialState,
      user: {
        id: 1,
        email: 'user@example.com',
        name: 'User',
      },
      token: 'token-1',
      isAuthenticated: true,
      checkingSession: false,
      error: 'stale error',
      message: 'stale message',
    };

    const nextState = authReducer(authenticatedState, signOutLocal());

    expect(nextState).toMatchObject({
      user: null,
      token: null,
      isAuthenticated: false,
      checkingSession: false,
      error: null,
      message: null,
    });
  });
});

