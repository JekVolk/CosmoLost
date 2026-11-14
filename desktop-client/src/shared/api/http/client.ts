export interface ApiErrorPayload {
  message: string;
  statusCode: number;
  code?: string;
  details?: unknown;
}

export class ApiError extends Error {
  statusCode: number;
  code?: string;
  details?: unknown;

  constructor(payload: ApiErrorPayload) {
    super(payload.message);
    this.name = 'ApiError';
    this.statusCode = payload.statusCode;
    this.code = payload.code;
    this.details = payload.details;
  }
}

export interface HttpRequestOptions {
  params?: Record<string, string | number | undefined>;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface HttpResponse<T> {
  data: T;
  status: number;
  ok: boolean;
}

export class FetchHttpClient {
  private baseURL: string;

  constructor(baseURL = '') {
    this.baseURL = baseURL;
  }

  private buildUrl(url: string, params?: Record<string, string | number | undefined>): string {
    const full = url.startsWith('http') ? url : `${this.baseURL}${url}`;
    if (!params) return full;

    try {
      const parsed = new URL(full);
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined) {
          parsed.searchParams.set(k, String(v));
        }
      }
      return parsed.toString();
    } catch {
      return full;
    }
  }

  async get<T>(url: string, options?: HttpRequestOptions): Promise<HttpResponse<T>> {
    const targetUrl = this.buildUrl(url, options?.params);
    // Security: Default 15s timeout prevents hanging sockets / slowloris DoS
    const timeoutMs = options?.timeout !== undefined ? options.timeout : 15000;
    const signal = timeoutMs > 0 ? AbortSignal.timeout(timeoutMs) : undefined;

    const res = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...options?.headers,
      },
      signal,
    });

    if (!res.ok) {
      throw new ApiError({
        message: `HTTP ${res.status}: ${res.statusText}`,
        statusCode: res.status,
      });
    }

    try {
      const data = (await res.json()) as T;
      return { data, status: res.status, ok: res.ok };
    } catch (parseError) {
      throw new ApiError({
        message: `Failed to parse response JSON: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
        statusCode: res.status,
        code: 'PARSE_ERROR',
      });
    }
  }

  async post<T>(
    url: string,
    body?: unknown,
    options?: HttpRequestOptions,
  ): Promise<HttpResponse<T>> {
    const targetUrl = this.buildUrl(url, options?.params);
    // Security: Default 15s timeout prevents hanging sockets / slowloris DoS
    const timeoutMs = options?.timeout !== undefined ? options.timeout : 15000;
    const signal = timeoutMs > 0 ? AbortSignal.timeout(timeoutMs) : undefined;

    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...options?.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal,
    });

    if (!res.ok) {
      throw new ApiError({
        message: `HTTP ${res.status}: ${res.statusText}`,
        statusCode: res.status,
      });
    }

    try {
      const data = (await res.json()) as T;
      return { data, status: res.status, ok: res.ok };
    } catch (parseError) {
      throw new ApiError({
        message: `Failed to parse response JSON: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
        statusCode: res.status,
        code: 'PARSE_ERROR',
      });
    }
  }
}

export function createHttpClient(baseURL = ''): FetchHttpClient {
  return new FetchHttpClient(baseURL);
}

export const httpClient = createHttpClient();
