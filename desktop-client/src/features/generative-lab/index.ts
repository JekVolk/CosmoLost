export { GenerativeLabModal } from './ui/GenerativeLabModal';
export { useGenerativeLab, useGenerativeLabStore } from './model/use-generative-lab';
export {
  buildVeoPrompt,
  buildImagePrompt,
  buildAudioPrompt,
  extractSlideModalityPrompts,
} from './model/prompt-builder';
export { callGenerativeProxy } from './model/proxy-client';
export type {
  SlideModalityPrompts,
  GenerativeModality,
  ProxyGenerateParams,
  ProxyGenerateResult,
} from './model/types';
