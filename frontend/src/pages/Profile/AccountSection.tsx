import { useAppSelector } from '../../app/hooks';

export default function AccountSection() {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <article className="profile-card" aria-label="Profile details">
      <h2>Account details</h2>
      <p>Email: {user?.email ?? '--'}</p>
      <p>Name: {user?.name?.trim() || '--'}</p>
      <p className="profile-muted">This section can later include password changes and security preferences.</p>
    </article>
  );
}
