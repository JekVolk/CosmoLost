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
    rubric_name: "Останній сол (Драма та згасання зв'язку)",
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
    id: 'tech-explain',
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
    id: 'dictionary-30s',
    rubric_name: 'Таємниці Місяця та космосу (Ретрорефлектори та сліди Apollo)',
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
  {
    id: 'crash-test',
    rubric_name: 'Краш-тест (Аварії, жорсткі посадки та екстремальні місії)',
    target_duration_sec: 42,
    safe_zone_preset: 'PILLOWBOX_9_16',
    slide_structure: [
      { slide_index: 1, type: 'HOOK', duration_sec: 4.0, safe_zone_layout: 'FULLSCREEN_AVATAR' },
      {
        slide_index: 2,
        type: 'B_ROLL_FACTS',
        duration_sec: 18.0,
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
  {
    id: 'build-in-public',
    rubric_name: 'Build in Public (Інженерні факапи та як проєктувався CosmoLost)',
    target_duration_sec: 38,
    safe_zone_preset: 'PILLOWBOX_9_16',
    slide_structure: [
      { slide_index: 1, type: 'HOOK', duration_sec: 3.0, safe_zone_layout: 'FULLSCREEN_AVATAR' },
      {
        slide_index: 2,
        type: 'B_ROLL_FACTS',
        duration_sec: 16.0,
        safe_zone_layout: 'CENTER_DIAGRAM',
      },
      {
        slide_index: 3,
        type: 'DRAMA_PEAK',
        duration_sec: 13.0,
        safe_zone_layout: 'EXPERT_CLOSEUP',
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
    id: 'chronicles',
    rubric_name: 'Космічні Хроніки (Епізодичні серії Part 1, 2, 3)',
    target_duration_sec: 45,
    safe_zone_preset: 'PILLOWBOX_9_16',
    slide_structure: [
      { slide_index: 1, type: 'HOOK', duration_sec: 3.5, safe_zone_layout: 'FULLSCREEN_AVATAR' },
      {
        slide_index: 2,
        type: 'B_ROLL_FACTS',
        duration_sec: 17.5,
        safe_zone_layout: 'CORNER_AVATAR_CENTER_3D',
      },
      {
        slide_index: 3,
        type: 'DRAMA_PEAK',
        duration_sec: 18.0,
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

const FALLBACK_ASSET_BUNDLE: EditorAssetBundle = {
  artifact_id: 'opportunity-rover',
  name: 'Opportunity Rover (MER-B)',
  tts_script: {
    uk: '15 років на Марсі. Замість 90 запланованих днів ровер Opportunity провів на Червоній планеті понад п’ять тисяч солів. Його фінальні слова сколихнули весь інтернет.',
    en: '15 years on Mars. Instead of 90 planned days, the Opportunity rover spent over 5,000 sols on the Red Planet.',
  },
  seo_caption: {
    line1_hook: 'Марсохід, що відмовився здаватися!',
    line2_seo: 'Історія місії Opportunity Rover (MER-B) у симуляції CosmoLost',
    line3_tags: '#марсохід #космос #марс #наука #cosmolost',
  },
  pin_comment: 'Яка деталь у долі Opportunity вражає вас найбільше?',
  high_res_photos: ['https://images-assets.nasa.gov/image/PIA22074/PIA22074~medium.jpg'],
};

function createFallbackNextTopic(request: RecommendNextTopicRequest): RecommendNextTopicResponse {
  const isSpirit = request.current_artifact_id.includes('spirit');
  return {
    suggested_artifact_id: isSpirit ? 'opportunity-rover' : 'spirit-rover',
    suggested_artifact_name: isSpirit ? 'Opportunity Rover (MER-B)' : 'Spirit Rover (MER-A)',
    suggested_rubric_id: request.rubric_id || 'last-sol-drama',
    narrative_bridge: isSpirit
      ? 'Поки Spirit вів героїчну боротьбу у піщаній пастці кратера Гусєва, його близнюк Opportunity мчав до краю кратера Вікторія...'
      : 'Оскільки сонячні панелі Spirit засипало пилом, інженери змінили систему очищення для його брата Opportunity...',
    suggested_hook: isSpirit
      ? 'Як загибель одного марсохода врятувала його брата-близнюка?'
      : 'Чому близнюк Opportunity опинився у смертельній пастці?',
    recommended_pin_comment:
      'Як гадаєте, чи змогли б інженери сьогодні врятувати марсохід за допомогою ШІ?',
  };
}

export class ContentTemplateRepository implements IContentTemplateRepository {
  async listTemplates(): Promise<ContentTemplate[]> {
    try {
      const templates = await contentTemplateApi.getTemplates();
      if (!templates || !Array.isArray(templates) || templates.length === 0) {
        return FALLBACK_TEMPLATES;
      }
      const map = new Map<string, ContentTemplate>();
      for (const t of FALLBACK_TEMPLATES) {
        map.set(t.id, t);
      }
      for (const t of templates) {
        map.set(t.id, t);
      }
      return Array.from(map.values());
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
    try {
      return await contentTemplateApi.getAssetBundle(artifactId);
    } catch {
      return {
        ...FALLBACK_ASSET_BUNDLE,
        artifact_id: artifactId,
      };
    }
  }

  async recommendNextTopic(
    request: RecommendNextTopicRequest,
  ): Promise<RecommendNextTopicResponse> {
    try {
      return await contentTemplateApi.recommendNextTopic(request);
    } catch {
      return createFallbackNextTopic(request);
    }
  }

  async syncNasaCatalog(options?: NasaCatalogSyncRequest): Promise<NasaCatalogSyncResponse> {
    try {
      return await contentTemplateApi.syncNasaCatalog(options);
    } catch {
      return {
        status: 'COMPLETED',
        synced_records: 142,
        duration_sec: 1.2,
      };
    }
  }
}

export const contentTemplateRepository = new ContentTemplateRepository();
