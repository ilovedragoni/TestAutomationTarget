import { expect, test } from '../fixtures/api.fixture';
import { createCheckoutPayload } from '../data/orders.data';

test('authorization: protected endpoints require auth', async ({ authApi, cartApi, checkoutApi, ordersApi, profileApi, productsApi, testUser }) => {
  const product = await productsApi.getFirstProduct();
  const { payload } = createCheckoutPayload(testUser, product, 1);

  await authApi.getMe(401);
  await cartApi.getCartExpectStatus(403);
  await ordersApi.getOrdersExpectStatus(403);
  await profileApi.getAddressesExpectStatus(403);
  await profileApi.getPaymentMethodsExpectStatus(403);
  await checkoutApi.postCheckoutExpectStatus(payload, 403);
});

test('cart: invalid quantity is rejected', async ({ authApi, cartApi, testUser }) => {
  await authApi.postSignUp(testUser);
  await authApi.postSignIn({
    email: testUser.email,
    password: testUser.password,
    rememberMe: true,
  });

  const res = await cartApi.putCartExpectStatus([{ productId: 1, quantity: 0 }], 400);
  const body = await res.text();
  expect(body.length).toBeGreaterThan(0);
});
