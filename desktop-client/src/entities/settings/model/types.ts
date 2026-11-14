export type AccentColor = 'blue' | 'purple' | 'teal' | 'green' | 'orange' | 'cyan';

export interface DesktopSettings {
  accentColor: AccentColor;
  autoRefreshMetrics: boolean;
  refreshIntervalSec: number;
  compactMode: boolean;
  soundEnabled: boolean;
  developerMode: boolean;
  lastExportedAt: string | null;
}

export interface SettingsExportData {
  version: 1;
  app: 'CosmoLost Desktop Client';
  exportedAt: string;
  settings: DesktopSettings;
}

export interface SettingsState {
  settings: DesktopSettings;
  isHydrated: boolean;
  setAccentColor: (accentColor: AccentColor) => void;
  setAutoRefresh: (enabled: boolean) => void;
  setRefreshInterval: (seconds: number) => void;
  toggleCompactMode: () => void;
  toggleSound: () => void;
  toggleDeveloperMode: () => void;
  updateSettings: (partial: Partial<DesktopSettings>) => void;
  resetSettings: () => void;
  setHydrated: (hydrated: boolean) => void;
}
