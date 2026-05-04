import type { APIRequestContext, APIResponse } from '@playwright/test';
import { expect } from '@playwright/test';
import { expectOk } from '../utils/helpers';

const AUTH_ENDPOINT = '/api/auth';

export interface SignUpPayload {
  name: string;
  email: string;
  password: string;
}

export interface SignInPayload {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface SignInResponse {
  user: {
    email: string;
  };
}

export class AuthApi {
  constructor(private readonly request: APIRequestContext) {}

  async postSignUp(payload: SignUpPayload): Promise<void> {
    const res = await this.request.post(`${AUTH_ENDPOINT}/signup`, { data: payload });
    await expectOk(res, `POST ${AUTH_ENDPOINT}/signup`);
  }

  async postSignIn(payload: SignInPayload): Promise<SignInResponse> {
    const res = await this.request.post(`${AUTH_ENDPOINT}/signin`, { data: payload });
    await expectOk(res, `POST ${AUTH_ENDPOINT}/signin`);
    return (await res.json()) as SignInResponse;
  }

  async postSignInExpectStatus(payload: SignInPayload, expectedStatus: number): Promise<APIResponse> {
    const res = await this.request.post(`${AUTH_ENDPOINT}/signin`, { data: payload });
    expect(res.status()).toBe(expectedStatus);
    return res;
  }

  async getMe(expectedStatus = 200): Promise<APIResponse> {
    const res = await this.request.get(`${AUTH_ENDPOINT}/me`);
    if (expectedStatus === 200) {
      await expectOk(res, `GET ${AUTH_ENDPOINT}/me`);
    } else {
      expect(res.status()).toBe(expectedStatus);
    }
    return res;
  }

  async postLogout(): Promise<void> {
    const res = await this.request.post(`${AUTH_ENDPOINT}/logout`);
    if (res.status() === 204) {
      return;
    }
    await expectOk(res, `POST ${AUTH_ENDPOINT}/logout`);
  }
}
