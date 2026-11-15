export * from './routes';

export const APP_CONFIG = {
  appName: 'CosmoLost Desktop',
  version: '0.1.0',
  apiBaseUrl:
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    'https://cosmolost.lixtar.org',
  defaultTheme: 'dark' as const,
};
