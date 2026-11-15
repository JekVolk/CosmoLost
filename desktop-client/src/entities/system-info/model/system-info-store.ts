import { create } from 'zustand';
import type { SystemInfoModel } from './types';

interface SystemInfoState {
  cachedMetrics: SystemInfoModel | null;
  lastSync: string | null;
  setCachedMetrics: (metrics: SystemInfoModel) => void;
  reset: () => void;
}

export const useSystemInfoStore = create<SystemInfoState>((set) => ({
  cachedMetrics: null,
  lastSync: null,
  setCachedMetrics: (metrics) =>
    set({
      cachedMetrics: metrics,
      lastSync: new Date().toISOString(),
    }),
  reset: () => set({ cachedMetrics: null, lastSync: null }),
}));
