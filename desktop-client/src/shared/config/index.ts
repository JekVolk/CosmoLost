export * from './routes';

export const APP_CONFIG = {
  appName: 'CosmoLost Desktop',
  version: '0.1.0',
  apiBaseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  defaultTheme: 'dark' as const,
};
