import type { APIRequestContext, APIResponse } from '@playwright/test';
import { expect } from '@playwright/test';
import { expectOk } from '../utils/helpers';

const CART_ENDPOINT = '/api/cart';

export class CartApi {
  constructor(private readonly request: APIRequestContext) {}

  async putCart(productId: number, quantity: number): Promise<void> {
    const res = await this.request.put(CART_ENDPOINT, {
      data: [{ productId, quantity }],
    });
    await expectOk(res, `PUT ${CART_ENDPOINT}`);
    const body = await res.json();
    expect(body.items.length).toBe(1);
    expect(body.items[0].quantity).toBe(quantity);
  }

  async getCartShouldBeEmpty(): Promise<void> {
    const res = await this.request.get(CART_ENDPOINT);
    await expectOk(res, `GET ${CART_ENDPOINT}`);
    const body = await res.json();
    expect(body.items.length).toBe(0);
  }

  async getCartExpectStatus(expectedStatus: number): Promise<APIResponse> {
    const res = await this.request.get(CART_ENDPOINT);
    expect(res.status()).toBe(expectedStatus);
    return res;
  }

  async putCartExpectStatus(items: Array<{ productId: number; quantity: number }>, expectedStatus: number): Promise<APIResponse> {
    const res = await this.request.put(CART_ENDPOINT, { data: items });
    expect(res.status()).toBe(expectedStatus);
    return res;
  }
}
