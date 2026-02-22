import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../app/store';
import * as api from '../api/signup';
import type { SignUpRequest, SignUpResponse } from '../types/auth';

export interface SignUpState {
  loading: boolean;
  error: string | null;
  message: string | null;
  registeredEmail: string | null;
}

const initialState: SignUpState = {
  loading: false,
  error: null,
  message: null,
  registeredEmail: null,
};

export const signUp = createAsyncThunk<SignUpResponse, SignUpRequest, { rejectValue: string }>(
  'signup/signUp',
  async (payload, { rejectWithValue }) => {
    try {
      return await api.signUp(payload);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sign up';
      return rejectWithValue(message);
    }
  },
);

const signupSlice = createSlice({
  name: 'signup',
  initialState,
  reducers: {
    clearSignUpFeedback(state) {
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signUp.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.loading = false;
        state.registeredEmail = action.payload.user.email;
        state.message = action.payload.message ?? 'Account created successfully.';
      })
      .addCase(signUp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Unknown error';
      });
  },
});

export const { clearSignUpFeedback } = signupSlice.actions;
export const selectSignUp = (state: RootState) => state.signup;

export default signupSlice.reducer;
