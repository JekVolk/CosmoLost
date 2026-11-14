import { z } from 'zod';

export const AccentColorSchema = z.enum(['blue', 'purple', 'teal', 'green', 'orange', 'cyan']);

export const ThemeModeSchema = z.enum(['dark', 'light', 'system']);

export const LanguageSchema = z.enum(['en', 'uk']);

export const DesktopSettingsSchema = z.object({
  accentColor: AccentColorSchema.default('blue'),
  themeMode: ThemeModeSchema.default('dark'),
  language: LanguageSchema.default('en'),
  autoRefreshMetrics: z.boolean().default(true),
  refreshIntervalSec: z.number().int().min(1).max(60).default(5),
  compactMode: z.boolean().default(false),
  soundEnabled: z.boolean().default(false),
  developerMode: z.boolean().default(false),
  lastExportedAt: z.string().nullable().default(null),
});

export const SettingsExportDataSchema = z.object({
  version: z.literal(1),
  app: z.string().default('CosmoLost Desktop Client'),
  exportedAt: z.string(),
  settings: DesktopSettingsSchema,
});

export type AccentColor = z.infer<typeof AccentColorSchema>;
export type ThemeMode = z.infer<typeof ThemeModeSchema>;
export type Language = z.infer<typeof LanguageSchema>;
export type DesktopSettings = z.infer<typeof DesktopSettingsSchema>;
export type SettingsExportData = z.infer<typeof SettingsExportDataSchema>;
