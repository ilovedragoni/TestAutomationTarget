import type { CartItem } from '../slices/cartSlice';

export type PaymentMethod = 'card' | 'paypal';

export interface CheckoutShippingDetails {
  fullName: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface CheckoutCardPaymentDetails {
  method: 'card';
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
}

export interface CheckoutPaypalPaymentDetails {
  method: 'paypal';
  paypalEmail: string;
}

export type CheckoutPaymentDetails = CheckoutCardPaymentDetails | CheckoutPaypalPaymentDetails;

export interface CheckoutRequest {
  shipping?: CheckoutShippingDetails;
  payment?: CheckoutPaymentDetails;
  savedAddressId?: number;
  savedPaymentMethodId?: number;
  saveShippingAddress?: boolean;
  shippingAddressLabel?: string;
  savePaymentMethod?: boolean;
  paymentMethodLabel?: string;
  items: Array<{
    productId: number;
    quantity: number;
    unitPrice: number;
  }>;
  subtotal: number;
  currency: 'USD';
}

export interface CheckoutResponse {
  orderId: string;
  status: 'accepted' | 'pending';
  message: string;
}

export function toCheckoutItems(items: CartItem[]): CheckoutRequest['items'] {
  return items.map((item) => ({
    productId: item.product.id,
    quantity: item.quantity,
    unitPrice: item.product.price,
  }));
}
