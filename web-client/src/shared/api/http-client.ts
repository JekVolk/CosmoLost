import { ENV } from '../config/env';

class HttpClient {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('cosmo_access_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async get<T>(endpoint: string): Promise<T> {
    const res = await fetch(`${ENV.API_URL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return res.json() as Promise<T>;
  }

  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    const res = await fetch(`${ENV.API_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return res.json() as Promise<T>;
  }
}

export const httpClient = new HttpClient();
