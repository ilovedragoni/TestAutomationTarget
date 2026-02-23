import { Link, NavLink } from 'react-router-dom';

import { useAppSelector } from '../../app/hooks';
import { selectCartCount } from '../../slices/cartSlice';
import Cart from '../icons/Cart';
import Target from '../icons/Target';

import './styles.css';

export default function TopBar() {
  const { isAuthenticated, checkingSession } = useAppSelector((state) => state.auth);
  const cartCount = useAppSelector(selectCartCount);
  const cartCountLabel = cartCount > 99 ? '99+' : String(cartCount);

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link to="/" className="topbar-left">
          <Target />
          <p className="brand">Test Automation Target</p>
        </Link>
        <nav id="main-nav" aria-label="Main navigation" className="main-nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Home
          </NavLink>
          <NavLink to="/products" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Shopping
          </NavLink>
          <NavLink to="/contact" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Contact us
          </NavLink>
          <NavLink to="/cart" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            <Cart />
            <span className="cart-count" id="cart-count">
              {cartCountLabel}
            </span>
          </NavLink>
          <NavLink
            to={isAuthenticated ? '/profile' : '/signin'}
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            {checkingSession ? 'Account' : isAuthenticated ? 'Profile' : 'Sign in'}
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
