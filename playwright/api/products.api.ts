import type { APIRequestContext } from '@playwright/test';
import { expect } from '@playwright/test';
import { expectOk } from '../utils/helpers';

const PRODUCTS_ENDPOINT = '/api/products';

export interface ProductItem {
  id: number;
  price: number | string;
}

export class ProductsApi {
  constructor(private readonly request: APIRequestContext) {}

  async getFirstProduct(): Promise<ProductItem> {
    const res = await this.request.get(`${PRODUCTS_ENDPOINT}?page=0&size=1`);
    await expectOk(res, `GET ${PRODUCTS_ENDPOINT}`);
    const body = (await res.json()) as { items: ProductItem[] };
    expect(body.items.length).toBeGreaterThan(0);
    return body.items[0];
  }
}
