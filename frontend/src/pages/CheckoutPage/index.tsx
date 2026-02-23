import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import AuthRequiredNotice from '../../components/AuthRequiredNotice';
import LoadingSpinner from '../../components/LoadingSpinner';
import { clearCartServer, selectCartItems, selectCartSubtotal } from '../../slices/cartSlice';
import {
  clearCheckoutFeedback,
  placeOrder,
  selectCheckoutError,
  selectCheckoutSubmitting,
} from '../../slices/checkoutSlice';
import { toCheckoutItems } from '../../types/checkout';
import {
  type CheckoutFormErrors,
  type CheckoutFormValues,
  type PaymentMethod,
  formatCardCvcInput,
  formatCardExpiryInput,
  formatCardNumberInput,
  validateCheckout,
} from './validation';
import './styles.css';

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export default function CheckoutPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, checkingSession } = useAppSelector((state) => state.auth);
  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartSubtotal);
  const submitting = useAppSelector(selectCheckoutSubmitting);
  const checkoutError = useAppSelector(selectCheckoutError);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [showErrors, setShowErrors] = useState(false);
  const [errors, setErrors] = useState<CheckoutFormErrors>({});
  const [formValues, setFormValues] = useState<CheckoutFormValues>({
    fullName: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
    paypalEmail: '',
  });

  const setFieldValue = (field: keyof CheckoutFormValues, value: string) => {
    const nextValues = { ...formValues, [field]: value };
    setFormValues(nextValues);
    dispatch(clearCheckoutFeedback());

    if (showErrors) {
      setErrors(validateCheckout(nextValues, paymentMethod));
    }
  };

  const changePaymentMethod = (method: PaymentMethod) => {
    setPaymentMethod(method);
    dispatch(clearCheckoutFeedback());

    if (showErrors) {
      setErrors(validateCheckout(formValues, method));
    }
  };

  if (!checkingSession && !isAuthenticated) {
    return (
      <section className="checkout-page" data-testid="checkout-page">
        <h1 id="checkout-title">Checkout</h1>
        <div className="checkout-empty" id="checkout-auth-required">
          <AuthRequiredNotice message="You need to" suffix="before checking out." />
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="checkout-page" data-testid="checkout-page">
        <h1 id="checkout-title">Checkout</h1>
        <div className="checkout-empty" id="checkout-empty">
          <p>Your cart is empty, so there is nothing to check out yet.</p>
          <p>
            <Link to="/products">Browse products</Link> to add items first.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="checkout-page" data-testid="checkout-page">
      <h1 id="checkout-title">Checkout</h1>
      <p className="checkout-intro">Frontend checkout flow only for now. Payment and order APIs will be added later.</p>
      {checkoutError && (
        <div className="message error" id="checkout-error" role="alert">
          {checkoutError}
        </div>
      )}

      <div className="checkout-grid">
        <form
          className="checkout-form"
          id="checkout-form"
          onSubmit={async (event) => {
            event.preventDefault();
            const nextErrors = validateCheckout(formValues, paymentMethod);
            setShowErrors(true);
            setErrors(nextErrors);

            if (Object.keys(nextErrors).length > 0) {
              return;
            }

            const payload = {
              shipping: {
                fullName: formValues.fullName.trim(),
                email: formValues.email.trim(),
                address: formValues.address.trim(),
                city: formValues.city.trim(),
                postalCode: formValues.postalCode.trim(),
                country: formValues.country.trim(),
              },
              payment:
                paymentMethod === 'card'
                  ? {
                      method: 'card' as const,
                      cardNumber: formValues.cardNumber.replace(/\s+/g, ''),
                      cardExpiry: formValues.cardExpiry.trim(),
                      cardCvc: formValues.cardCvc.trim(),
                    }
                  : {
                      method: 'paypal' as const,
                      paypalEmail: formValues.paypalEmail.trim(),
                    },
              items: toCheckoutItems(items),
              subtotal,
              currency: 'USD' as const,
            };

            try {
              const checkoutResponse = await dispatch(placeOrder(payload)).unwrap();
              await dispatch(clearCartServer()).unwrap();
              setShowErrors(false);
              setErrors({});
              setFormValues({
                fullName: '',
                email: '',
                address: '',
                city: '',
                postalCode: '',
                country: '',
                cardNumber: '',
                cardExpiry: '',
                cardCvc: '',
                paypalEmail: '',
              });
              navigate('/checkout/success', {
                replace: true,
                state: {
                  orderId: checkoutResponse.orderId,
                  message: checkoutResponse.message,
                },
              });
            } catch {
              // Checkout and cart errors are handled by their slices.
            }
          }}
          noValidate
        >
          <h2>Shipping details</h2>
          <label htmlFor="checkout-full-name">Full name</label>
          <input
            id="checkout-full-name"
            name="fullName"
            type="text"
            autoComplete="name"
            value={formValues.fullName}
            onChange={(event) => setFieldValue('fullName', event.target.value)}
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? 'checkout-full-name-error' : undefined}
            className={errors.fullName ? 'checkout-input-error' : undefined}
          />
          {errors.fullName && (
            <p className="error checkout-field-error" id="checkout-full-name-error">
              {errors.fullName}
            </p>
          )}

          <label htmlFor="checkout-email">Email</label>
          <input
            id="checkout-email"
            name="email"
            type="email"
            autoComplete="email"
            value={formValues.email}
            onChange={(event) => setFieldValue('email', event.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'checkout-email-error' : undefined}
            className={errors.email ? 'checkout-input-error' : undefined}
          />
          {errors.email && (
            <p className="error checkout-field-error" id="checkout-email-error">
              {errors.email}
            </p>
          )}

          <label htmlFor="checkout-address">Street address</label>
          <input
            id="checkout-address"
            name="address"
            type="text"
            autoComplete="street-address"
            value={formValues.address}
            onChange={(event) => setFieldValue('address', event.target.value)}
            aria-invalid={Boolean(errors.address)}
            aria-describedby={errors.address ? 'checkout-address-error' : undefined}
            className={errors.address ? 'checkout-input-error' : undefined}
          />
          {errors.address && (
            <p className="error checkout-field-error" id="checkout-address-error">
              {errors.address}
            </p>
          )}

          <div className="checkout-row">
            <div>
              <label htmlFor="checkout-city">City</label>
              <input
                id="checkout-city"
                name="city"
                type="text"
                autoComplete="address-level2"
                value={formValues.city}
                onChange={(event) => setFieldValue('city', event.target.value)}
                aria-invalid={Boolean(errors.city)}
                aria-describedby={errors.city ? 'checkout-city-error' : undefined}
                className={errors.city ? 'checkout-input-error' : undefined}
              />
              {errors.city && (
                <p className="error checkout-field-error" id="checkout-city-error">
                  {errors.city}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="checkout-postal">Postal code</label>
              <input
                id="checkout-postal"
                name="postalCode"
                type="text"
                autoComplete="postal-code"
                value={formValues.postalCode}
                onChange={(event) => setFieldValue('postalCode', event.target.value)}
                aria-invalid={Boolean(errors.postalCode)}
                aria-describedby={errors.postalCode ? 'checkout-postal-error' : undefined}
                className={errors.postalCode ? 'checkout-input-error' : undefined}
              />
              {errors.postalCode && (
                <p className="error checkout-field-error" id="checkout-postal-error">
                  {errors.postalCode}
                </p>
              )}
            </div>
          </div>

          <label htmlFor="checkout-country">Country</label>
          <input
            id="checkout-country"
            name="country"
            type="text"
            autoComplete="country-name"
            value={formValues.country}
            onChange={(event) => setFieldValue('country', event.target.value)}
            aria-invalid={Boolean(errors.country)}
            aria-describedby={errors.country ? 'checkout-country-error' : undefined}
            className={errors.country ? 'checkout-input-error' : undefined}
          />
          {errors.country && (
            <p className="error checkout-field-error" id="checkout-country-error">
              {errors.country}
            </p>
          )}

          <h2 className="payment-title">Payment method</h2>
          <fieldset className="checkout-payment-options">
            <label className="checkout-payment-option" htmlFor="checkout-pay-card">
              <input
                id="checkout-pay-card"
                type="radio"
                name="paymentMethod"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={() => changePaymentMethod('card')}
              />
              Credit or debit card
            </label>
            <label className="checkout-payment-option" htmlFor="checkout-pay-paypal">
              <input
                id="checkout-pay-paypal"
                type="radio"
                name="paymentMethod"
                value="paypal"
                checked={paymentMethod === 'paypal'}
                onChange={() => changePaymentMethod('paypal')}
              />
              PayPal
            </label>
          </fieldset>

          {paymentMethod === 'card' && (
            <div className="checkout-payment-panel" id="checkout-card-fields">
              <label htmlFor="checkout-card-number">Card number</label>
              <input
                id="checkout-card-number"
                name="cardNumber"
                type="text"
                inputMode="numeric"
                autoComplete="cc-number"
                placeholder="1234 5678 9012 3456"
                value={formValues.cardNumber}
                onChange={(event) => setFieldValue('cardNumber', formatCardNumberInput(event.target.value))}
                maxLength={23}
                aria-invalid={Boolean(errors.cardNumber)}
                aria-describedby={errors.cardNumber ? 'checkout-card-number-error' : undefined}
                className={errors.cardNumber ? 'checkout-input-error' : undefined}
              />
              {errors.cardNumber && (
                <p className="error checkout-field-error" id="checkout-card-number-error">
                  {errors.cardNumber}
                </p>
              )}
              <div className="checkout-row">
                <div>
                  <label htmlFor="checkout-card-expiry">Expiry</label>
                  <input
                    id="checkout-card-expiry"
                    name="cardExpiry"
                    type="text"
                    autoComplete="cc-exp"
                    placeholder="MM/YY"
                    value={formValues.cardExpiry}
                    onChange={(event) => setFieldValue('cardExpiry', formatCardExpiryInput(event.target.value))}
                    maxLength={5}
                    aria-invalid={Boolean(errors.cardExpiry)}
                    aria-describedby={errors.cardExpiry ? 'checkout-card-expiry-error' : undefined}
                    className={errors.cardExpiry ? 'checkout-input-error' : undefined}
                  />
                  {errors.cardExpiry && (
                    <p className="error checkout-field-error" id="checkout-card-expiry-error">
                      {errors.cardExpiry}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="checkout-card-cvc">CVC</label>
                  <input
                    id="checkout-card-cvc"
                    name="cardCvc"
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    placeholder="123"
                    value={formValues.cardCvc}
                    onChange={(event) => setFieldValue('cardCvc', formatCardCvcInput(event.target.value))}
                    maxLength={4}
                    aria-invalid={Boolean(errors.cardCvc)}
                    aria-describedby={errors.cardCvc ? 'checkout-card-cvc-error' : undefined}
                    className={errors.cardCvc ? 'checkout-input-error' : undefined}
                  />
                  {errors.cardCvc && (
                    <p className="error checkout-field-error" id="checkout-card-cvc-error">
                      {errors.cardCvc}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'paypal' && (
            <div className="checkout-payment-panel" id="checkout-paypal-fields">
              <label htmlFor="checkout-paypal-email">PayPal email</label>
              <input
                id="checkout-paypal-email"
                name="paypalEmail"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                value={formValues.paypalEmail}
                onChange={(event) => setFieldValue('paypalEmail', event.target.value)}
                aria-invalid={Boolean(errors.paypalEmail)}
                aria-describedby={errors.paypalEmail ? 'checkout-paypal-email-error' : undefined}
                className={errors.paypalEmail ? 'checkout-input-error' : undefined}
              />
              {errors.paypalEmail && (
                <p className="error checkout-field-error" id="checkout-paypal-email-error">
                  {errors.paypalEmail}
                </p>
              )}
            </div>
          )}

          <button type="submit" id="checkout-place-order" disabled={submitting}>
            {submitting ? (
              <>
                <LoadingSpinner size="sm" className="button-spinner" /> Processing...
              </>
            ) : (
              'Place order'
            )}
          </button>
        </form>

        <aside className="checkout-summary" aria-label="Order summary">
          <h2>Order summary</h2>
          <div className="checkout-summary-list">
            {items.map((item) => (
              <div key={item.product.id} className="checkout-summary-item">
                <p>
                  {item.product.name} x {item.quantity}
                </p>
                <p>{formatPrice(item.product.price * item.quantity)}</p>
              </div>
            ))}
          </div>
          <p className="checkout-subtotal">
            Subtotal: <strong id="checkout-subtotal">{formatPrice(subtotal)}</strong>
          </p>
          <p className="checkout-meta">
            Taxes, shipping, and backend payment processing will be added in the next phase.
          </p>
        </aside>
      </div>
    </section>
  );
}
