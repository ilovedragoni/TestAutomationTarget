import { Link, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import LoadingSpinner from '../../components/LoadingSpinner';
import { performSignOut } from '../../slices/authSlice';
import { loadOrders, selectOrders, selectOrdersError, selectOrdersLoading } from '../../slices/orderSlice';
import './styles.css';

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

export default function Profile() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, checkingSession, signingOut } = useAppSelector((state) => state.auth);
  const orders = useAppSelector(selectOrders);
  const ordersLoading = useAppSelector(selectOrdersLoading);
  const ordersError = useAppSelector(selectOrdersError);
  const [activeSection, setActiveSection] = useState<'orders' | 'account'>('orders');

  useEffect(() => {
    if (!checkingSession && isAuthenticated && activeSection === 'orders') {
      void dispatch(loadOrders());
    }
  }, [dispatch, checkingSession, isAuthenticated, activeSection]);

  if (checkingSession) {
    return (
      <div id="profile-loading" className="loading-wrap" role="status" aria-live="polite">
        <LoadingSpinner size="lg" />
        <span className="sr-only">Loading profile</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  return (
    <section className="profile-page" data-testid="profile-page">
      <h1 id="profile-title">Profile</h1>
      <p className="profile-intro">Manage your account and track your orders.</p>

      <div className="profile-layout">
        <nav className="profile-submenu" aria-label="Profile sections">
          <button
            type="button"
            className={activeSection === 'orders' ? 'profile-submenu-link active' : 'profile-submenu-link'}
            onClick={() => setActiveSection('orders')}
          >
            Orders
          </button>
          <button
            type="button"
            className={activeSection === 'account' ? 'profile-submenu-link active' : 'profile-submenu-link'}
            onClick={() => setActiveSection('account')}
          >
            Account
          </button>
        </nav>

        <div className="profile-content">
          {activeSection === 'orders' && (
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
          )}

          {activeSection === 'account' && (
            <article className="profile-card" aria-label="Profile details">
              <h2>Account details</h2>
              <p>Email: {user?.email ?? '--'}</p>
              <p>Name: {user?.name?.trim() || '--'}</p>
            </article>
          )}
        </div>
      </div>

      <p className="profile-actions">
        <button type="button" id="signout-button" onClick={() => void dispatch(performSignOut())} disabled={signingOut}>
          {signingOut ? (
            <>
              <LoadingSpinner size="sm" className="button-spinner" />
              <span className="sr-only">Signing out</span>
            </>
          ) : (
            'Sign out'
          )}
        </button>
      </p>
    </section>
  );
}
