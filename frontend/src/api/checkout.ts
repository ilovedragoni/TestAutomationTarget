import type { CheckoutRequest, CheckoutResponse } from '../types/checkout';

const API_BASE = '/api/checkout';

async function getErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const data = await res.json();
    if (typeof data?.message === 'string' && data.message.trim()) {
      return data.message;
    }
  } catch {
    // Ignore parse errors and use fallback.
  }

  return fallback;
}

function buildMockResponse(): CheckoutResponse {
  return {
    orderId: `DEMO-${Date.now()}`,
    status: 'accepted',
    message: 'Order placed in demo mode. Backend checkout integration is pending.',
  };
}

export async function submitCheckout(payload: CheckoutRequest): Promise<CheckoutResponse> {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (res.status === 404 || res.status === 501) {
    return buildMockResponse();
  }

  if (!res.ok) {
    const message = await getErrorMessage(res, 'Failed to place order');
    throw new Error(message);
  }

  return res.json() as Promise<CheckoutResponse>;
}
