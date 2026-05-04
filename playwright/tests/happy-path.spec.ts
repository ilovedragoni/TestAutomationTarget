import { expect, test } from '../fixtures/api.fixture';
import { createCheckoutPayload, createOrderExpectations } from '../data/orders.data';

test('perfect API happy path', async ({ authApi, profileApi, productsApi, cartApi, checkoutApi, ordersApi, testUser }) => {
  await test.step('Sign up and sign in', async () => {
    await authApi.postSignUp(testUser);
    const signIn = await authApi.postSignIn({
      email: testUser.email,
      password: testUser.password,
      rememberMe: true,
    });
    expect(signIn.user.email).toBe(testUser.email);
  });

  await test.step('Session is active', async () => {
    const meRes = await authApi.getMe();
    const meBody = await meRes.json();
    expect(meBody.user.email).toBe(testUser.email);
  });

  const quantity = 2;
  const product = await productsApi.getFirstProduct();
  const expected = createOrderExpectations(product, quantity);

  await test.step('Cart is updated', async () => {
    await cartApi.putCart(product.id, quantity);
  });

  await test.step('Checkout succeeds', async () => {
    const { payload } = createCheckoutPayload(testUser, product, quantity);
    const checkout = await checkoutApi.postCheckout(payload);
    expect(checkout.status).toBe('accepted');
    expect(checkout.orderId.length).toBeGreaterThan(0);
  });

  await test.step('Order and profile data persist', async () => {
    await cartApi.getCartShouldBeEmpty();

    const orders = await ordersApi.getOrders();
    expect(orders.length).toBeGreaterThan(0);
    expect(orders[0].currency).toBe(expected.currency);
    expect(orders[0].items.length).toBeGreaterThan(0);

    const addresses = await profileApi.getAddresses();
    expect(addresses.length).toBeGreaterThan(0);
    expect(addresses[0].label).toBe(expected.shippingAddressLabel);
    expect(addresses[0].default).toBe(true);

    const paymentMethods = await profileApi.getPaymentMethods();
    expect(paymentMethods.length).toBeGreaterThan(0);
    expect(paymentMethods[0].label).toBe(expected.paymentMethodLabel);
    expect(paymentMethods[0].cardLast4).toBe(expected.paymentLast4);
    expect(paymentMethods[0].default).toBe(true);
  });

  await test.step('Logout invalidates session', async () => {
    await authApi.postLogout();
    const meAfterLogout = await authApi.getMe(401);
    expect(meAfterLogout.status()).toBe(401);
  });
});
