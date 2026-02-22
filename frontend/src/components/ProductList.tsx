import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';

import { useAppDispatch, useAppSelector } from '../app/hooks';
import LoadingSpinner from './LoadingSpinner';
import { addToCart } from '../slices/cartSlice';
import {
  clearMessage,
  loadProducts,
  setSearch,
} from '../slices/productSlice';

export default function ProductList() {
  const dispatch = useAppDispatch();

  const { items, search, categoryId, loading, error, message } = useAppSelector(
    (state) => state.products,
  );

  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    void dispatch(loadProducts({ search, categoryId }));
  }, [dispatch, search, categoryId]);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    if (message || error) {
      const timeout = window.setTimeout(() => {
        dispatch(clearMessage());
      }, 4000);

      return () => window.clearTimeout(timeout);
    }

    return undefined;
  }, [message, error, dispatch]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(setSearch(searchInput.trim()));
  };

  return (
    <div data-testid="product-list-page">
      <h1 id="page-title">Products</h1>
      <p id="page-description">
        Target app for test automation. Use data-testid and ids for selectors.
      </p>

      {message && (
        <div className="message success" id="flash-message" role="alert">
          {message}
        </div>
      )}
      {error && (
        <div className="message error" id="flash-error" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSearch} id="search-form" role="search">
        <div id="search-bar">
          <input
            type="search"
            name="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by name"
            id="search-input"
            aria-label="Search products"
          />

          <button type="submit" id="search-submit">
            Search
          </button>
        </div>
      </form>

      {loading && (
        <div id="loading" className="loading-wrap" role="status" aria-live="polite">
          <LoadingSpinner size="lg" />
          <span className="sr-only">Loading products</span>
        </div>
      )}

      <section className="products-grid" id="products-grid" aria-label="Product catalog">
        {items.map((product) => (
          <article key={product.id} className="product-card" data-testid={`product-row-${product.id}`}>
            <div className="product-card-head">
              <h2>{product.name}</h2>
              <p className="product-price">${product.price.toFixed(2)}</p>
            </div>
            <p className="product-description">
              {product.description?.trim() ? product.description : 'No description available.'}
            </p>
            <p className="product-category">Category: {product.category?.name ?? '--'}</p>
            <button
              type="button"
              onClick={() => dispatch(addToCart(product))}
              id={`buy-${product.id}`}
              className="product-buy"
            >
              Add to cart
            </button>
          </article>
        ))}

        {items.length === 0 && !loading && (
          <div className="products-empty" id="empty-state" role="status">
            Oooops! We're experiencing some technical difficulties. We apologize for the inconvenience.
          </div>
        )}
      </section>
    </div>
  );
}
