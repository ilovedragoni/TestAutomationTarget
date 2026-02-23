import { Link } from 'react-router-dom';

import './styles.css';

interface AuthRequiredNoticeProps {
  className?: string;
  message?: string;
  suffix?: string;
}

export default function AuthRequiredNotice({
  className = 'not-logged-in-text',
  message = 'You need to',
  suffix = 'to add items to cart.',
}: AuthRequiredNoticeProps) {
  return (
    <p className={className}>
      {message} <Link to="/signin">sign in</Link> {suffix}
    </p>
  );
}
