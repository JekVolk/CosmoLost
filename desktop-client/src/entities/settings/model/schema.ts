import { z } from 'zod';

export const AccentColorSchema = z.enum(['blue', 'purple', 'teal', 'green', 'orange', 'cyan']);

export const ThemeModeSchema = z.enum(['dark', 'light', 'system']);

export const LanguageSchema = z.enum(['en', 'uk']);

export const ContentGenerationLanguageSchema = z.enum(['en', 'uk', 'dual']);

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

export const AgentProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
  model: z.string(),
  temperature: z.number().min(0).max(2).default(0.7),
  systemPrompt: z.string(),
  description: z.string(),
  enabled: z.boolean().default(true),
});

export type AgentProfile = z.infer<typeof AgentProfileSchema>;

export const DEFAULT_AGENT_PROFILES: AgentProfile[] = [
  {
    id: 'scriptwriter',
    name: 'CosmoScriptwriter',
    role: 'Viral Space Scriptwriter',
    model: 'claude-3-5-sonnet-20241022',
    temperature: 0.8,
    description:
      'Генерує 50-секундні вірусні сценарії з Hormozi-хуками на базі відкритих даних NASA.',
    systemPrompt: `You are CosmoScriptwriter, an elite viral space content director for YouTube Shorts and TikTok.
Your mission is to turn raw NASA mission telemetry, rover logs, and astronomical discoveries into irresistible 45-60 second scripts.
Rules:
1. First 3 seconds MUST have a high-retention hook (Curiosity Gap, High-Stakes Question, or Shocking Metric).
2. Avoid generic introductions. Dive straight into the drama.
3. Use short, punchy sentences (3-5 words per clause).
4. Highlight key words in ALL-CAPS for kinetic on-screen subtitles.
5. End with an open-ended debate question that explodes the comments section.`,
    enabled: true,
  },
  {
    id: 'fact_checker',
    name: 'CosmoFactChecker',
    role: 'NASA Astrophysics & Telemetry Auditor',
    model: 'gpt-4o',
    temperature: 0.2,
    description:
      'Перевіряє наукову точність, номери солів (Sol), відстані та відсутність галюцинацій.',
    systemPrompt: `You are CosmoFactChecker, a rigorous NASA astrophysicist and mission auditor.
Your job is to audit script drafts against verifiable mission facts, telemetry records, and planetary geology.
Rules:
1. Verify all numerical claims (distances, orbital speeds, temperatures, dates).
2. Dissect ambiguous science and correct common misconceptions.
3. Flag any speculative claims and clearly separate proven facts from working hypotheses.
4. Keep the correction succinct and ready to inject into the script.`,
    enabled: true,
  },
  {
    id: 'director',
    name: 'CosmoDirector',
    role: 'Visual & Kinetic Media Director',
    model: 'gemini-1.5-pro',
    temperature: 0.7,
    description:
      'Керує вибором 60 FPS B-Roll геймплею, зумом камери, акцентами субтитрів та аудіо-паузами.',
    systemPrompt: `You are CosmoDirector, a visual pacing maestro for short-form space documentaries.
Your role:
1. Map script sentences to corresponding visual layers (Mars/Moon B-roll, 3D rover CAD models, deep-space imagery).
2. Determine camera motion (slow Ken Burns zoom, fast whip pan, crash zoom on anomalies).
3. Specify contrasting keyword subtitle colors (Hormozi Yellow, MrBeast Cyan, Neon Lime).
4. Direct audio ducking dips during high-intensity speech moments.`,
    enabled: true,
  },
  {
    id: 'publisher',
    name: 'CosmoPublisher',
    role: 'SEO & Multi-Platform Distribution',
    model: 'gpt-4o-mini',
    temperature: 0.5,
    description:
      'Створює оптимізовані заголовки, опис, теги #Shorts, закріплені коментарі та час релізу.',
    systemPrompt: `You are CosmoPublisher, an algorithm expert for YouTube Shorts, TikTok, and Telegram.
Your role:
1. Craft high-CTR titles (under 60 characters) with emotional trigger words.
2. Generate 5-8 targeted search tags (e.g. #Shorts, #NASA, #Mars, #SpaceMystery).
3. Write an engaging pinned comment that prompts immediate viewer replies.
4. Format clean Markdown descriptions with deep links to 3D interactive maps.`,
    enabled: true,
  },
];

export const DesktopSettingsSchema = z.object({
  accentColor: AccentColorSchema.default('blue'),
  themeMode: ThemeModeSchema.default('dark'),
  language: LanguageSchema.default('en'),
  contentGenerationLanguage: ContentGenerationLanguageSchema.default('en'),
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
  agentProfiles: z.array(AgentProfileSchema).default(DEFAULT_AGENT_PROFILES),
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
export type ContentGenerationLanguage = z.infer<typeof ContentGenerationLanguageSchema>;
export type ImageProvider = z.infer<typeof ImageProviderSchema>;
export type VideoProvider = z.infer<typeof VideoProviderSchema>;
export type MusicProvider = z.infer<typeof MusicProviderSchema>;
export type DesktopSettings = z.infer<typeof DesktopSettingsSchema>;
export type SettingsExportData = z.infer<typeof SettingsExportDataSchema>;
