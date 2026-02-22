import { useEffect, useRef, useState } from 'react';

import { useAppDispatch, useAppSelector } from '../app/hooks';
import { hydrateCart, loadServerCart, selectCartItems, syncCartToServer } from '../slices/cartSlice';
import { loadCartFromStorage, saveCartToStorage } from '../utils/cartStorage';

export default function CartSync() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, checkingSession } = useAppSelector((state) => state.auth);
  const cartItems = useAppSelector(selectCartItems);
  const skipNextCartSync = useRef(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    dispatch(hydrateCart(loadCartFromStorage()));
    setIsHydrated(true);
  }, [dispatch]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    saveCartToStorage(cartItems);
  }, [cartItems, isHydrated]);

  useEffect(() => {
    if (!isAuthenticated || checkingSession) {
      return;
    }

    skipNextCartSync.current = true;
    void dispatch(loadServerCart());
  }, [dispatch, isAuthenticated, checkingSession]);

  useEffect(() => {
    if (!isAuthenticated || checkingSession) {
      return;
    }

    if (skipNextCartSync.current) {
      skipNextCartSync.current = false;
      return;
    }

    void dispatch(syncCartToServer(cartItems));
  }, [dispatch, cartItems, isAuthenticated, checkingSession]);

  return null;
}
