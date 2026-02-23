import { Link, Navigate, useLocation } from 'react-router-dom';

import { useAppSelector } from '../../app/hooks';
import { selectCheckoutLastOrderId, selectCheckoutSuccessMessage } from '../../slices/checkoutSlice';
import './styles.css';

interface CheckoutSuccessLocationState {
  orderId?: string;
  message?: string;
}

export default function CheckoutSuccess() {
  const { isAuthenticated, checkingSession } = useAppSelector((state) => state.auth);
  const fallbackOrderId = useAppSelector(selectCheckoutLastOrderId);
  const fallbackMessage = useAppSelector(selectCheckoutSuccessMessage);
  const location = useLocation();
  const locationState = (location.state as CheckoutSuccessLocationState | null) ?? null;

  if (!checkingSession && !isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  const orderId = locationState?.orderId ?? fallbackOrderId;
  const message = locationState?.message ?? fallbackMessage ?? 'Order placed successfully.';

  return (
    <section className="checkout-success-page" data-testid="checkout-success-page">
      <h1 id="checkout-success-title">Order Confirmed</h1>
      <p className="checkout-success-intro">{message}</p>
      {orderId && (
        <p className="checkout-success-order">
          Order ID: <strong>{orderId}</strong>
        </p>
      )}
      <div className="checkout-success-actions">
        <Link to="/profile" className="checkout-success-btn checkout-success-btn-primary">
          View orders
        </Link>
        <Link to="/products" className="checkout-success-btn checkout-success-btn-secondary">
          Continue shopping
        </Link>
      </div>
    </section>
  );
}
