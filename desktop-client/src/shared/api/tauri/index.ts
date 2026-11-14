import { invoke } from '@tauri-apps/api/core';
import { getCurrentWindow } from '@tauri-apps/api/window';

export interface SystemInfo {
  os_name: string;
  arch: string;
  app_version: string;
}

export interface PingResponse {
  received_at: number;
  echo: string;
  roundtrip_status: string;
}

export const tauriWindowApi = {
  minimize: async (): Promise<void> => {
    try {
      const appWindow = getCurrentWindow();
      await appWindow.minimize();
    } catch (e) {
      console.warn('Tauri window minimize error (outside desktop environment):', e);
    }
  },
  toggleMaximize: async (): Promise<void> => {
    try {
      const appWindow = getCurrentWindow();
      await appWindow.toggleMaximize();
    } catch (e) {
      console.warn('Tauri window maximize error (outside desktop environment):', e);
    }
  },
  isMaximized: async (): Promise<boolean> => {
    try {
      const appWindow = getCurrentWindow();
      return await appWindow.isMaximized();
    } catch {
      return false;
    }
  },
  close: async (): Promise<void> => {
    try {
      const appWindow = getCurrentWindow();
      await appWindow.close();
    } catch (e) {
      console.warn('Tauri window close failed, attempting destroy:', e);
      try {
        const appWindow = getCurrentWindow();
        await appWindow.destroy();
      } catch (err) {
        console.error('Tauri window close error:', err);
      }
    }
  },
};

export const tauriCommands = {
  getSystemInfo: async (): Promise<SystemInfo> => {
    try {
      return await invoke<SystemInfo>('get_system_info');
    } catch (e) {
      console.warn('Tauri invoke get_system_info fallback:', e);
      return {
        os_name: navigator.platform,
        arch: 'web',
        app_version: '0.1.0-dev',
      };
    }
  },
  ping: async (message: string): Promise<PingResponse> => {
    try {
      return await invoke<PingResponse>('ping', { message });
    } catch (e) {
      console.warn('Tauri invoke ping fallback:', e);
      return {
        received_at: Date.now(),
        echo: message,
        roundtrip_status: 'simulated',
      };
    }
  },
};
