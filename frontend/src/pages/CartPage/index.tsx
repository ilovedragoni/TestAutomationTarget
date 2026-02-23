import { Link } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import AuthRequiredNotice from '../../components/AuthRequiredNotice';
import {
  addToCartServer,
  clearCartServer,
  decrementQuantityServer,
  removeFromCartServer,
  selectCartItems,
  selectCartSubtotal,
  selectCartSyncing,
} from '../../slices/cartSlice';
import './styles.css';

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export default function CartPage() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, checkingSession } = useAppSelector((state) => state.auth);
  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartSubtotal);
  const syncing = useAppSelector(selectCartSyncing);

  if (!checkingSession && !isAuthenticated) {
    return (
      <section className="cart-page" data-testid="cart-page">
        <h1 id="cart-title">Shopping Cart</h1>
        <AuthRequiredNotice />
      </section>
    );
  }

  return (
    <section className="cart-page" data-testid="cart-page">
      <h1 id="cart-title">Shopping Cart</h1>
      <p className="cart-intro">Review selected items before checkout.</p>

      {items.length === 0 ? (
        <div className="cart-empty" id="cart-empty">
          <p>Your cart is currently empty.</p>
          <p>
            <Link to="/products">Browse products</Link> to add your first item.
          </p>
        </div>
      ) : (
        <>
          <div className="cart-list" role="list" aria-label="Cart items">
            {items.map((item) => (
              <article key={item.product.id} className="cart-item" role="listitem" data-testid={`cart-item-${item.product.id}`}>
                <div className="cart-item-main">
                  <h2>{item.product.name}</h2>
                  <p>{item.product.description?.trim() ? item.product.description : 'No description'}</p>
                  <p className="cart-item-meta">Category: {item.product.category?.name ?? '--'}</p>
                </div>

                <div className="cart-item-controls">
                  <p className="cart-item-price">{formatPrice(item.product.price * item.quantity)}</p>
                  <p className="cart-item-unit-price">Price per item: {formatPrice(item.product.price)}</p>
                  <div className="cart-qty-controls" aria-label={`Quantity controls for ${item.product.name}`}>
                    <button
                      type="button"
                      id={`cart-minus-${item.product.id}`}
                      onClick={() => void dispatch(decrementQuantityServer(item.product.id))}
                      disabled={syncing}
                    >
                      -
                    </button>
                    <span id={`cart-qty-${item.product.id}`}>{item.quantity}</span>
                    <button
                      type="button"
                      id={`cart-plus-${item.product.id}`}
                      onClick={() => void dispatch(addToCartServer(item.product))}
                      disabled={syncing}
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    id={`cart-remove-${item.product.id}`}
                    className="cart-remove"
                    onClick={() => void dispatch(removeFromCartServer(item.product.id))}
                    disabled={syncing}
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>

          <section className="cart-summary" aria-label="Cart summary">
            <p>
              Subtotal: <strong id="cart-subtotal">{formatPrice(subtotal)}</strong>
            </p>
            <div className="cart-summary-actions">
              <button type="button" id="cart-clear" onClick={() => void dispatch(clearCartServer())} disabled={syncing}>
                Clear cart
              </button>
              <Link to="/checkout" id="cart-checkout" className="cart-checkout-link">
                Checkout
              </Link>
            </div>
          </section>
        </>
      )}
    </section>
  );
}
