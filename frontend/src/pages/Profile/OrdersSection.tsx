import { useEffect } from 'react';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import LoadingSpinner from '../../components/LoadingSpinner';
import { loadOrders, selectOrders, selectOrdersError, selectOrdersLoading } from '../../slices/orderSlice';

function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(amount);
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function OrdersSection() {
  const dispatch = useAppDispatch();
  const orders = useAppSelector(selectOrders);
  const ordersLoading = useAppSelector(selectOrdersLoading);
  const ordersError = useAppSelector(selectOrdersError);

  useEffect(() => {
    void dispatch(loadOrders());
  }, [dispatch]);

  return (
    <article className="profile-card" aria-label="Order history">
      <div className="profile-card-header">
        <h2>Order history</h2>
        <button type="button" onClick={() => void dispatch(loadOrders())} disabled={ordersLoading}>
          Refresh
        </button>
      </div>

      {ordersLoading && (
        <div className="loading-wrap" role="status" aria-live="polite">
          <LoadingSpinner size="md" />
          <span className="sr-only">Loading orders</span>
        </div>
      )}

      {!ordersLoading && ordersError && <p className="error">{ordersError}</p>}

      {!ordersLoading && !ordersError && orders.length === 0 && (
        <p className="profile-empty-orders">No orders yet. Complete checkout to see them here.</p>
      )}

      {!ordersLoading && !ordersError && orders.length > 0 && (
        <div className="profile-orders-list">
          {orders.map((order) => (
            <article key={order.orderId} className="profile-order-card">
              <div className="profile-order-top">
                <p className="profile-order-id">{order.orderId}</p>
                <span className="profile-order-status">{order.status}</span>
              </div>
              <p className="profile-order-meta">
                {formatDate(order.createdAt)} | {order.items.length} item{order.items.length === 1 ? '' : 's'}
              </p>
              <div className="profile-order-items">
                {order.items.map((item) => (
                  <p key={`${order.orderId}-${item.productId}`}>
                    {item.productName} x {item.quantity} = {formatPrice(item.lineTotal, order.currency)}
                  </p>
                ))}
              </div>
              <p className="profile-order-subtotal">
                Subtotal: <strong>{formatPrice(order.subtotal, order.currency)}</strong>
              </p>
            </article>
          ))}
        </div>
      )}
    </article>
  );
}
