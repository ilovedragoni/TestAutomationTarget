import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import LoadingSpinner from '../../components/LoadingSpinner';
import { clearSignUpFeedback, signUp } from '../../slices/signupSlice';
import './styles.css';

export default function SignUp() {
  const dispatch = useAppDispatch();
  const { loading, error, message, registeredEmail } = useAppSelector((state) => state.signup);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const passwordsMatch = password === confirmPassword;

  useEffect(() => {
    if (message || error) {
      const timeout = window.setTimeout(() => {
        dispatch(clearSignUpFeedback());
      }, 4000);

      return () => window.clearTimeout(timeout);
    }

    return undefined;
  }, [dispatch, message, error]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!passwordsMatch) {
      return;
    }
    void dispatch(
      signUp({
        name: name.trim(),
        email: email.trim(),
        password,
      }),
    );
  };

  if (isAuthenticated) {
    return <Navigate to="/profile" replace />;
  }

  return (
    <section className="signup-page" data-testid="signup-page">
      <div className="signup-card">
        <h1 id="signup-title">Create account</h1>
        <p className="signup-intro">Set up your account to track orders and save shopping preferences.</p>

        {message && (
          <div className="message success" id="signup-message" role="alert">
            {message}
          </div>
        )}
        {error && (
          <div className="message error" id="signup-error" role="alert">
            {error}
          </div>
        )}
        {registeredEmail && (
          <p className="signup-meta" id="signup-user">
            Registered as <strong>{registeredEmail}</strong>.
          </p>
        )}

        <form className="signup-form" onSubmit={handleSubmit} id="signup-form">
          <label htmlFor="signup-name">Full name</label>
          <input
            id="signup-name"
            name="name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Jane Doe"
            required
          />

          <label htmlFor="signup-email">Email</label>
          <input
            id="signup-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
          />

          <label htmlFor="signup-password">Password</label>
          <input
            id="signup-password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Create a password"
            required
          />

          <label htmlFor="signup-confirm-password">Confirm password</label>
          <input
            id="signup-confirm-password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Repeat your password"
            required
          />

          {!passwordsMatch && (
            <p className="error" id="signup-password-error">
              Passwords do not match.
            </p>
          )}

          <button type="submit" id="signup-submit" disabled={!passwordsMatch || loading}>
            {loading ? (
              <>
                <LoadingSpinner size="sm" className="button-spinner" />
                <span className="sr-only">Creating account</span>
              </>
            ) : (
              'Sign up'
            )}
          </button>
        </form>

        <p className="signup-meta">
          Already have an account? <Link to="/signin">Sign in</Link>
        </p>
      </div>
    </section>
  );
}
