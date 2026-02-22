import { Link } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  clearCart,
  decrementQuantity,
  removeFromCart,
  selectCartItems,
  selectCartSubtotal,
  addToCart,
} from '../slices/cartSlice';

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export default function CartPage() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartSubtotal);

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
                  <div className="cart-qty-controls" aria-label={`Quantity controls for ${item.product.name}`}>
                    <button type="button" id={`cart-minus-${item.product.id}`} onClick={() => dispatch(decrementQuantity(item.product.id))}>
                      -
                    </button>
                    <span id={`cart-qty-${item.product.id}`}>{item.quantity}</span>
                    <button type="button" id={`cart-plus-${item.product.id}`} onClick={() => dispatch(addToCart(item.product))}>
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    id={`cart-remove-${item.product.id}`}
                    className="cart-remove"
                    onClick={() => dispatch(removeFromCart(item.product.id))}
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
              <button type="button" id="cart-clear" onClick={() => dispatch(clearCart())}>
                Clear cart
              </button>
              <button type="button" id="cart-checkout" disabled>
                Checkout (Coming soon)
              </button>
            </div>
          </section>
        </>
      )}
    </section>
  );
}
