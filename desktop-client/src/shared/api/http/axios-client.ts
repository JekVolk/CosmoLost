import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

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

export function createHttpClient(baseURL = ''): AxiosInstance {
  const instance = axios.create({
    baseURL,
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      config.headers = config.headers || {};
      config.headers['X-Client-Platform'] = 'CosmoLost-Desktop';
      config.headers['X-Request-Timestamp'] = Date.now().toString();
      return config;
    },
    (error: AxiosError) => {
      return Promise.reject(
        new ApiError({
          message: error.message || 'Request initialization failed',
          statusCode: 400,
          code: 'REQUEST_INIT_ERROR',
        }),
      );
    },
  );

  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError<{ message?: string; error?: string }>) => {
      const statusCode = error.response?.status ?? 500;
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Network error occurred';
      const code = error.code || 'API_RESPONSE_ERROR';

      return Promise.reject(
        new ApiError({
          message,
          statusCode,
          code,
          details: error.response?.data,
        }),
      );
    },
  );

  return instance;
}

export const httpClient = createHttpClient();
