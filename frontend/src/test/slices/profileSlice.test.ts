import { describe, expect, it } from 'vitest';

import profileReducer, {
  addAddress,
  addPaymentMethod,
  chooseDefaultAddress,
  chooseDefaultPaymentMethod,
  clearProfileError,
  loadAddresses,
  loadPaymentMethods,
  removeAddress,
  removePaymentMethod,
  type ProfileState,
} from '../../slices/profileSlice';
import type { SavedAddress, SavedPaymentMethod } from '../../types/profile';

const homeAddress: SavedAddress = {
  id: 1,
  label: 'Home',
  fullName: 'Jane Doe',
  email: 'jane@example.com',
  address: 'Main Street 1',
  city: 'Oslo',
  postalCode: '0150',
  country: 'Norway',
  isDefault: true,
};

const workAddress: SavedAddress = {
  ...homeAddress,
  id: 2,
  label: 'Work',
  address: 'Office Street 2',
  isDefault: false,
};

const primaryCard: SavedPaymentMethod = {
  id: 1,
  label: 'Primary',
  method: 'card',
  cardLast4: '4242',
  cardExpiry: '01/30',
  isDefault: true,
};

const paypal: SavedPaymentMethod = {
  id: 2,
  label: 'PayPal',
  method: 'paypal',
  paypalEmail: 'jane@example.com',
  isDefault: false,
};

const initialState: ProfileState = {
  addresses: [],
  paymentMethods: [],
  loadingAddresses: false,
  loadingPaymentMethods: false,
  error: null,
};

describe('profileSlice reducer', () => {
  it('loads addresses and resets loading state', () => {
    const pendingState = profileReducer(initialState, loadAddresses.pending('request-id', undefined));
    const fulfilledState = profileReducer(
      pendingState,
      loadAddresses.fulfilled([homeAddress, workAddress], 'request-id', undefined),
    );

    expect(pendingState.loadingAddresses).toBe(true);
    expect(fulfilledState.loadingAddresses).toBe(false);
    expect(fulfilledState.addresses).toEqual([homeAddress, workAddress]);
  });

  it('adds a default address and clears previous defaults', () => {
    const stateWithAddresses: ProfileState = {
      ...initialState,
      addresses: [homeAddress],
    };

    const nextState = profileReducer(
      stateWithAddresses,
      addAddress.fulfilled(
        {
          ...workAddress,
          isDefault: true,
        },
        'request-id',
        {
          label: 'Work',
          fullName: 'Jane Doe',
          email: 'jane@example.com',
          address: 'Office Street 2',
          city: 'Oslo',
          postalCode: '0150',
          country: 'Norway',
          isDefault: true,
        },
      ),
    );

    expect(nextState.addresses[0]!.id).toBe(2);
    expect(nextState.addresses[0]!.isDefault).toBe(true);
    expect(nextState.addresses[1]!.isDefault).toBe(false);
  });

  it('marks only the selected default address on chooseDefaultAddress.fulfilled', () => {
    const stateWithAddresses: ProfileState = {
      ...initialState,
      addresses: [homeAddress, workAddress],
    };

    const nextState = profileReducer(
      stateWithAddresses,
      chooseDefaultAddress.fulfilled(workAddress, 'request-id', workAddress.id),
    );

    expect(nextState.addresses.find((item) => item.id === homeAddress.id)?.isDefault).toBe(false);
    expect(nextState.addresses.find((item) => item.id === workAddress.id)?.isDefault).toBe(true);
  });

  it('removes addresses by id', () => {
    const stateWithAddresses: ProfileState = {
      ...initialState,
      addresses: [homeAddress, workAddress],
    };

    const nextState = profileReducer(
      stateWithAddresses,
      removeAddress.fulfilled(homeAddress.id, 'request-id', homeAddress.id),
    );

    expect(nextState.addresses).toEqual([workAddress]);
  });

  it('loads payment methods and updates default selection correctly', () => {
    const loadedState = profileReducer(
      initialState,
      loadPaymentMethods.fulfilled([primaryCard, paypal], 'request-id', undefined),
    );
    const nextState = profileReducer(
      loadedState,
      chooseDefaultPaymentMethod.fulfilled(paypal, 'request-id', paypal.id),
    );

    expect(loadedState.paymentMethods).toEqual([primaryCard, paypal]);
    expect(nextState.paymentMethods.find((item) => item.id === primaryCard.id)?.isDefault).toBe(false);
    expect(nextState.paymentMethods.find((item) => item.id === paypal.id)?.isDefault).toBe(true);
  });

  it('adds a default payment method and clears previous defaults', () => {
    const stateWithMethods: ProfileState = {
      ...initialState,
      paymentMethods: [primaryCard],
    };

    const nextState = profileReducer(
      stateWithMethods,
      addPaymentMethod.fulfilled(
        {
          ...paypal,
          isDefault: true,
        },
        'request-id',
        {
          label: 'PayPal',
          method: 'paypal',
          paypalEmail: 'jane@example.com',
          isDefault: true,
        },
      ),
    );

    expect(nextState.paymentMethods[0]!.id).toBe(paypal.id);
    expect(nextState.paymentMethods[0]!.isDefault).toBe(true);
    expect(nextState.paymentMethods[1]!.isDefault).toBe(false);
  });

  it('removes payment methods by id', () => {
    const stateWithMethods: ProfileState = {
      ...initialState,
      paymentMethods: [primaryCard, paypal],
    };

    const nextState = profileReducer(
      stateWithMethods,
      removePaymentMethod.fulfilled(primaryCard.id, 'request-id', primaryCard.id),
    );

    expect(nextState.paymentMethods).toEqual([paypal]);
  });

  it('stores and clears profile errors', () => {
    const rejectedState = profileReducer(
      initialState,
      loadPaymentMethods.rejected(new Error('boom'), 'request-id', undefined, 'Failed to load payment methods'),
    );
    const clearedState = profileReducer(rejectedState, clearProfileError());

    expect(rejectedState.error).toBe('Failed to load payment methods');
    expect(clearedState.error).toBeNull();
  });
});

