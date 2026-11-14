import { DEFAULT_SETTINGS } from '../model/defaults';
import type { AccentColor, DesktopSettings, SettingsExportData } from '../model/types';

const ALLOWED_ACCENTS: AccentColor[] = ['blue', 'purple', 'teal', 'green', 'orange', 'cyan'];

export const settingsRepository = {
  exportToJson(settings: DesktopSettings): string {
    const payload: SettingsExportData = {
      version: 1,
      app: 'CosmoLost Desktop Client',
      exportedAt: new Date().toISOString(),
      settings: {
        ...settings,
        lastExportedAt: new Date().toISOString(),
      },
    };
    return JSON.stringify(payload, null, 2);
  },

  importFromJson(rawJson: string): DesktopSettings {
    try {
      const parsed = JSON.parse(rawJson) as Partial<SettingsExportData> & Partial<DesktopSettings>;

      const candidate: Partial<DesktopSettings> =
        parsed.settings && typeof parsed.settings === 'object' ? parsed.settings : parsed;

      const accentColor: AccentColor =
        typeof candidate.accentColor === 'string' &&
        ALLOWED_ACCENTS.includes(candidate.accentColor as AccentColor)
          ? (candidate.accentColor as AccentColor)
          : DEFAULT_SETTINGS.accentColor;

      const autoRefreshMetrics =
        typeof candidate.autoRefreshMetrics === 'boolean'
          ? candidate.autoRefreshMetrics
          : DEFAULT_SETTINGS.autoRefreshMetrics;

      const rawInterval = Number(candidate.refreshIntervalSec);
      const refreshIntervalSec =
        Number.isFinite(rawInterval) && rawInterval >= 1 && rawInterval <= 60
          ? rawInterval
          : DEFAULT_SETTINGS.refreshIntervalSec;

      const compactMode =
        typeof candidate.compactMode === 'boolean'
          ? candidate.compactMode
          : DEFAULT_SETTINGS.compactMode;

      const soundEnabled =
        typeof candidate.soundEnabled === 'boolean'
          ? candidate.soundEnabled
          : DEFAULT_SETTINGS.soundEnabled;

      const developerMode =
        typeof candidate.developerMode === 'boolean'
          ? candidate.developerMode
          : DEFAULT_SETTINGS.developerMode;

      return {
        accentColor,
        autoRefreshMetrics,
        refreshIntervalSec,
        compactMode,
        soundEnabled,
        developerMode,
        lastExportedAt: candidate.lastExportedAt ?? null,
      };
    } catch (error) {
      throw new Error(
        `Invalid settings JSON format: ${error instanceof Error ? error.message : 'Unknown parse error'}`,
      );
    }
  },

  downloadAsFile(jsonContent: string, filename = 'cosmolost-settings.json'): void {
    if (typeof window === 'undefined') return;

    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  },
};
