import { tauriStorage } from '@/shared';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { DEFAULT_SETTINGS } from './defaults';
import type { AccentColor, DesktopSettings, SettingsState } from './types';

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      isHydrated: false,

      setAccentColor: (accentColor: AccentColor) =>
        set((state) => ({
          settings: { ...state.settings, accentColor },
        })),

      setAutoRefresh: (autoRefreshMetrics: boolean) =>
        set((state) => ({
          settings: { ...state.settings, autoRefreshMetrics },
        })),

      setRefreshInterval: (refreshIntervalSec: number) =>
        set((state) => ({
          settings: { ...state.settings, refreshIntervalSec },
        })),

      toggleCompactMode: () =>
        set((state) => ({
          settings: {
            ...state.settings,
            compactMode: !state.settings.compactMode,
          },
        })),

      toggleSound: () =>
        set((state) => ({
          settings: {
            ...state.settings,
            soundEnabled: !state.settings.soundEnabled,
          },
        })),

      toggleDeveloperMode: () =>
        set((state) => ({
          settings: {
            ...state.settings,
            developerMode: !state.settings.developerMode,
          },
        })),

      updateSettings: (partial: Partial<DesktopSettings>) =>
        set((state) => ({
          settings: { ...state.settings, ...partial },
        })),

      resetSettings: () =>
        set(() => ({
          settings: DEFAULT_SETTINGS,
        })),

      setHydrated: (isHydrated: boolean) => set({ isHydrated }),
    }),
    {
      name: 'cosmolost-app-settings',
      storage: createJSONStorage(() => tauriStorage),
      partialize: (state) => ({ settings: state.settings }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
