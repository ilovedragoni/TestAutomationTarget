export interface SavedAddress {
  id: number;
  label: string;
  fullName: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export type SavedPaymentMethodType = 'card' | 'paypal';

export interface SavedPaymentMethod {
  id: number;
  label: string;
  method: SavedPaymentMethodType;
  cardLast4?: string;
  cardExpiry?: string;
  paypalEmail?: string;
  isDefault: boolean;
}
