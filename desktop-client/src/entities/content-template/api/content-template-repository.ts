import type {
  ContentTemplate,
  EditorAssetBundle,
  IContentTemplateRepository,
  NasaCatalogSyncRequest,
  NasaCatalogSyncResponse,
  RecommendNextTopicRequest,
  RecommendNextTopicResponse,
} from '../model/types';
import { contentTemplateApi } from './content-template-api';

const FALLBACK_TEMPLATES: ContentTemplate[] = [
  {
    id: 'last-sol-drama',
    rubric_name: "Останній день на зв'язку (Драма та згасання)",
    target_duration_sec: 40,
    safe_zone_preset: 'PILLOWBOX_9_16',
    slide_structure: [
      { slide_index: 1, type: 'HOOK', duration_sec: 3.5, safe_zone_layout: 'FULLSCREEN_AVATAR' },
      {
        slide_index: 2,
        type: 'B_ROLL_FACTS',
        duration_sec: 14.0,
        safe_zone_layout: 'CORNER_AVATAR_CENTER_3D',
      },
      {
        slide_index: 3,
        type: 'DRAMA_PEAK',
        duration_sec: 16.5,
        safe_zone_layout: 'TELEMETRY_HUD_SPLIT',
      },
      {
        slide_index: 4,
        type: 'SEAMLESS_LOOP_CTA',
        duration_sec: 6.0,
        safe_zone_layout: 'CTA_QR_PORTAL',
      },
    ],
  },
  {
    id: 'dictionary-explain',
    rubric_name: 'Як це працює? (Наука для школярів)',
    target_duration_sec: 35,
    safe_zone_preset: 'PILLOWBOX_9_16',
    slide_structure: [
      { slide_index: 1, type: 'HOOK', duration_sec: 3.0, safe_zone_layout: 'FULLSCREEN_AVATAR' },
      {
        slide_index: 2,
        type: 'B_ROLL_FACTS',
        duration_sec: 15.0,
        safe_zone_layout: 'CENTER_DIAGRAM',
      },
      {
        slide_index: 3,
        type: 'DRAMA_PEAK',
        duration_sec: 12.0,
        safe_zone_layout: 'EXPERT_CLOSEUP',
      },
      {
        slide_index: 4,
        type: 'SEAMLESS_LOOP_CTA',
        duration_sec: 5.0,
        safe_zone_layout: 'CTA_QR_PORTAL',
      },
    ],
  },
  {
    id: 'lunar-secrets',
    rubric_name: 'Таємниці Місяця (Ретрорефлектори та сліди Apollo)',
    target_duration_sec: 40,
    safe_zone_preset: 'PILLOWBOX_9_16',
    slide_structure: [
      { slide_index: 1, type: 'HOOK', duration_sec: 3.5, safe_zone_layout: 'FULLSCREEN_AVATAR' },
      {
        slide_index: 2,
        type: 'B_ROLL_FACTS',
        duration_sec: 16.5,
        safe_zone_layout: 'CORNER_AVATAR_CENTER_3D',
      },
      {
        slide_index: 3,
        type: 'DRAMA_PEAK',
        duration_sec: 14.0,
        safe_zone_layout: 'TELEMETRY_HUD_SPLIT',
      },
      {
        slide_index: 4,
        type: 'SEAMLESS_LOOP_CTA',
        duration_sec: 6.0,
        safe_zone_layout: 'CTA_QR_PORTAL',
      },
    ],
  },
];

export class ContentTemplateRepository implements IContentTemplateRepository {
  async listTemplates(): Promise<ContentTemplate[]> {
    try {
      const templates = await contentTemplateApi.getTemplates();
      return templates.length > 0 ? templates : FALLBACK_TEMPLATES;
    } catch {
      return FALLBACK_TEMPLATES;
    }
  }

  async getTemplateById(id: string): Promise<ContentTemplate> {
    try {
      return await contentTemplateApi.getTemplateById(id);
    } catch {
      const found = FALLBACK_TEMPLATES.find((t) => t.id === id);
      if (found) return found;
      return FALLBACK_TEMPLATES[0] as ContentTemplate;
    }
  }

  async getAssetBundle(artifactId: string): Promise<EditorAssetBundle> {
    return contentTemplateApi.getAssetBundle(artifactId);
  }

  async recommendNextTopic(
    request: RecommendNextTopicRequest,
  ): Promise<RecommendNextTopicResponse> {
    return contentTemplateApi.recommendNextTopic(request);
  }

  async syncNasaCatalog(options?: NasaCatalogSyncRequest): Promise<NasaCatalogSyncResponse> {
    return contentTemplateApi.syncNasaCatalog(options);
  }
}

export const contentTemplateRepository = new ContentTemplateRepository();
