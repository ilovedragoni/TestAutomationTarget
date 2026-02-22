import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { useEffect } from 'react';

import { useAppDispatch } from './app/hooks';
import { store } from './app/store';
import CartPage from './components/CartPage';
import CartSync from './components/CartSync';
import CategoryBar from './components/CategoryBar';
import Contact from './components/Contact';
import Home from './components/Home';
import Profile from './components/Profile';
import ProductList from './components/ProductList';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import TopBar from './components/TopBar';
import { restoreSession } from './slices/authSlice';

import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

const root = ReactDOM.createRoot(rootElement);

function AppContent() {
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
          <Route path="/contact" element={<Contact />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
    </div>
  );
}

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
);
