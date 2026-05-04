import type { ProductItem } from '../api/products.api';
import type { SignUpPayload } from '../api/auth.api';
import { toMoney } from '../utils/helpers';

export function createShippingData(testUser: SignUpPayload) {
  return {
    fullName: testUser.name,
    email: testUser.email,
    address: 'Main Street 1',
    city: 'Oslo',
    postalCode: '0150',
    country: 'Norway',
  };
}

export function createPaymentData() {
  return {
    method: 'card' as const,
    cardNumber: '4111111111111111',
    cardExpiry: '01/30',
    cardCvc: '123',
  };
}

export function createCheckoutPreferences() {
  return {
    saveShippingAddress: true,
    shippingAddressLabel: 'Home',
    savePaymentMethod: true,
    paymentMethodLabel: 'Primary Card',
    currency: 'USD',
  };
}

export function createCheckoutItems(product: ProductItem, quantity: number) {
  const unitPrice = Number(product.price);
  return {
    items: [{ productId: product.id, quantity, unitPrice }],
    subtotal: toMoney(unitPrice * quantity),
  };
}

export function createCheckoutPayload(testUser: SignUpPayload, product: ProductItem, quantity: number) {
  const shipping = createShippingData(testUser);
  const payment = createPaymentData();
  const preferences = createCheckoutPreferences();
  const cart = createCheckoutItems(product, quantity);

  return {
    payload: {
      shipping,
      payment,
      saveShippingAddress: preferences.saveShippingAddress,
      shippingAddressLabel: preferences.shippingAddressLabel,
      savePaymentMethod: preferences.savePaymentMethod,
      paymentMethodLabel: preferences.paymentMethodLabel,
      items: cart.items,
      subtotal: cart.subtotal,
      currency: preferences.currency,
    },
    subtotal: cart.subtotal,
  };
}

export function createOrderExpectations(product: ProductItem, quantity: number) {
  const preferences = createCheckoutPreferences();
  const cart = createCheckoutItems(product, quantity);
  const payment = createPaymentData();

  return {
    currency: preferences.currency,
    quantity,
    subtotal: cart.subtotal,
    paymentLast4: payment.cardNumber.slice(-4),
    shippingAddressLabel: preferences.shippingAddressLabel,
    paymentMethodLabel: preferences.paymentMethodLabel,
  };
}
