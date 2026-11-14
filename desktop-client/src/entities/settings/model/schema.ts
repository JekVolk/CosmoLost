import { z } from 'zod';

export const AccentColorSchema = z.enum(['blue', 'purple', 'teal', 'green', 'orange', 'cyan']);

export const ThemeModeSchema = z.enum(['dark', 'light', 'system']);

export const LanguageSchema = z.enum(['en', 'uk']);

export const ImageProviderSchema = z.enum(['openai-dalle', 'pollinations-free', 'gemini-imagen']);
export const VideoProviderSchema = z.enum([
  'pollinations-motion',
  'runway-gen3',
  'luma-dream',
  'local-procedural',
]);
export const MusicProviderSchema = z.enum([
  'procedural-drone-synth',
  'nasa-space-sounds',
  'suno-ai',
]);

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
  // Integrations & Social Connectors
  youtubeClientId: z.string().default(''),
  youtubeConnected: z.boolean().default(false),
  youtubeAuthCode: z.string().default(''),
  youtubeRefreshToken: z.string().default(''),
  telegramBotToken: z.string().default(''),
  telegramChatId: z.string().default('@cosmolost_hq'),
  geminiApiKey: z.string().default(''),
  nasaApiKey: z.string().default('DEMO_KEY'),
  outputFolderPath: z.string().default(''),
  // CLI & Multi-LLM Interceptor
  claudeApiKey: z.string().default(''),
  claudeModel: z.string().default('claude-3-5-sonnet-20241022'),
  openaiApiKey: z.string().default(''),
  openaiModel: z.string().default('gpt-4o'),
  customLlmEndpoint: z.string().default(''),
  imageProvider: ImageProviderSchema.default('pollinations-free'),
  videoProvider: VideoProviderSchema.default('pollinations-motion'),
  musicProvider: MusicProviderSchema.default('procedural-drone-synth'),
  sunoApiKey: z.string().default(''),
  runwayApiKey: z.string().default(''),
  cliInterceptionEnabled: z.boolean().default(true),
  cliBridgePort: z.number().int().min(1024).max(65535).default(8089),
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
export type ImageProvider = z.infer<typeof ImageProviderSchema>;
export type VideoProvider = z.infer<typeof VideoProviderSchema>;
export type MusicProvider = z.infer<typeof MusicProviderSchema>;
export type DesktopSettings = z.infer<typeof DesktopSettingsSchema>;
export type SettingsExportData = z.infer<typeof SettingsExportDataSchema>;
