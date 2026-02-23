import type { OrderSummary } from '../types/order';

const API_BASE = '/api/orders';

async function getErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const data = await res.json();
    if (typeof data?.message === 'string' && data.message.trim()) {
      return data.message;
    }
  } catch {
    // Ignore parse failures and use fallback.
  }

  return fallback;
}

export async function fetchOrders(): Promise<OrderSummary[]> {
  const res = await fetch(API_BASE);
  if (!res.ok) {
    const message = await getErrorMessage(res, 'Failed to load orders');
    throw new Error(message);
  }
  return res.json();
}
