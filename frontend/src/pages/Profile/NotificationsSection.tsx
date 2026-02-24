import { useState } from 'react';

export default function NotificationsSection() {
  const [notificationOptions, setNotificationOptions] = useState([
    { id: 'order-status', label: 'Email me when an order status changes.', enabled: true },
    { id: 'promotions', label: 'Email me promotional updates once per week.', enabled: false },
    { id: 'checkout-issues', label: 'Notify me about checkout issues or payment failures.', enabled: true },
  ]);

  const toggleNotification = (id: string) => {
    setNotificationOptions((prev) =>
      prev.map((option) => (option.id === id ? { ...option, enabled: !option.enabled } : option)),
    );
  };

  return (
    <article className="profile-card" aria-label="Notifications">
      <h2>Notifications</h2>
      <p className="profile-muted">This section is not connected to backend at all.</p>
      <ul className="profile-notification-list">
        {notificationOptions.map((option) => (
          <li key={option.id} className="profile-notification-item">
            <span>{option.label}</span>
            <button
              type="button"
              className={option.enabled ? 'profile-switch is-on' : 'profile-switch'}
              aria-pressed={option.enabled}
              aria-label={`${option.label} ${option.enabled ? 'on' : 'off'}`}
              onClick={() => toggleNotification(option.id)}
            >
              <span className="sr-only">{option.enabled ? 'On' : 'Off'}</span>
            </button>
          </li>
        ))}
      </ul>
    </article>
  );
}
