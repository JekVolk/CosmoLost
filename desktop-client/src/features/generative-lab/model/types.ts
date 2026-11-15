export interface SlideModalityPrompts {
  veoPrompt: string;
  imagePrompt: string;
  audioPrompt: string;
  narratorText: string;
}

export type GenerativeModality = 'video' | 'image' | 'audio' | 'voice';

export interface ProxyGenerateParams {
  endpoint: string;
  token?: string;
  prompt: string;
  modality: 'image' | 'video';
  model?: string;
  timeoutMs?: number;
}

export interface ProxyGenerateResult {
  success: boolean;
  mediaUrl?: string;
  mediaType: 'video' | 'image';
  source: 'proxy' | 'fallback' | 'manual';
  error?: string;
}
