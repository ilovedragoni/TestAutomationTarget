import { Link, Navigate } from 'react-router-dom';
import { useState } from 'react';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import LoadingSpinner from '../../components/LoadingSpinner';
import { performSignOut } from '../../slices/authSlice';
import { selectProfileError } from '../../slices/profileSlice';
import AccountSection from './AccountSection';
import AddressesSection from './AddressesSection';
import NotificationsSection from './NotificationsSection';
import OrdersSection from './OrdersSection';
import PaymentsSection from './PaymentsSection';
import ProfileSubmenu from './ProfileSubmenu';
import type { ProfileSection } from './types';
import './styles.css';

export default function Profile() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, checkingSession, signingOut } = useAppSelector((state) => state.auth);
  const profileError = useAppSelector(selectProfileError);
  const [activeSection, setActiveSection] = useState<ProfileSection>('orders');

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
      <p className="profile-intro">Manage account settings, saved checkout preferences, and order history.</p>

      {profileError && (
        <div className="message error" role="alert">
          {profileError}
        </div>
      )}

      <div className="profile-layout">
        <ProfileSubmenu activeSection={activeSection} onSectionChange={setActiveSection} />

        <div className="profile-content">
          {activeSection === 'orders' && <OrdersSection />}
          {activeSection === 'account' && <AccountSection />}
          {activeSection === 'addresses' && <AddressesSection />}
          {activeSection === 'payments' && <PaymentsSection />}
          {activeSection === 'notifications' && <NotificationsSection />}
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
