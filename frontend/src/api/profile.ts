import type { SavedAddress, SavedPaymentMethod } from '../types/profile';

const API_BASE = '/api/profile';

async function getErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const data = await res.json();
    if (typeof data?.message === 'string' && data.message.trim()) {
      return data.message;
    }
  } catch {
    // Ignore parse errors and use fallback.
  }

  return fallback;
}

export interface CreateAddressPayload {
  label: string;
  fullName: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface CreatePaymentMethodPayload {
  label: string;
  method: 'card' | 'paypal';
  cardLast4?: string;
  cardExpiry?: string;
  paypalEmail?: string;
  isDefault?: boolean;
}

export async function fetchAddresses(): Promise<SavedAddress[]> {
  const res = await fetch(`${API_BASE}/addresses`);
  if (!res.ok) {
    const message = await getErrorMessage(res, 'Failed to load addresses');
    throw new Error(message);
  }
  return res.json();
}

export async function createAddress(payload: CreateAddressPayload): Promise<SavedAddress> {
  const res = await fetch(`${API_BASE}/addresses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const message = await getErrorMessage(res, 'Failed to save address');
    throw new Error(message);
  }
  return res.json();
}

export async function deleteAddress(addressId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/addresses/${addressId}`, { method: 'DELETE' });
  if (!res.ok) {
    const message = await getErrorMessage(res, 'Failed to delete address');
    throw new Error(message);
  }
}

export async function setDefaultAddress(addressId: number): Promise<SavedAddress> {
  const res = await fetch(`${API_BASE}/addresses/${addressId}/default`, { method: 'PATCH' });
  if (!res.ok) {
    const message = await getErrorMessage(res, 'Failed to set default address');
    throw new Error(message);
  }
  return res.json();
}

export async function fetchPaymentMethods(): Promise<SavedPaymentMethod[]> {
  const res = await fetch(`${API_BASE}/payment-methods`);
  if (!res.ok) {
    const message = await getErrorMessage(res, 'Failed to load payment methods');
    throw new Error(message);
  }
  return res.json();
}

export async function createPaymentMethod(payload: CreatePaymentMethodPayload): Promise<SavedPaymentMethod> {
  const res = await fetch(`${API_BASE}/payment-methods`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const message = await getErrorMessage(res, 'Failed to save payment method');
    throw new Error(message);
  }
  return res.json();
}

export async function deletePaymentMethod(paymentMethodId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/payment-methods/${paymentMethodId}`, { method: 'DELETE' });
  if (!res.ok) {
    const message = await getErrorMessage(res, 'Failed to delete payment method');
    throw new Error(message);
  }
}

export async function setDefaultPaymentMethod(paymentMethodId: number): Promise<SavedPaymentMethod> {
  const res = await fetch(`${API_BASE}/payment-methods/${paymentMethodId}/default`, { method: 'PATCH' });
  if (!res.ok) {
    const message = await getErrorMessage(res, 'Failed to set default payment method');
    throw new Error(message);
  }
  return res.json();
}
