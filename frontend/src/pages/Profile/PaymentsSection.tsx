import { useEffect, useState } from 'react';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  addPaymentMethod,
  chooseDefaultPaymentMethod,
  loadPaymentMethods,
  removePaymentMethod,
  selectPaymentMethods,
  selectProfileLoadingPaymentMethods,
} from '../../slices/profileSlice';
import type { SavedPaymentMethodType } from '../../types/profile';

export default function PaymentsSection() {
  const dispatch = useAppDispatch();
  const paymentMethods = useAppSelector(selectPaymentMethods);
  const loadingPaymentMethods = useAppSelector(selectProfileLoadingPaymentMethods);
  const [paymentMethodType, setPaymentMethodType] = useState<SavedPaymentMethodType>('card');
  const [paymentForm, setPaymentForm] = useState({
    label: '',
    cardNumber: '',
    cardExpiry: '',
    paypalEmail: '',
    isDefault: false,
  });

  useEffect(() => {
    void dispatch(loadPaymentMethods());
  }, [dispatch]);

  return (
    <article className="profile-card" aria-label="Saved payment methods">
      <h2>Saved payment methods</h2>
      <form
        className="profile-form"
        onSubmit={async (event) => {
          event.preventDefault();
          const sanitizedCardNumber = paymentForm.cardNumber.replace(/\D/g, '');
          const payload = {
            label: paymentForm.label,
            method: paymentMethodType,
            isDefault: paymentForm.isDefault,
            ...(paymentMethodType === 'card'
              ? { cardLast4: sanitizedCardNumber.slice(-4), cardExpiry: paymentForm.cardExpiry }
              : { paypalEmail: paymentForm.paypalEmail }),
          };
          await dispatch(addPaymentMethod(payload));
          setPaymentForm({
            label: '',
            cardNumber: '',
            cardExpiry: '',
            paypalEmail: '',
            isDefault: false,
          });
          setPaymentMethodType('card');
        }}
      >
        <input
          type="text"
          placeholder="Label (Primary card, Work PayPal)"
          value={paymentForm.label}
          onChange={(event) => setPaymentForm((prev) => ({ ...prev, label: event.target.value }))}
          required
        />
        <select value={paymentMethodType} onChange={(event) => setPaymentMethodType(event.target.value as SavedPaymentMethodType)}>
          <option value="card">Card</option>
          <option value="paypal">PayPal</option>
        </select>
        {paymentMethodType === 'card' && (
          <div className="profile-form-row">
            <input
              type="text"
              inputMode="numeric"
              placeholder="Card number"
              maxLength={19}
              value={paymentForm.cardNumber}
              onChange={(event) =>
                setPaymentForm((prev) => ({ ...prev, cardNumber: event.target.value.replace(/\D/g, '').slice(0, 19) }))
              }
              minLength={12}
              required
            />
            <input
              type="text"
              placeholder="MM/YY"
              maxLength={5}
              value={paymentForm.cardExpiry}
              onChange={(event) => setPaymentForm((prev) => ({ ...prev, cardExpiry: event.target.value }))}
              required
            />
          </div>
        )}
        {paymentMethodType === 'card' && (
          <p className="profile-muted">For security, only the last 4 digits are stored after save.</p>
        )}
        {paymentMethodType === 'paypal' && (
          <input
            type="email"
            placeholder="PayPal email"
            value={paymentForm.paypalEmail}
            onChange={(event) => setPaymentForm((prev) => ({ ...prev, paypalEmail: event.target.value }))}
            required
          />
        )}
        <label className="profile-inline-check">
          <input
            type="checkbox"
            checked={paymentForm.isDefault}
            onChange={(event) => setPaymentForm((prev) => ({ ...prev, isDefault: event.target.checked }))}
          />
          Set as default
        </label>
        <button type="submit">Save payment method</button>
      </form>

      {loadingPaymentMethods && (
        <div className="loading-wrap">
          <LoadingSpinner size="md" />
        </div>
      )}

      <div className="profile-list">
        {paymentMethods.map((paymentMethod) => (
          <article key={paymentMethod.id} className="profile-list-card">
            <p className="profile-list-title">
              {paymentMethod.label}
              {paymentMethod.isDefault ? <span className="profile-default-badge">Default</span> : null}
            </p>
            <p>
              {paymentMethod.method === 'card'
                ? `Card ending ${paymentMethod.cardLast4 ?? '----'} (${paymentMethod.cardExpiry ?? '--/--'})`
                : `PayPal: ${paymentMethod.paypalEmail ?? ''}`}
            </p>
            <div className="profile-list-actions">
              {!paymentMethod.isDefault && (
                <button type="button" onClick={() => void dispatch(chooseDefaultPaymentMethod(paymentMethod.id))}>
                  Set default
                </button>
              )}
              <button type="button" onClick={() => void dispatch(removePaymentMethod(paymentMethod.id))}>
                Remove
              </button>
            </div>
          </article>
        ))}
      </div>
    </article>
  );
}
