import { useEffect, useState } from 'react';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  addAddress,
  chooseDefaultAddress,
  loadAddresses,
  removeAddress,
  selectAddresses,
  selectProfileLoadingAddresses,
} from '../../slices/profileSlice';

export default function AddressesSection() {
  const dispatch = useAppDispatch();
  const addresses = useAppSelector(selectAddresses);
  const loadingAddresses = useAppSelector(selectProfileLoadingAddresses);
  const [addressForm, setAddressForm] = useState({
    label: '',
    fullName: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    isDefault: false,
  });

  useEffect(() => {
    void dispatch(loadAddresses());
  }, [dispatch]);

  return (
    <article className="profile-card" aria-label="Saved addresses">
      <h2>Saved addresses</h2>
      <form
        className="profile-form"
        onSubmit={async (event) => {
          event.preventDefault();
          await dispatch(addAddress(addressForm));
          setAddressForm({
            label: '',
            fullName: '',
            email: '',
            address: '',
            city: '',
            postalCode: '',
            country: '',
            isDefault: false,
          });
        }}
      >
        <input
          type="text"
          placeholder="Label (Home, Work)"
          value={addressForm.label}
          onChange={(event) => setAddressForm((prev) => ({ ...prev, label: event.target.value }))}
          required
        />
        <input
          type="text"
          placeholder="Full name"
          value={addressForm.fullName}
          onChange={(event) => setAddressForm((prev) => ({ ...prev, fullName: event.target.value }))}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={addressForm.email}
          onChange={(event) => setAddressForm((prev) => ({ ...prev, email: event.target.value }))}
          required
        />
        <input
          type="text"
          placeholder="Street address"
          value={addressForm.address}
          onChange={(event) => setAddressForm((prev) => ({ ...prev, address: event.target.value }))}
          required
        />
        <div className="profile-form-row">
          <input
            type="text"
            placeholder="City"
            value={addressForm.city}
            onChange={(event) => setAddressForm((prev) => ({ ...prev, city: event.target.value }))}
            required
          />
          <input
            type="text"
            placeholder="Postal code"
            value={addressForm.postalCode}
            onChange={(event) => setAddressForm((prev) => ({ ...prev, postalCode: event.target.value }))}
            required
          />
        </div>
        <input
          type="text"
          placeholder="Country"
          value={addressForm.country}
          onChange={(event) => setAddressForm((prev) => ({ ...prev, country: event.target.value }))}
          required
        />
        <label className="profile-inline-check">
          <input
            type="checkbox"
            checked={addressForm.isDefault}
            onChange={(event) => setAddressForm((prev) => ({ ...prev, isDefault: event.target.checked }))}
          />
          Set as default
        </label>
        <button type="submit">Save address</button>
      </form>

      {loadingAddresses && (
        <div className="loading-wrap">
          <LoadingSpinner size="md" />
        </div>
      )}

      <div className="profile-list">
        {addresses.map((address) => (
          <article key={address.id} className="profile-list-card">
            <p className="profile-list-title">
              {address.label}
              {address.isDefault ? <span className="profile-default-badge">Default</span> : null}
            </p>
            <p>
              {address.fullName}, {address.address}, {address.city} {address.postalCode}, {address.country}
            </p>
            <div className="profile-list-actions">
              {!address.isDefault && (
                <button type="button" onClick={() => void dispatch(chooseDefaultAddress(address.id))}>
                  Set default
                </button>
              )}
              <button type="button" onClick={() => void dispatch(removeAddress(address.id))}>
                Remove
              </button>
            </div>
          </article>
        ))}
      </div>
    </article>
  );
}
