import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../slices/authSlice';
import cartReducer from '../slices/cartSlice';
import checkoutReducer from '../slices/checkoutSlice';
import ordersReducer from '../slices/orderSlice';
import productsReducer from '../slices/productSlice';
import signupReducer from '../slices/signupSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    checkout: checkoutReducer,
    orders: ordersReducer,
    products: productsReducer,
    signup: signupReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
