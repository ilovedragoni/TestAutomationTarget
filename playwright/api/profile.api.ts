import type { APIRequestContext, APIResponse } from '@playwright/test';
import { expect } from '@playwright/test';
import { expectOk } from '../utils/helpers';

const PROFILE_ENDPOINT = '/api/profile';

export interface Address {
  label: string;
  default: boolean;
}

export interface PaymentMethod {
  label: string;
  cardLast4?: string;
  default: boolean;
}

export class ProfileApi {
  constructor(private readonly request: APIRequestContext) {}

  async getAddresses(): Promise<Address[]> {
    const res = await this.request.get(`${PROFILE_ENDPOINT}/addresses`);
    await expectOk(res, `GET ${PROFILE_ENDPOINT}/addresses`);
    return (await res.json()) as Address[];
  }

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const res = await this.request.get(`${PROFILE_ENDPOINT}/payment-methods`);
    await expectOk(res, `GET ${PROFILE_ENDPOINT}/payment-methods`);
    return (await res.json()) as PaymentMethod[];
  }

  async getAddressesExpectStatus(expectedStatus: number): Promise<APIResponse> {
    const res = await this.request.get(`${PROFILE_ENDPOINT}/addresses`);
    expect(res.status()).toBe(expectedStatus);
    return res;
  }

  async getPaymentMethodsExpectStatus(expectedStatus: number): Promise<APIResponse> {
    const res = await this.request.get(`${PROFILE_ENDPOINT}/payment-methods`);
    expect(res.status()).toBe(expectedStatus);
    return res;
  }
}
