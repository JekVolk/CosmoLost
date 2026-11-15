import type { SmmRubricType } from '@/shared/api';

export type ProjectStatus =
  | 'DRAFT'
  | 'SYNTHESIZING'
  | 'RENDERING'
  | 'READY'
  | 'PUBLISHED'
  | 'FAILED';

export interface VideoScriptSlide {
  id: string;
  slideIndex: number;
  type: 'HOOK' | 'B_ROLL_FACTS' | 'DRAMA_PEAK' | 'SEAMLESS_LOOP_CTA';
  durationSec: number;
  narratorText: string;
  visualPrompt: string;
  pngtuberState: 'IDLE' | 'EXPERT' | 'SHOCK' | 'HYPE';
}

export type SubtitlePresetName = 'HORMOZI_YELLOW' | 'MRBEAST_CYAN' | 'CYBER_LIME' | 'CLEAN_WHITE';

export interface SubtitleStyleConfig {
  preset: SubtitlePresetName;
  textColor: string;
  highlightColor: string;
  strokeColor: string;
  strokeWidth: number;
  isUppercase: boolean;
  highlightKeywords: boolean;
  wordsPerChunk: number;
  fontSizePx: number;
}

export type ContentLanguage = 'en' | 'uk' | 'dual';

export interface SeriesInfo {
  seriesName: string;
  partNumber: number;
  totalParts: number;
  cliffhanger?: string;
}

export interface TagGroup {
  id: string;
  name: string;
  icon: string;
  tags: string[];
}

export interface PublicationProject {
  id: string;
  artifactId: string;
  artifactName: string;
  rubricId: SmmRubricType;
  status: ProjectStatus;
  targetDurationSec: number;
  selectionReason: string;
  slides: VideoScriptSlide[];
  seoCaption: {
    line1Hook: string;
    line2Seo: string;
    line3Tags: string;
  };
  pinComment: string;
  seriesInfo?: SeriesInfo;
  magnetWord?: string;
  tagGroups?: string[];
  localVideoPath?: string;
  localAudioPath?: string;
  brollVideoUrl?: string;
  brollPreset?: string;
  brollDurationSec?: number;
  subtitleStyle?: SubtitleStyleConfig;
  contentLanguage?: ContentLanguage;
  renderTimeoutSec: number;
  createdAt: string;
  updatedAt: string;
}

export interface IPublicationRepository {
  createDraft(artifactId: string, rubricId: SmmRubricType): Promise<PublicationProject>;
  saveProject(project: PublicationProject): Promise<void>;
  listProjects(): Promise<PublicationProject[]>;
}
