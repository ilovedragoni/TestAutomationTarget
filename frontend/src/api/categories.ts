import type { Category } from '../types/product';
import { apiFetch } from './client';

const API_BASE = '/api/categories';

export async function fetchCategories(search = ''): Promise<Category[]> {
  const url = search ? `${API_BASE}?search=${encodeURIComponent(search)}` : API_BASE;

  const res = await apiFetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch categories');
  }

  return res.json();
}
