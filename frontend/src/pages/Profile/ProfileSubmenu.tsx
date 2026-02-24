import type { ProfileSection } from './types';

type ProfileSubmenuProps = {
  activeSection: ProfileSection;
  onSectionChange: (section: ProfileSection) => void;
};

const sectionOptions: Array<{ id: ProfileSection; label: string }> = [
  { id: 'orders', label: 'Orders' },
  { id: 'account', label: 'Account' },
  { id: 'addresses', label: 'Addresses' },
  { id: 'payments', label: 'Payment Methods' },
  { id: 'notifications', label: 'Notifications' },
];

export default function ProfileSubmenu({ activeSection, onSectionChange }: ProfileSubmenuProps) {
  return (
    <nav className="profile-submenu" aria-label="Profile sections">
      {sectionOptions.map((section) => (
        <button
          key={section.id}
          type="button"
          className={activeSection === section.id ? 'profile-submenu-link active' : 'profile-submenu-link'}
          onClick={() => onSectionChange(section.id)}
        >
          {section.label}
        </button>
      ))}
    </nav>
  );
}
