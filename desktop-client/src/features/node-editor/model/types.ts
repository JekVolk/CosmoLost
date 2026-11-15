import type { SmmRubricType } from '@/shared/api';
import type { Edge, Node } from '@xyflow/react';

export type FlowNodeType =
  | 'artifactSource'
  | 'scriptTemplate'
  | 'hookScorer'
  | 'audioTts'
  | 'audioBgm'
  | 'pngTuber'
  | 'visualComposite'
  | 'subtitle'
  | 'safeZonePreview'
  | 'ffmpegRender'
  | 'socialPublish';

export type PipelineStageId = 'artifact' | 'script' | 'audio' | 'composite' | 'publish';

export interface PipelineStageDefinition {
  id: PipelineStageId;
  label: string;
  description: string;
  nodeTypes: readonly FlowNodeType[];
}

export const PIPELINE_STAGES: readonly PipelineStageDefinition[] = [
  {
    id: 'artifact',
    label: 'Artifact Source',
    description: 'NASA Data & 3D GLB',
    nodeTypes: ['artifactSource'],
  },
  {
    id: 'script',
    label: 'Script & Cues',
    description: 'SMM Rubric & Hook',
    nodeTypes: ['scriptTemplate', 'hookScorer'],
  },
  {
    id: 'audio',
    label: 'Audio & Sync',
    description: 'TTS, BGM & Phonemes',
    nodeTypes: ['audioTts', 'audioBgm'],
  },
  {
    id: 'composite',
    label: 'Visual Composite',
    description: 'Subtitles, Avatar & Safe Zones',
    nodeTypes: ['subtitle', 'pngTuber', 'visualComposite', 'safeZonePreview'],
  },
  {
    id: 'publish',
    label: 'Export & Publish',
    description: 'FFmpeg Render, Shorts & TG',
    nodeTypes: ['ffmpegRender', 'socialPublish'],
  },
];

export interface ArtifactSourceNodeData extends Record<string, unknown> {
  celestialBody: 'moon' | 'mars';
  artifactId: string;
  artifactName: string;
  has3dModel: boolean;
  photosCount: number;
}

export interface ScriptTemplateNodeData extends Record<string, unknown> {
  rubricId: SmmRubricType;
  durationSec: number;
  slidesCount: number;
  hookText: string;
  loopCtaText: string;
}

export interface HookScorerNodeData extends Record<string, unknown> {
  score: number; // 0..100
  viralGrade: 'S' | 'A' | 'B' | 'C' | 'F';
  curiosityGap: boolean;
  questionFormat: boolean;
  brevityUnder12Words: boolean;
  hasEmotionalTrigger: boolean;
  feedbackTip: string;
}

export interface AudioTtsNodeData extends Record<string, unknown> {
  voice: 'uk-UA-OstapNeural' | 'uk-UA-PolinaNeural' | 'en-US-GuyNeural';
  speedRate: number;
  enableJumpCut: boolean;
  audioDurationSec: number;
  rmsSampleCount: number;
}

export interface AudioBgmNodeData extends Record<string, unknown> {
  trackTitle: string;
  genre: 'ambient' | 'synthwave' | 'cinematic' | 'lofi';
  duckingDb: number; // e.g. -14
  bgmVolumePct: number; // e.g. 20
  duckingAttackMs: number; // e.g. 150
}

export interface PngTuberNodeData extends Record<string, unknown> {
  modelName: string;
  activeExpression: 'idle' | 'talking' | 'shock' | 'excited' | 'thinking';
  rmsThreshold: number; // e.g. 0.015
  bounceEnabled: boolean;
  anchorPosition: 'bottom-right' | 'bottom-left' | 'top-right';
}

export interface VisualCompositeNodeData extends Record<string, unknown> {
  enablePillowBox: boolean;
  enableKenBurns: boolean;
  enablePngTuber: boolean;
  pngtuberState: 'IDLE' | 'EXPERT' | 'SHOCK' | 'HYPE';
  enableSafeZonesOverlay: boolean;
}

export interface SubtitleNodeData extends Record<string, unknown> {
  format: 'ASS' | 'SRT';
  highlightColor: string;
  wordsPerChunk: number;
  isUppercase?: boolean;
  highlightKeywords?: boolean;
  presetName?: string;
  strokeColor?: string;
  strokeWidth?: number;
}

export interface SafeZonePreviewNodeData extends Record<string, unknown> {
  preset: 'youtube-shorts' | 'tiktok' | 'instagram-reels';
  topMarginPx: number; // e.g. 220
  bottomMarginPx: number; // e.g. 420
  rightMarginPx: number; // e.g. 150
  isSubtitleSafe: boolean;
  isAvatarSafe: boolean;
}

export interface FfmpegRenderNodeData extends Record<string, unknown> {
  renderTimeoutSec: number;
  fps: 30 | 60;
  qualityCrf: number;
  progressPct: number;
  status: 'IDLE' | 'RENDERING' | 'COMPLETED' | 'FAILED';
  outputPath?: string;
}

export interface SocialPublishNodeData extends Record<string, unknown> {
  selectedChannels: string[];
  line1Hook: string;
  line2Seo: string;
  line3Tags: string;
  pinComment: string;
}

export type PipelineNode =
  | Node<ArtifactSourceNodeData, 'artifactSource'>
  | Node<ScriptTemplateNodeData, 'scriptTemplate'>
  | Node<HookScorerNodeData, 'hookScorer'>
  | Node<AudioTtsNodeData, 'audioTts'>
  | Node<AudioBgmNodeData, 'audioBgm'>
  | Node<PngTuberNodeData, 'pngTuber'>
  | Node<VisualCompositeNodeData, 'visualComposite'>
  | Node<SubtitleNodeData, 'subtitle'>
  | Node<SafeZonePreviewNodeData, 'safeZonePreview'>
  | Node<FfmpegRenderNodeData, 'ffmpegRender'>
  | Node<SocialPublishNodeData, 'socialPublish'>;

export type PipelineEdge = Edge;

export interface PipelineExecutionResult {
  success: boolean;
  renderedVideoPath?: string;
  hookViralityScore: number;
  totalDurationSec: number;
  publishedChannels: string[];
  executionTimeMs: number;
  errors?: string[];
}
