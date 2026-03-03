import { describe, expect, it } from 'vitest';

import {
  formatCardCvcInput,
  formatCardExpiryInput,
  formatCardNumberInput,
  validateCheckout,
  type CheckoutFormValues,
} from '../../../pages/CheckoutPage/validation';

function buildValues(overrides: Partial<CheckoutFormValues> = {}): CheckoutFormValues {
  return {
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    address: '123 Main Street',
    city: 'Oslo',
    postalCode: '0150',
    country: 'Norway',
    cardNumber: '4111 1111 1111 1111',
    cardExpiry: '01/30',
    cardCvc: '123',
    paypalEmail: 'paypal@example.com',
    ...overrides,
  };
}

describe('checkout validation helpers', () => {
  it('formats card number into groups of four digits', () => {
    expect(formatCardNumberInput('41111111abcd111122223333')).toBe('4111 1111 1111 2222 333');
  });

  it('formats card expiry as MM/YY', () => {
    expect(formatCardExpiryInput('01309')).toBe('01/30');
    expect(formatCardExpiryInput('0a1')).toBe('01');
  });

  it('strips non-digits from cvc and caps at four characters', () => {
    expect(formatCardCvcInput('12a34b5')).toBe('1234');
  });

  it('returns no errors for a valid card checkout', () => {
    expect(
      validateCheckout(buildValues(), 'card', {
        requireShipping: true,
        requirePayment: true,
      }),
    ).toEqual({});
  });

  it('returns shipping and card validation errors for invalid values', () => {
    expect(
      validateCheckout(
        buildValues({
          fullName: 'J',
          email: 'bad-email',
          address: '123',
          city: 'O',
          postalCode: '1',
          country: 'N',
          cardNumber: '4111',
          cardExpiry: '13/99',
          cardCvc: '12',
        }),
        'card',
        {
          requireShipping: true,
          requirePayment: true,
        },
      ),
    ).toEqual({
      fullName: 'Enter your full name.',
      email: 'Enter a valid email address.',
      address: 'Enter a valid street address.',
      city: 'Enter a valid city.',
      postalCode: 'Enter a valid postal code.',
      country: 'Enter a valid country.',
      cardNumber: 'Card number must be 13 to 19 digits.',
      cardExpiry: 'Use MM/YY format.',
      cardCvc: 'CVC must be 3 or 4 digits.',
    });
  });

  it('only validates paypal email when paypal is selected', () => {
    expect(
      validateCheckout(
        buildValues({
          paypalEmail: 'invalid',
          cardNumber: '',
          cardExpiry: '',
          cardCvc: '',
        }),
        'paypal',
        {
          requireShipping: false,
          requirePayment: true,
        },
      ),
    ).toEqual({
      paypalEmail: 'Enter a valid PayPal email address.',
    });
  });
});

