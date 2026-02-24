import type { PaymentMethod } from '../../types/checkout';

export type { PaymentMethod };

export interface CheckoutFormValues {
  fullName: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
  paypalEmail: string;
}

export type CheckoutFormErrors = Partial<Record<keyof CheckoutFormValues, string>>;
export interface CheckoutValidationOptions {
  requireShipping: boolean;
  requirePayment: boolean;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const postalCodeRegex = /^[A-Za-z0-9 -]{3,12}$/;
const cardNumberRegex = /^\d{13,19}$/;
const cardExpiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
const cardCvcRegex = /^\d{3,4}$/;

export function formatCardNumberInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 19);
  const groups = digits.match(/.{1,4}/g);
  return groups ? groups.join(' ') : '';
}

export function formatCardExpiryInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) {
    return digits;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function formatCardCvcInput(value: string): string {
  return value.replace(/\D/g, '').slice(0, 4);
}

export function validateCheckout(
  values: CheckoutFormValues,
  paymentMethod: PaymentMethod,
  options: CheckoutValidationOptions,
): CheckoutFormErrors {
  const errors: CheckoutFormErrors = {};

  if (options.requireShipping) {
    if (values.fullName.trim().length < 2) errors.fullName = 'Enter your full name.';
    if (!emailRegex.test(values.email.trim())) errors.email = 'Enter a valid email address.';
    if (values.address.trim().length < 5) errors.address = 'Enter a valid street address.';
    if (values.city.trim().length < 2) errors.city = 'Enter a valid city.';
    if (!postalCodeRegex.test(values.postalCode.trim())) errors.postalCode = 'Enter a valid postal code.';
    if (values.country.trim().length < 2) errors.country = 'Enter a valid country.';
  }

  if (options.requirePayment && paymentMethod === 'card') {
    const cardDigits = values.cardNumber.replace(/\s+/g, '');
    if (!cardNumberRegex.test(cardDigits)) errors.cardNumber = 'Card number must be 13 to 19 digits.';
    if (!cardExpiryRegex.test(values.cardExpiry.trim())) errors.cardExpiry = 'Use MM/YY format.';
    if (!cardCvcRegex.test(values.cardCvc.trim())) errors.cardCvc = 'CVC must be 3 or 4 digits.';
  }

  if (options.requirePayment && paymentMethod === 'paypal' && !emailRegex.test(values.paypalEmail.trim())) {
    errors.paypalEmail = 'Enter a valid PayPal email address.';
  }

  return errors;
}
