import { Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';

import { useAppDispatch } from './app/hooks';
import CartSync from './components/CartSync';
import CategoryBar from './components/CategoryBar';
import TopBar from './components/TopBar';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import CheckoutSuccess from './pages/CheckoutSuccess';
import Contact from './pages/Contact';
import Home from './pages/Home';
import Profile from './pages/Profile';
import ProductList from './pages/ProductList';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import { restoreSession } from './slices/authSlice';

export default function AppShell() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    void dispatch(restoreSession());
  }, [dispatch]);

  return (
    <div className="app-shell">
      <CartSync />
      <TopBar />
      <CategoryBar />

      <main className="page-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/checkout/success" element={<CheckoutSuccess />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
    </div>
  );
}
