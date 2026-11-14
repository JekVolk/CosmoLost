import type {
  AccentColor,
  DesktopSettings,
  Language,
  SettingsExportData,
  ThemeMode,
} from './schema';

export type { AccentColor, ThemeMode, Language, DesktopSettings, SettingsExportData };

export interface SettingsState {
  settings: DesktopSettings;
  isHydrated: boolean;
  setAccentColor: (accentColor: AccentColor) => void;
  setThemeMode: (themeMode: ThemeMode) => void;
  setLanguage: (language: Language) => void;
  setAutoRefresh: (enabled: boolean) => void;
  setRefreshInterval: (seconds: number) => void;
  toggleCompactMode: () => void;
  toggleSound: () => void;
  toggleDeveloperMode: () => void;
  updateSettings: (partial: Partial<DesktopSettings>) => void;
  resetSettings: () => void;
  setHydrated: (hydrated: boolean) => void;
}
