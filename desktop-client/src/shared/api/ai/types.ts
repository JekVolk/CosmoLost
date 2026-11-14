export type SmmRubricType =
  | 'last-sol-drama'
  | 'tech-explain'
  | 'dictionary-30s'
  | 'crash-test'
  | 'build-in-public';

export interface ScriptSlideDto {
  slideIndex: number;
  type: 'HOOK' | 'B_ROLL_FACTS' | 'DRAMA_PEAK' | 'SEAMLESS_LOOP_CTA';
  durationSec: number;
  narratorText: string;
  visualPrompt: string;
  pngtuberState: 'IDLE' | 'EXPERT' | 'SHOCK' | 'HYPE';
}

export interface GenerateScriptPayload {
  artifactId: string;
  artifactName: string;
  rubricId: SmmRubricType;
  language: 'uk' | 'en';
  selectionReason?: string;
}

export interface GeneratedScriptResult {
  title: string;
  rubricId: SmmRubricType;
  totalDurationSec: number;
  slides: ScriptSlideDto[];
  seoCaption: {
    line1Hook: string;
    line2Seo: string;
    line3Tags: string;
  };
  pinComment: string;
}

export interface NextTopicPayload {
  currentArtifactId: string;
  currentRubricId: SmmRubricType;
  selectionReason?: string;
}

export interface NextTopicResult {
  suggestedArtifactId: string;
  suggestedArtifactName: string;
  narrativeBridge: string;
  suggestedHook: string;
  suggestedRubricId: SmmRubricType;
  recommendedPinComment: string;
}

export interface TtsSynthesisPayload {
  text: string;
  voice: 'uk-UA-OstapNeural' | 'uk-UA-PolinaNeural' | 'en-US-GuyNeural' | 'en-US-JennyNeural';
  speedRate?: number;
  enableJumpCut?: boolean;
}

export interface RmsFrame {
  timestampMs: number;
  rmsAmplitude: number;
  isMouthOpen: boolean;
}

export interface TtsSynthesisResult {
  audioBlobUrl: string;
  durationSec: number;
  rmsFrames: RmsFrame[];
  jumpCutTrimsCount: number;
}

export type LlmProviderType = 'gemini' | 'claude' | 'openai' | 'custom';

export interface LlmGenerationPayload {
  prompt: string;
  systemPrompt?: string;
  provider?: LlmProviderType;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LlmGenerationResult {
  text: string;
  provider: LlmProviderType;
  model: string;
  success: boolean;
  tokensUsed?: number;
  error?: string;
  isFallback?: boolean;
}

export type ImageProviderOption = 'openai-dalle' | 'pollinations-free' | 'gemini-imagen';

export interface GenerateImagePayload {
  prompt: string;
  provider?: ImageProviderOption;
  size?: '1024x1024' | '1024x1792' | '720x1280';
}

export interface GeneratedImageResult {
  imageUrl: string;
  provider: ImageProviderOption;
  prompt: string;
  isFallback: boolean;
}

export type VideoProviderOption =
  | 'pollinations-motion'
  | 'runway-gen3'
  | 'luma-dream'
  | 'local-procedural';

export interface GenerateVideoPayload {
  prompt: string;
  provider?: VideoProviderOption;
  aspectRatio?: '9:16' | '16:9';
  durationSec?: number;
}

export interface GeneratedVideoResult {
  videoUrl: string;
  provider: VideoProviderOption;
  prompt: string;
  taskId: string;
  status: 'ready' | 'rendering';
  isFallback: boolean;
}

export type MusicProviderOption = 'procedural-drone-synth' | 'nasa-space-sounds' | 'suno-ai';

export interface GenerateMusicPayload {
  prompt: string;
  provider?: MusicProviderOption;
  durationSec?: number;
  mood?: 'deep-space' | 'martian-tension' | 'cosmic-wonder' | 'heroic-landing';
}

export interface GeneratedMusicResult {
  audioUrl: string;
  provider: MusicProviderOption;
  title: string;
  durationSec: number;
  isSynthetic: boolean;
}
