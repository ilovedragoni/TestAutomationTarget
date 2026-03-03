import type { PropsWithChildren, ReactElement } from 'react';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

import type { RootState } from '../app/store';
import authReducer from '../slices/authSlice';
import cartReducer from '../slices/cartSlice';
import checkoutReducer from '../slices/checkoutSlice';
import ordersReducer from '../slices/orderSlice';
import productsReducer from '../slices/productSlice';
import profileReducer from '../slices/profileSlice';
import signupReducer from '../slices/signupSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  checkout: checkoutReducer,
  orders: ordersReducer,
  profile: profileReducer,
  products: productsReducer,
  signup: signupReducer,
});

export function createTestStore(preloadedState?: Partial<RootState>) {
  const defaultState = rootReducer(undefined, { type: '@@INIT' });

  return configureStore({
    reducer: rootReducer,
    preloadedState: {
      ...defaultState,
      ...preloadedState,
    },
  });
}

interface RenderWithProvidersOptions {
  preloadedState?: Partial<RootState>;
  route?: string;
}

export function renderWithProviders(
  ui: ReactElement,
  { preloadedState, route = '/' }: RenderWithProvidersOptions = {},
) {
  const store = createTestStore(preloadedState);

  function Wrapper({ children }: PropsWithChildren) {
    return (
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </Provider>
    );
  }

  return {
    store,
    ...render(ui, { wrapper: Wrapper }),
  };
}
