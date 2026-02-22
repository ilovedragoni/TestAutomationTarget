import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../app/hooks';
import { clearAuthFeedback, signIn } from '../slices/authSlice';
import { mergeGuestCart, selectCartItems } from '../slices/cartSlice';
import LoadingSpinner from './LoadingSpinner';

export default function SignIn() {
  const dispatch = useAppDispatch();
  const { loading, error, message, isAuthenticated, user } = useAppSelector((state) => state.auth);
  const cartItems = useAppSelector(selectCartItems);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  useEffect(() => {
    if (message || error) {
      const timeout = window.setTimeout(() => {
        dispatch(clearAuthFeedback());
      }, 4000);

      return () => window.clearTimeout(timeout);
    }

    return undefined;
  }, [dispatch, message, error]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await dispatch(
        signIn({
          email: email.trim(),
          password,
          rememberMe,
        }),
      ).unwrap();

      if (cartItems.length > 0) {
        await dispatch(mergeGuestCart(cartItems)).unwrap();
      }
    } catch {
      // Auth and cart merge errors are surfaced by their slices.
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/profile" replace />;
  }

  return (
    <section className="signin-page" data-testid="signin-page">
      <div className="signin-card">
        <h1 id="signin-title">Sign in</h1>
        <p className="signin-intro">Continue to your account to manage orders and saved carts.</p>

        {message && (
          <div className="message success" id="signin-message" role="alert">
            {message}
          </div>
        )}
        {error && (
          <div className="message error" id="signin-error" role="alert">
            {error}
          </div>
        )}
        {isAuthenticated && user && (
          <p className="signin-meta" id="signin-user">
            Signed in as <strong>{user.email}</strong>.
          </p>
        )}

        <form className="signin-form" onSubmit={handleSubmit} id="signin-form">
          <label htmlFor="signin-email">Email</label>
          <input
            id="signin-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
          />

          <label htmlFor="signin-password">Password</label>
          <input
            id="signin-password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            required
          />

          <label className="signin-remember" htmlFor="signin-remember">
            <input
              id="signin-remember"
              name="remember"
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
            />
            Remember me
          </label>

          <button type="submit" id="signin-submit" disabled={loading}>
            {loading ? (
              <>
                <LoadingSpinner size="sm" className="button-spinner" />
                <span className="sr-only">Signing in</span>
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        <p className="signin-meta">
          No account yet? <Link to="/signup">Sign up</Link>
        </p>

        <p className="signin-meta">
          Need help? <Link to="/contact">Contact support</Link>
        </p>
      </div>
    </section>
  );
}
