import { test as base } from '@playwright/test';
import { AuthApi, type SignUpPayload } from '../api/auth.api';
import { CartApi } from '../api/cart.api';
import { CheckoutApi } from '../api/checkout.api';
import { OrdersApi } from '../api/orders.api';
import { ProductsApi } from '../api/products.api';
import { ProfileApi } from '../api/profile.api';
import { createTestUser } from '../data/auth.data';

type ApiFixtures = {
  authApi: AuthApi;
  profileApi: ProfileApi;
  productsApi: ProductsApi;
  cartApi: CartApi;
  checkoutApi: CheckoutApi;
  ordersApi: OrdersApi;
  testUser: SignUpPayload;
};

export const test = base.extend<ApiFixtures>({
  authApi: async ({ request }, use) => {
    await use(new AuthApi(request));
  },
  profileApi: async ({ request }, use) => {
    await use(new ProfileApi(request));
  },
  productsApi: async ({ request }, use) => {
    await use(new ProductsApi(request));
  },
  cartApi: async ({ request }, use) => {
    await use(new CartApi(request));
  },
  checkoutApi: async ({ request }, use) => {
    await use(new CheckoutApi(request));
  },
  ordersApi: async ({ request }, use) => {
    await use(new OrdersApi(request));
  },
  testUser: async ({}, use) => {
    await use(createTestUser());
  },
});

export { expect } from '@playwright/test';
