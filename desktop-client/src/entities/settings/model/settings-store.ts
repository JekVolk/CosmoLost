import { i18n, tauriStorage } from '@/shared';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { DEFAULT_SETTINGS } from './defaults';
import type { AccentColor, DesktopSettings, Language, SettingsState, ThemeMode } from './types';

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      isHydrated: false,

      setAccentColor: (accentColor: AccentColor) =>
        set((state) => ({
          settings: { ...state.settings, accentColor },
        })),

      setThemeMode: (themeMode: ThemeMode) =>
        set((state) => ({
          settings: { ...state.settings, themeMode },
        })),

      setLanguage: (language: Language) => {
        i18n.changeLanguage(language);
        set((state) => ({
          settings: { ...state.settings, language },
        }));
      },

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

      updateSettings: (partial: Partial<DesktopSettings>) => {
        if (partial.language) {
          i18n.changeLanguage(partial.language);
        }
        set((state) => ({
          settings: { ...state.settings, ...partial },
        }));
      },

      resetSettings: () => {
        i18n.changeLanguage(DEFAULT_SETTINGS.language);
        set(() => ({
          settings: DEFAULT_SETTINGS,
        }));
      },

      setHydrated: (isHydrated: boolean) => set({ isHydrated }),
    }),
    {
      name: 'cosmolost-app-settings',
      storage: createJSONStorage(() => tauriStorage),
      partialize: (state) => ({ settings: state.settings }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated(true);
          if (state.settings?.language) {
            i18n.changeLanguage(state.settings.language);
          }
        }
      },
    },
  ),
);
