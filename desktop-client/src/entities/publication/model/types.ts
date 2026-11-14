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
  localVideoPath?: string;
  localAudioPath?: string;
  renderTimeoutSec: number;
  createdAt: string;
  updatedAt: string;
}

export interface IPublicationRepository {
  createDraft(artifactId: string, rubricId: SmmRubricType): Promise<PublicationProject>;
  saveProject(project: PublicationProject): Promise<void>;
  listProjects(): Promise<PublicationProject[]>;
}
