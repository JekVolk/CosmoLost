import { type SystemInfo, tauriCommands } from '@/shared/api/tauri';

export const systemInfoApi = {
  fetchRawSystemInfo: async (): Promise<SystemInfo> => {
    return await tauriCommands.getSystemInfo();
  },
};
