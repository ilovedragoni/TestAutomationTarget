import { Link, Navigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../app/hooks';
import { performSignOut } from '../slices/authSlice';
import LoadingSpinner from './LoadingSpinner';

export default function Profile() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, checkingSession, signingOut } = useAppSelector((state) => state.auth);

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
    <section className="contact-page" data-testid="profile-page">
      <h1 id="contact-title">Profile</h1>
      <p className="contact-intro">You are currently signed in.</p>

      <div className="contact-grid">
        <article className="contact-card" aria-label="Profile details">
          <h2>Account</h2>
          <p>Email: {user?.email ?? '--'}</p>
          <p>Name: {user?.name?.trim() || '--'}</p>
        </article>
      </div>

      <p className="contact-back">
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
      <p className="contact-back">
        <Link to="/products">Back to shopping</Link>
      </p>
    </section>
  );
}
