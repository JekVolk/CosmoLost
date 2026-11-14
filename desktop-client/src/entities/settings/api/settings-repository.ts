import { DesktopSettingsSchema, SettingsExportDataSchema } from '../model/schema';
import type { DesktopSettings, SettingsExportData } from '../model/types';

export const settingsRepository = {
  exportToJson(settings: DesktopSettings): string {
    const validatedSettings = DesktopSettingsSchema.parse(settings);

    const payload: SettingsExportData = {
      version: 1,
      app: 'CosmoLost Desktop Client',
      exportedAt: new Date().toISOString(),
      settings: {
        ...validatedSettings,
        lastExportedAt: new Date().toISOString(),
      },
    };

    return JSON.stringify(payload, null, 2);
  },

  importFromJson(rawJson: string): DesktopSettings {
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawJson);
    } catch (error) {
      throw new Error(
        `Invalid JSON syntax: ${error instanceof Error ? error.message : 'Parse error'}`,
      );
    }

    // Try parsing as full SettingsExportDataSchema first
    const exportResult = SettingsExportDataSchema.safeParse(parsed);
    if (exportResult.success) {
      return exportResult.data.settings;
    }

    // Try parsing as raw DesktopSettingsSchema if user pasted raw settings object
    const candidate =
      parsed && typeof parsed === 'object' && 'settings' in parsed
        ? (parsed as { settings: unknown }).settings
        : parsed;

    const directResult = DesktopSettingsSchema.safeParse(candidate);
    if (directResult.success) {
      return directResult.data;
    }

    // Combine error issues from Zod
    const issues = directResult.error.issues
      .map((issue) => `${issue.path.join('.') || 'root'}: ${issue.message}`)
      .join('; ');

    throw new Error(`Zod schema validation failed: ${issues}`);
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
