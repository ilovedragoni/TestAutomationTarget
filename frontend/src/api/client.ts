const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

function normalizeBaseUrl(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

const API_BASE_URL = normalizeBaseUrl(rawApiBaseUrl);

export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(apiUrl(path), {
    ...init,
    credentials: init.credentials ?? 'include',
  });
}
