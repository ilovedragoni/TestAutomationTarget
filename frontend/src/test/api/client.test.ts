import { afterEach, describe, expect, it, vi } from 'vitest';

import { apiFetch, apiUrl } from '../../api/client';

describe('api client helpers', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('builds API urls from the configured base url', () => {
    expect(apiUrl('/api/products')).toBe('http://localhost:8080/api/products');
    expect(apiUrl('api/orders')).toBe('http://localhost:8080/api/orders');
  });

  it('uses include credentials by default', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(null, { status: 200 }));

    await apiFetch('/api/auth/me');

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:8080/api/auth/me', {
      credentials: 'include',
    });
  });

  it('keeps explicit request options when provided', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(null, { status: 200 }));

    await apiFetch('/api/cart', {
      method: 'DELETE',
      credentials: 'same-origin',
    });

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:8080/api/cart', {
      method: 'DELETE',
      credentials: 'same-origin',
    });
  });
});

