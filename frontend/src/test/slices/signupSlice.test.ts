import { describe, expect, it } from 'vitest';

import signupReducer, {
  clearSignUpFeedback,
  signUp,
  type SignUpState,
} from '../../slices/signupSlice';

const initialState: SignUpState = {
  loading: false,
  error: null,
  message: null,
  registeredEmail: null,
};

describe('signupSlice reducer', () => {
  it('sets loading and clears feedback on signUp.pending', () => {
    const nextState = signupReducer(
      {
        ...initialState,
        error: 'old error',
        message: 'old message',
      },
      signUp.pending('request-id', {
        name: 'New User',
        email: 'new@example.com',
        password: 'secret123',
      }),
    );

    expect(nextState.loading).toBe(true);
    expect(nextState.error).toBeNull();
    expect(nextState.message).toBeNull();
  });

  it('stores registered email and success message on signUp.fulfilled', () => {
    const nextState = signupReducer(
      {
        ...initialState,
        loading: true,
      },
      signUp.fulfilled(
        {
          user: {
            id: 1,
            email: 'new@example.com',
            name: 'New User',
          },
          message: 'Account created successfully.',
        },
        'request-id',
        {
          name: 'New User',
          email: 'new@example.com',
          password: 'secret123',
        },
      ),
    );

    expect(nextState.loading).toBe(false);
    expect(nextState.registeredEmail).toBe('new@example.com');
    expect(nextState.message).toBe('Account created successfully.');
  });

  it('stores rejection errors and clears them with clearSignUpFeedback', () => {
    const rejectedState = signupReducer(
      initialState,
      signUp.rejected(
        new Error('boom'),
        'request-id',
        {
          name: 'New User',
          email: 'new@example.com',
          password: 'secret123',
        },
        'Email is already in use',
      ),
    );
    const clearedState = signupReducer(rejectedState, clearSignUpFeedback());

    expect(rejectedState.loading).toBe(false);
    expect(rejectedState.error).toBe('Email is already in use');
    expect(clearedState.error).toBeNull();
    expect(clearedState.message).toBeNull();
  });
});

