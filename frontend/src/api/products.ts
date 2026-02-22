import type { Product } from "../types/product";

const API_BASE = '/api/products';

export async function fetchProducts(search = '', categoryId: number | null): Promise<Product[]> {
  const params = new URLSearchParams();

  if (search) {
    params.set('search', search);
  }

  if (categoryId) {
    params.set('categoryId', categoryId.toString());
  }

  const qs = params.toString();
  const url = qs ? `${API_BASE}?${qs}` : `${API_BASE}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch products');
  }

  return res.json();
}

export async function fetchProduct(id: number): Promise<Product> {
  const res = await fetch(`${API_BASE}/${id}`);
  if (!res.ok) {
    throw new Error('Failed to fetch product');
  }

  return res.json();
}
