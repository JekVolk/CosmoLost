import { APP_CONFIG } from '@/shared/config';
import axios, { type AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios';

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

export const axiosInstance: AxiosInstance = axios.create({
  adapter: 'fetch',
  baseURL: APP_CONFIG.apiBaseUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<Record<string, unknown>>) => {
    if (error.response) {
      const { status, data } = error.response;
      let message: string | undefined;

      if (typeof data === 'object' && data !== null) {
        if (typeof data.message === 'string') message = data.message;
        else if (typeof data.error === 'string') message = data.error;
        else if (typeof data.detail === 'string') message = data.detail;
        else {
          const fieldErrors = Object.entries(data)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : String(v)}`)
            .join('; ');
          if (fieldErrors) message = fieldErrors;
        }
      }

      message = message || `HTTP Error ${status}: ${error.message}`;
      return Promise.reject(
        new ApiError({
          message,
          statusCode: status,
          code: typeof data?.error === 'string' ? data.error : `HTTP_${status}`,
          details: data,
        }),
      );
    }
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(
        new ApiError({
          message: 'Запит перевищив ліміт очікування (15с)',
          statusCode: 408,
          code: 'TIMEOUT',
        }),
      );
    }
    return Promise.reject(
      new ApiError({
        message: error.message || 'Помилка мережі при зʼєднанні з сервером CosmoLost',
        statusCode: 0,
        code: 'NETWORK_ERROR',
        details: error,
      }),
    );
  },
);

export const axiosClient = {
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const res = await axiosInstance.get<T>(url, config);
    return res.data;
  },

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const res = await axiosInstance.post<T>(url, data, config);
    return res.data;
  },

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const res = await axiosInstance.put<T>(url, data, config);
    return res.data;
  },

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const res = await axiosInstance.patch<T>(url, data, config);
    return res.data;
  },

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const res = await axiosInstance.delete<T>(url, config);
    return res.data;
  },
};
