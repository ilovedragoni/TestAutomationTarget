import type { APIRequestContext, APIResponse } from '@playwright/test';
import { expect } from '@playwright/test';
import { expectOk } from '../utils/helpers';

const ORDERS_ENDPOINT = '/api/orders';

export interface OrderSummary {
  currency: string;
  items: unknown[];
}

export class OrdersApi {
  constructor(private readonly request: APIRequestContext) {}

  async getOrders(): Promise<OrderSummary[]> {
    const res = await this.request.get(ORDERS_ENDPOINT);
    await expectOk(res, `GET ${ORDERS_ENDPOINT}`);
    return (await res.json()) as OrderSummary[];
  }

  async getOrdersExpectStatus(expectedStatus: number): Promise<APIResponse> {
    const res = await this.request.get(ORDERS_ENDPOINT);
    expect(res.status()).toBe(expectedStatus);
    return res;
  }
}
