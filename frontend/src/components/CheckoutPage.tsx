import { Link } from 'react-router-dom';
import { useState } from 'react';

import { useAppSelector } from '../app/hooks';
import { selectCartItems, selectCartSubtotal } from '../slices/cartSlice';

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export default function CheckoutPage() {
  const { isAuthenticated, checkingSession } = useAppSelector((state) => state.auth);
  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartSubtotal);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');

  if (!checkingSession && !isAuthenticated) {
    return (
      <section className="checkout-page" data-testid="checkout-page">
        <h1 id="checkout-title">Checkout</h1>
        <div className="checkout-empty" id="checkout-auth-required">
          <p>You need to sign in before checking out.</p>
          <p>
            <Link to="/signin">Go to sign in</Link>
          </p>
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

      {orderPlaced && (
        <div className="message success" id="checkout-success" role="alert">
          Order placed in demo mode. Backend checkout integration is pending.
        </div>
      )}

      <div className="checkout-grid">
        <form
          className="checkout-form"
          id="checkout-form"
          onSubmit={(event) => {
            event.preventDefault();
            setOrderPlaced(true);
          }}
        >
          <h2>Shipping details</h2>
          <label htmlFor="checkout-full-name">Full name</label>
          <input id="checkout-full-name" name="fullName" type="text" autoComplete="name" required />

          <label htmlFor="checkout-email">Email</label>
          <input id="checkout-email" name="email" type="email" autoComplete="email" required />

          <label htmlFor="checkout-address">Street address</label>
          <input id="checkout-address" name="address" type="text" autoComplete="street-address" required />

          <div className="checkout-row">
            <div>
              <label htmlFor="checkout-city">City</label>
              <input id="checkout-city" name="city" type="text" autoComplete="address-level2" required />
            </div>
            <div>
              <label htmlFor="checkout-postal">Postal code</label>
              <input id="checkout-postal" name="postalCode" type="text" autoComplete="postal-code" required />
            </div>
          </div>

          <label htmlFor="checkout-country">Country</label>
          <input id="checkout-country" name="country" type="text" autoComplete="country-name" required />

          <h2 className="payment-title">Payment method</h2>
          <fieldset className="checkout-payment-options">
            <label className="checkout-payment-option" htmlFor="checkout-pay-card">
              <input
                id="checkout-pay-card"
                type="radio"
                name="paymentMethod"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={() => setPaymentMethod('card')}
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
                onChange={() => setPaymentMethod('paypal')}
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
                required
              />
              <div className="checkout-row">
                <div>
                  <label htmlFor="checkout-card-expiry">Expiry</label>
                  <input
                    id="checkout-card-expiry"
                    name="cardExpiry"
                    type="text"
                    autoComplete="cc-exp"
                    placeholder="MM/YY"
                    required
                  />
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
                    required
                  />
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
                required
              />
            </div>
          )}

          <button type="submit" id="checkout-place-order">
            Place order
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
