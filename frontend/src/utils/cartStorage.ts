import type { CartItem } from '../slices/cartSlice';

const CART_STORAGE_KEY = 'target_cart_v1';

function isValidCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const item = value as Partial<CartItem>;
  return (
    typeof item.quantity === 'number' &&
    item.quantity > 0 &&
    !!item.product &&
    typeof item.product.id === 'number' &&
    typeof item.product.name === 'string' &&
    typeof item.product.price === 'number' &&
    !!item.product.category &&
    typeof item.product.category.id === 'number' &&
    typeof item.product.category.name === 'string'
  );
}

export function loadCartFromStorage(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isValidCartItem);
  } catch {
    return [];
  }
}

export function saveCartToStorage(items: CartItem[]): void {
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore storage errors to keep cart interactions non-blocking.
  }
}
