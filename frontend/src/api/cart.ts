import type { CartItem } from '../slices/cartSlice';

interface CartItemPayload {
  productId: number;
  quantity: number;
}

interface CartItemResponse {
  product: CartItem['product'];
  quantity: number;
}

interface CartResponse {
  items: CartItemResponse[];
}

const API_BASE = '/api/cart';

async function getErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const data = await res.json();
    if (typeof data?.message === 'string' && data.message.trim()) {
      return data.message;
    }
  } catch {
    // Ignore parse failures and return fallback.
  }

  return fallback;
}

function toPayload(items: CartItem[]): CartItemPayload[] {
  return items.map((item) => ({
    productId: item.product.id,
    quantity: item.quantity,
  }));
}

export async function fetchCart(): Promise<CartItem[]> {
  const res = await fetch(API_BASE);
  if (!res.ok) {
    const message = await getErrorMessage(res, 'Failed to load cart');
    throw new Error(message);
  }

  const data: CartResponse = await res.json();
  return data.items;
}

export async function replaceCart(items: CartItem[]): Promise<CartItem[]> {
  const res = await fetch(API_BASE, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(toPayload(items)),
  });

  if (!res.ok) {
    const message = await getErrorMessage(res, 'Failed to sync cart');
    throw new Error(message);
  }

  const data: CartResponse = await res.json();
  return data.items;
}

export async function mergeCart(items: CartItem[]): Promise<CartItem[]> {
  const res = await fetch(`${API_BASE}/merge`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(toPayload(items)),
  });

  if (!res.ok) {
    const message = await getErrorMessage(res, 'Failed to merge cart');
    throw new Error(message);
  }

  const data: CartResponse = await res.json();
  return data.items;
}

export async function clearServerCart(): Promise<void> {
  const res = await fetch(API_BASE, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const message = await getErrorMessage(res, 'Failed to clear cart');
    throw new Error(message);
  }
}
