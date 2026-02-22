import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../app/store';
import * as api from '../api/signin';
import type { AuthUser, SignInRequest, SignInResponse } from '../types/auth';

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  checkingSession: boolean;
  loading: boolean;
  signingOut: boolean;
  error: string | null;
  message: string | null;
}

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

export const signIn = createAsyncThunk<SignInResponse, SignInRequest, { rejectValue: string }>(
  'auth/signIn',
  async (payload, { rejectWithValue }) => {
    try {
      return await api.signIn(payload);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sign in';
      return rejectWithValue(message);
    }
  },
);

export const restoreSession = createAsyncThunk<SignInResponse, void, { rejectValue: string }>(
  'auth/restoreSession',
  async (_, { rejectWithValue }) => {
    try {
      return await api.fetchSession();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Not authenticated';
      return rejectWithValue(message);
    }
  },
);

export const performSignOut = createAsyncThunk<void, void, { rejectValue: string }>(
  'auth/performSignOut',
  async (_, { rejectWithValue }) => {
    try {
      await api.logout();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sign out';
      return rejectWithValue(message);
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthFeedback(state) {
      state.error = null;
      state.message = null;
    },
    signOutLocal(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.checkingSession = false;
      state.message = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signIn.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.loading = false;
        state.checkingSession = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.message = 'Signed in successfully.';
      })
      .addCase(signIn.rejected, (state, action) => {
        state.loading = false;
        state.checkingSession = false;
        state.error = action.payload ?? 'Unknown error';
        state.isAuthenticated = false;
      })
      .addCase(restoreSession.pending, (state) => {
        state.checkingSession = true;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.checkingSession = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.checkingSession = false;
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(performSignOut.fulfilled, (state) => {
        state.signingOut = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.checkingSession = false;
        state.message = null;
        state.error = null;
      })
      .addCase(performSignOut.pending, (state) => {
        state.signingOut = true;
      })
      .addCase(performSignOut.rejected, (state, action) => {
        state.signingOut = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.checkingSession = false;
        state.error = action.payload ?? 'Failed to sign out';
      });
  },
});

export const { clearAuthFeedback, signOutLocal } = authSlice.actions;

export const selectAuth = (state: RootState) => state.auth;

export default authSlice.reducer;
