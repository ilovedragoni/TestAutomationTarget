import { expect, type APIResponse } from '@playwright/test';

export async function expectOk(res: APIResponse, operation: string): Promise<void> {
  const details = `${operation} failed with ${res.status()} ${res.statusText()}`;
  expect(res.ok(), details).toBeTruthy();
}

export function uniqueEmail(prefix: string): string {
  return `${prefix}.${Date.now()}@example.com`;
}

export function toMoney(value: number): number {
  return Number(value.toFixed(2));
}
