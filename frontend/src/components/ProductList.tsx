import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../app/hooks';
import LoadingSpinner from './LoadingSpinner';
import { addToCartServer } from '../slices/cartSlice';
import {
  clearMessage,
  loadProducts,
  setPage,
  setSearch,
} from '../slices/productSlice';

export default function ProductList() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, checkingSession } = useAppSelector((state) => state.auth);

  const { items, search, categoryId, page, size, totalPages, totalElements, loading, error, message } = useAppSelector(
    (state) => state.products,
  );

  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    void dispatch(loadProducts({ search, categoryId, page, size }));
  }, [dispatch, search, categoryId, page, size]);

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
      {!checkingSession && !isAuthenticated && (
        <p className="not-logged-in-text">
          You need to <Link to="/signin">sign in</Link> to add items to cart.
        </p>
      )}

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

      <div className="products-meta" id="products-meta">
        <p>
          Showing page <strong>{totalPages === 0 ? 0 : page + 1}</strong> of <strong>{totalPages}</strong> (
          <strong>{totalElements}</strong> total items)
        </p>
        <div className="products-pagination" aria-label="Products pagination">
          <button
            type="button"
            id="products-prev-page"
            onClick={() => dispatch(setPage(page - 1))}
            disabled={loading || page <= 0}
          >
            Previous
          </button>
          <button
            type="button"
            id="products-next-page"
            onClick={() => dispatch(setPage(page + 1))}
            disabled={loading || page + 1 >= totalPages}
          >
            Next
          </button>
        </div>
      </div>

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
            {isAuthenticated &&
              <button
                type="button"
                onClick={() => void dispatch(addToCartServer(product))}
                id={`buy-${product.id}`}
                className="product-buy"
              >
                Add to cart
              </button>
            }
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
