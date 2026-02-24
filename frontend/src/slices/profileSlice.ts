import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import type { RootState } from '../app/store';
import * as profileApi from '../api/profile';
import type { SavedAddress, SavedPaymentMethod } from '../types/profile';

export interface ProfileState {
  addresses: SavedAddress[];
  paymentMethods: SavedPaymentMethod[];
  loadingAddresses: boolean;
  loadingPaymentMethods: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  addresses: [],
  paymentMethods: [],
  loadingAddresses: false,
  loadingPaymentMethods: false,
  error: null,
};

export const loadAddresses = createAsyncThunk<SavedAddress[], void, { rejectValue: string }>(
  'profile/loadAddresses',
  async (_, { rejectWithValue }) => {
    try {
      return await profileApi.fetchAddresses();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load addresses';
      return rejectWithValue(message);
    }
  },
);

export const addAddress = createAsyncThunk<SavedAddress, profileApi.CreateAddressPayload, { rejectValue: string }>(
  'profile/addAddress',
  async (payload, { rejectWithValue }) => {
    try {
      return await profileApi.createAddress(payload);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save address';
      return rejectWithValue(message);
    }
  },
);

export const removeAddress = createAsyncThunk<number, number, { rejectValue: string }>(
  'profile/removeAddress',
  async (addressId, { rejectWithValue }) => {
    try {
      await profileApi.deleteAddress(addressId);
      return addressId;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete address';
      return rejectWithValue(message);
    }
  },
);

export const chooseDefaultAddress = createAsyncThunk<SavedAddress, number, { rejectValue: string }>(
  'profile/chooseDefaultAddress',
  async (addressId, { rejectWithValue }) => {
    try {
      return await profileApi.setDefaultAddress(addressId);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to set default address';
      return rejectWithValue(message);
    }
  },
);

export const loadPaymentMethods = createAsyncThunk<SavedPaymentMethod[], void, { rejectValue: string }>(
  'profile/loadPaymentMethods',
  async (_, { rejectWithValue }) => {
    try {
      return await profileApi.fetchPaymentMethods();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load payment methods';
      return rejectWithValue(message);
    }
  },
);

export const addPaymentMethod = createAsyncThunk<
  SavedPaymentMethod,
  profileApi.CreatePaymentMethodPayload,
  { rejectValue: string }
>('profile/addPaymentMethod', async (payload, { rejectWithValue }) => {
  try {
    return await profileApi.createPaymentMethod(payload);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to save payment method';
    return rejectWithValue(message);
  }
});

export const removePaymentMethod = createAsyncThunk<number, number, { rejectValue: string }>(
  'profile/removePaymentMethod',
  async (paymentMethodId, { rejectWithValue }) => {
    try {
      await profileApi.deletePaymentMethod(paymentMethodId);
      return paymentMethodId;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete payment method';
      return rejectWithValue(message);
    }
  },
);

export const chooseDefaultPaymentMethod = createAsyncThunk<SavedPaymentMethod, number, { rejectValue: string }>(
  'profile/chooseDefaultPaymentMethod',
  async (paymentMethodId, { rejectWithValue }) => {
    try {
      return await profileApi.setDefaultPaymentMethod(paymentMethodId);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to set default payment method';
      return rejectWithValue(message);
    }
  },
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfileError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadAddresses.pending, (state) => {
        state.loadingAddresses = true;
        state.error = null;
      })
      .addCase(loadAddresses.fulfilled, (state, action) => {
        state.loadingAddresses = false;
        state.addresses = action.payload;
      })
      .addCase(loadAddresses.rejected, (state, action) => {
        state.loadingAddresses = false;
        state.error = action.payload ?? 'Failed to load addresses';
      })
      .addCase(addAddress.fulfilled, (state, action) => {
        if (action.payload.isDefault) {
          state.addresses = state.addresses.map((item) => ({ ...item, isDefault: false }));
        }
        state.addresses = [action.payload, ...state.addresses];
      })
      .addCase(addAddress.rejected, (state, action) => {
        state.error = action.payload ?? 'Failed to save address';
      })
      .addCase(removeAddress.fulfilled, (state, action) => {
        state.addresses = state.addresses.filter((item) => item.id !== action.payload);
      })
      .addCase(removeAddress.rejected, (state, action) => {
        state.error = action.payload ?? 'Failed to delete address';
      })
      .addCase(chooseDefaultAddress.fulfilled, (state, action) => {
        state.addresses = state.addresses.map((item) => ({
          ...item,
          isDefault: item.id === action.payload.id,
        }));
      })
      .addCase(chooseDefaultAddress.rejected, (state, action) => {
        state.error = action.payload ?? 'Failed to set default address';
      })
      .addCase(loadPaymentMethods.pending, (state) => {
        state.loadingPaymentMethods = true;
        state.error = null;
      })
      .addCase(loadPaymentMethods.fulfilled, (state, action) => {
        state.loadingPaymentMethods = false;
        state.paymentMethods = action.payload;
      })
      .addCase(loadPaymentMethods.rejected, (state, action) => {
        state.loadingPaymentMethods = false;
        state.error = action.payload ?? 'Failed to load payment methods';
      })
      .addCase(addPaymentMethod.fulfilled, (state, action) => {
        if (action.payload.isDefault) {
          state.paymentMethods = state.paymentMethods.map((item) => ({ ...item, isDefault: false }));
        }
        state.paymentMethods = [action.payload, ...state.paymentMethods];
      })
      .addCase(addPaymentMethod.rejected, (state, action) => {
        state.error = action.payload ?? 'Failed to save payment method';
      })
      .addCase(removePaymentMethod.fulfilled, (state, action) => {
        state.paymentMethods = state.paymentMethods.filter((item) => item.id !== action.payload);
      })
      .addCase(removePaymentMethod.rejected, (state, action) => {
        state.error = action.payload ?? 'Failed to delete payment method';
      })
      .addCase(chooseDefaultPaymentMethod.fulfilled, (state, action) => {
        state.paymentMethods = state.paymentMethods.map((item) => ({
          ...item,
          isDefault: item.id === action.payload.id,
        }));
      })
      .addCase(chooseDefaultPaymentMethod.rejected, (state, action) => {
        state.error = action.payload ?? 'Failed to set default payment method';
      });
  },
});

export const { clearProfileError } = profileSlice.actions;

export const selectAddresses = (state: RootState) => state.profile.addresses;
export const selectPaymentMethods = (state: RootState) => state.profile.paymentMethods;
export const selectProfileLoadingAddresses = (state: RootState) => state.profile.loadingAddresses;
export const selectProfileLoadingPaymentMethods = (state: RootState) => state.profile.loadingPaymentMethods;
export const selectProfileError = (state: RootState) => state.profile.error;

export default profileSlice.reducer;
