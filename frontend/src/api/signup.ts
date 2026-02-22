import type { SignUpRequest, SignUpResponse } from '../types/auth';

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

export async function signUp(payload: SignUpRequest): Promise<SignUpResponse> {
  const res = await fetch(`${API_BASE}/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const message = await getErrorMessage(res, 'Failed to sign up');
    throw new Error(message);
  }

  return res.json();
}
