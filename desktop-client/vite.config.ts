import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-chakra': ['@chakra-ui/react', '@emotion/react'],
          'vendor-tauri': [
            '@tauri-apps/api',
            '@tauri-apps/plugin-store',
            '@tauri-apps/plugin-opener',
          ],
          'vendor-tools': [
            '@tanstack/react-query',
            'zod',
            'i18next',
            'react-i18next',
            'zustand',
          ],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: 'ws',
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      ignored: ['**/src-tauri/**'],
    },
  },
});
