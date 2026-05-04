import { expect, test } from '../fixtures/api.fixture';

test('auth: sign in fails with wrong password', async ({ authApi, testUser }) => {
  await authApi.postSignUp(testUser);

  const res = await authApi.postSignInExpectStatus(
    {
      email: testUser.email,
      password: 'wrong-password',
      rememberMe: false,
    },
    401,
  );

  const body = await res.json();
  expect(typeof body.message).toBe('string');
});

test('auth: signup does not create an authenticated session', async ({ authApi, testUser }) => {
  await authApi.postSignUp(testUser);
  const me = await authApi.getMe(401);
  expect(me.status()).toBe(401);
});
