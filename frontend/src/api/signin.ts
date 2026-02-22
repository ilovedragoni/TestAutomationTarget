import type { SignInRequest, SignInResponse } from '../types/auth';

const API_BASE = '/api/auth';

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

export async function signIn(payload: SignInRequest): Promise<SignInResponse> {
  const res = await fetch(`${API_BASE}/signin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const message = await getErrorMessage(res, 'Failed to sign in');
    throw new Error(message);
  }

  return res.json();
}

export async function fetchSession(): Promise<SignInResponse> {
  const res = await fetch(`${API_BASE}/me`);
  if (!res.ok) {
    const message = await getErrorMessage(res, 'Not authenticated');
    throw new Error(message);
  }

  return res.json();
}

export async function logout(): Promise<void> {
  const res = await fetch(`${API_BASE}/logout`, {
    method: 'POST',
  });

  if (!res.ok) {
    const message = await getErrorMessage(res, 'Failed to sign out');
    throw new Error(message);
  }
}
