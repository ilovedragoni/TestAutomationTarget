import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import * as profileApi from '../../api/profile';
import { setAuthUser, signOutLocal } from '../../slices/authSlice';

export default function AccountSection() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [saving, setSaving] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [accountSuccessMessage, setAccountSuccessMessage] = useState<string | null>(null);

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState<string | null>(null);

  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const deletePhrase = 'DELETE ACCOUNT';

  useEffect(() => {
    setName(user?.name ?? '');
    setEmail(user?.email ?? '');
  }, [user?.name, user?.email]);

  const isUnchanged = name.trim() === (user?.name ?? '').trim() && email.trim().toLowerCase() === (user?.email ?? '').trim().toLowerCase();

  return (
    <div className="profile-account-grid">
      <article className="profile-card" aria-label="Profile details">
        <h2>Account details</h2>
        {accountError && (
          <div className="message error" role="alert">
            {accountError}
          </div>
        )}
        {accountSuccessMessage && (
          <div className="message success" role="status" aria-live="polite">
            {accountSuccessMessage}
          </div>
        )}

        {!isEditing ? (
          <div className="profile-account-readonly">
            <p>Email: {user?.email ?? '--'}</p>
            <p>Name: {user?.name?.trim() || '--'}</p>
            <button
              type="button"
              id="edit-profile-button"
              onClick={() => {
                setName(user?.name ?? '');
                setEmail(user?.email ?? '');
                setAccountError(null);
                setAccountSuccessMessage(null);
                setIsEditing(true);
              }}
            >
              Edit account details
            </button>
          </div>
        ) : (
          <form
            className="profile-form"
            onSubmit={async (event) => {
              event.preventDefault();
              const trimmedName = name.trim();
              const trimmedEmail = email.trim().toLowerCase();

              if (trimmedName.length < 2) {
                setAccountError('Name must be at least 2 characters.');
                setAccountSuccessMessage(null);
                return;
              }

              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
                setAccountError('Enter a valid email address.');
                setAccountSuccessMessage(null);
                return;
              }

              setSaving(true);
              setAccountError(null);
              setAccountSuccessMessage(null);

              try {
                const updatedUser = await profileApi.updateAccount({ name: trimmedName, email: trimmedEmail });
                dispatch(setAuthUser(updatedUser));
                setAccountSuccessMessage('Account details updated.');
                setIsEditing(false);
              } catch (err: unknown) {
                setAccountError(err instanceof Error ? err.message : 'Failed to update account');
              } finally {
                setSaving(false);
              }
            }}
          >
            <label htmlFor="profile-account-name">Name</label>
            <input
              id="profile-account-name"
              type="text"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setAccountError(null);
                setAccountSuccessMessage(null);
              }}
              required
            />

            <label htmlFor="profile-account-email">Email</label>
            <input
              id="profile-account-email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setAccountError(null);
                setAccountSuccessMessage(null);
              }}
              required
            />

            <div className="profile-form-actions">
              <button type="button" onClick={() => setIsEditing(false)} disabled={saving}>
                Cancel
              </button>
              <button type="submit" disabled={saving || isUnchanged}>
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </form>
        )}
      </article>

      <article className="profile-card" aria-label="Security">
        <h2>Security</h2>
        {passwordError && (
          <div className="message error" role="alert">
            {passwordError}
          </div>
        )}
        {passwordSuccessMessage && (
          <div className="message success" role="status" aria-live="polite">
            {passwordSuccessMessage}
          </div>
        )}

        {!isChangingPassword ? (
          <button
            type="button"
            id="change-password-button"
            onClick={() => {
              setCurrentPassword('');
              setNewPassword('');
              setConfirmPassword('');
              setPasswordError(null);
              setPasswordSuccessMessage(null);
              setIsChangingPassword(true);
            }}
          >
            Change password
          </button>
        ) : (
          <form
            className="profile-form"
            onSubmit={async (event) => {
              event.preventDefault();

              if (newPassword.length < 8) {
                setPasswordError('New password must be at least 8 characters.');
                setPasswordSuccessMessage(null);
                return;
              }

              if (newPassword !== confirmPassword) {
                setPasswordError('New password and confirmation do not match.');
                setPasswordSuccessMessage(null);
                return;
              }

              setPasswordSaving(true);
              setPasswordError(null);
              setPasswordSuccessMessage(null);

              try {
                const response = await profileApi.changePassword({
                  currentPassword,
                  newPassword,
                });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setPasswordSuccessMessage(response.message || 'Password updated successfully.');
                setIsChangingPassword(false);
              } catch (err: unknown) {
                setPasswordError(err instanceof Error ? err.message : 'Failed to update password');
              } finally {
                setPasswordSaving(false);
              }
            }}
          >
            <label htmlFor="profile-current-password">Current password</label>
            <input
              id="profile-current-password"
              type="password"
              value={currentPassword}
              onChange={(event) => {
                setCurrentPassword(event.target.value);
                setPasswordError(null);
                setPasswordSuccessMessage(null);
              }}
              required
            />

            <label htmlFor="profile-new-password">New password</label>
            <input
              id="profile-new-password"
              type="password"
              value={newPassword}
              onChange={(event) => {
                setNewPassword(event.target.value);
                setPasswordError(null);
                setPasswordSuccessMessage(null);
              }}
              required
            />

            <label htmlFor="profile-confirm-password">Confirm new password</label>
            <input
              id="profile-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                setPasswordError(null);
                setPasswordSuccessMessage(null);
              }}
              required
            />

            <div className="profile-form-actions">
              <button type="button" onClick={() => setIsChangingPassword(false)} disabled={passwordSaving}>
                Cancel
              </button>
              <button type="submit" disabled={passwordSaving}>
                {passwordSaving ? 'Updating...' : 'Update password'}
              </button>
            </div>
          </form>
        )}
      </article>

      <article className="profile-card profile-card-danger" aria-label="Danger zone">
        <h2>Danger zone</h2>
        {deleteError && (
          <div className="message error" role="alert">
            {deleteError}
          </div>
        )}
        {!isDeletingAccount ? (
          <>
            <p className="profile-danger-text">
              Deleting your account is permanent. Your saved profile data, cart, and order history will be removed.
            </p>
            <button
              type="button"
              id="delete-button"
              onClick={() => {
                setDeleteConfirmation('');
                setDeletePassword('');
                setDeleteError(null);
                setIsDeletingAccount(true);
              }}
            >
              Delete account
            </button>
          </>
        ) : (
          <form
            className="profile-form"
            onSubmit={async (event) => {
              event.preventDefault();

              if (deleteConfirmation !== deletePhrase) {
                setDeleteError(`Type "${deletePhrase}" to confirm.`);
                return;
              }

              setDeletingAccount(true);
              setDeleteError(null);

              try {
                await profileApi.deleteAccount({ currentPassword: deletePassword });
                dispatch(signOutLocal());
                navigate('/signin', { replace: true });
              } catch (err: unknown) {
                setDeleteError(err instanceof Error ? err.message : 'Failed to delete account');
              } finally {
                setDeletingAccount(false);
              }
            }}
          >
            <p className="profile-danger-text">
              Type <strong>{deletePhrase}</strong> and enter your current password to permanently delete your account.
            </p>
            <label htmlFor="profile-delete-confirm">Confirmation text</label>
            <input
              id="profile-delete-confirm"
              type="text"
              value={deleteConfirmation}
              onChange={(event) => {
                setDeleteConfirmation(event.target.value);
                setDeleteError(null);
              }}
              required
            />

            <label htmlFor="profile-delete-password">Current password</label>
            <input
              id="profile-delete-password"
              type="password"
              value={deletePassword}
              onChange={(event) => {
                setDeletePassword(event.target.value);
                setDeleteError(null);
              }}
              required
            />

            <div className="profile-form-actions">
              <button type="button" onClick={() => setIsDeletingAccount(false)} disabled={deletingAccount}>
                Cancel
              </button>
              <button type="submit" disabled={deletingAccount}>
                {deletingAccount ? 'Deleting...' : 'Permanently delete account'}
              </button>
            </div>
          </form>
        )}
      </article>
    </div>
  );
}
