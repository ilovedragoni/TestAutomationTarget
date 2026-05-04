import type { APIRequestContext, APIResponse } from '@playwright/test';
import { expect } from '@playwright/test';
import { expectOk } from '../utils/helpers';

const CHECKOUT_ENDPOINT = '/api/checkout';

export interface CheckoutResult {
  orderId: string;
  status: string;
}

export class CheckoutApi {
  constructor(private readonly request: APIRequestContext) {}

  async postCheckout(payload: unknown): Promise<CheckoutResult> {
    const res = await this.request.post(CHECKOUT_ENDPOINT, { data: payload });
    await expectOk(res, `POST ${CHECKOUT_ENDPOINT}`);
    return (await res.json()) as CheckoutResult;
  }

  async postCheckoutExpectStatus(payload: unknown, expectedStatus: number): Promise<APIResponse> {
    const res = await this.request.post(CHECKOUT_ENDPOINT, { data: payload });
    expect(res.status()).toBe(expectedStatus);
    return res;
  }
}
