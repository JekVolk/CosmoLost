import { API_URL } from '@/shared/config/env';

type TokenGetter = () => string | null;

let tokenProvider: TokenGetter | null = null;

export function setAuthTokenProvider(provider: TokenGetter): void {
  tokenProvider = provider;
}

export function getAuthToken(): string | null {
  if (tokenProvider) {
    return tokenProvider();
  }
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = localStorage.getItem('cosmo-auth');
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed?.state?.token ?? null;
      }
    } catch {
      // ignore JSON parse error
    }
  }
  return null;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: init?.credentials ?? 'include',
    headers: {
      ...headers,
      ...(init?.headers as Record<string, string> | undefined),
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export const httpClient = {
  get: <T>(path: string, init?: RequestInit): Promise<T> =>
    request<T>(path, { ...init, method: 'GET' }),
  post: <T>(path: string, body?: unknown, init?: RequestInit): Promise<T> =>
    request<T>(path, {
      ...init,
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
};
