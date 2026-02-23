import { useEffect, useRef } from 'react';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  clearCart,
  loadServerCart,
  selectCartItems,
} from '../../slices/cartSlice';

export default function CartSync() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, checkingSession } = useAppSelector((state) => state.auth);
  const cartItems = useAppSelector(selectCartItems);
  const serverCartInitialized = useRef(false);

  useEffect(() => {
    if (checkingSession) {
      return;
    }

    if (!isAuthenticated) {
      serverCartInitialized.current = false;
      if (cartItems.length > 0) {
        dispatch(clearCart());
      }
      return;
    }

    if (serverCartInitialized.current) {
      return;
    }

    serverCartInitialized.current = true;
    void dispatch(loadServerCart());
  }, [dispatch, isAuthenticated, checkingSession, cartItems.length]);

  return null;
}
