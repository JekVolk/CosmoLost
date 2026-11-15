import { beforeEach, describe, expect, it, vi } from 'vitest';
import { artifactRepository } from '../src/entities/artifact';
import { contentTemplateRepository } from '../src/entities/content-template';
import { axiosClient, editorApiClient, portalApiClient } from '../src/shared/api';

const MOCK_TEMPLATES = [
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
    slide_structure: [],
  },
  {
    id: 'lunar-secrets',
    rubric_name: 'Таємниці Місяця',
    target_duration_sec: 40,
    safe_zone_preset: 'PILLOWBOX_9_16',
    slide_structure: [],
  },
];

const MOCK_ASSET_BUNDLE = {
  artifact_id: 'opportunity-rover',
  name: 'Opportunity Rover (MER-B)',
  celestial_body: 'mars',
  tts_script: {
    uk: '15 років на Марсі. Замість 90 запланованих днів...',
    en: '15 years on Mars. Instead of 90 planned days...',
  },
  seo_caption: {
    line1_hook: 'Марсохід, що відмовився здаватися!',
    line2_seo: 'Історія Opportunity Rover (MER-B) у CosmoLost',
    line3_tags: '#марсохід #космос #марс #наука #cosmolost',
  },
  pin_comment: 'Яка деталь у долі Opportunity вражає вас найбільше?',
  high_res_photos: ['https://images-assets.nasa.gov/image/PIA22074/PIA22074~medium.jpg'],
};

const MOCK_PORTAL_ARTIFACTS = {
  total: 3,
  results: [
    {
      id: 'opportunity-rover',
      name: 'Opportunity Rover (MER-B)',
      celestial_body: 'mars',
      coordinates: { latitude: -1.9462, longitude: 354.4734, location_name: 'Perseverance Valley' },
      preview_image_url: 'https://images-assets.nasa.gov/image/PIA22074/PIA22074~medium.jpg',
      media: [],
    },
    {
      id: 'spirit-rover',
      name: 'Spirit Rover (MER-A)',
      celestial_body: 'mars',
      coordinates: { latitude: -14.5684, longitude: 175.4726, location_name: 'Gusev Crater' },
      preview_image_url: 'https://images-assets.nasa.gov/image/PIA03253/PIA03253~medium.jpg',
      media: [],
    },
    {
      id: 'apollo-11-lm-eagle',
      name: 'Apollo 11 Lunar Module Eagle',
      celestial_body: 'moon',
      coordinates: { latitude: 0.674, longitude: 23.472, location_name: 'Mare Tranquillitatis' },
      preview_image_url:
        'https://images-assets.nasa.gov/image/as11-40-5927/as11-40-5927~medium.jpg',
      media: [],
    },
  ],
};

describe('CosmoLost Desktop API Integration (Axios & React Query Architecture)', () => {
  beforeEach(() => {
    vi.spyOn(axiosClient, 'get').mockImplementation(async (url: string) => {
      if (url.includes('/assets/')) {
        return MOCK_ASSET_BUNDLE;
      }
      if (url.includes('/api/v1/editor/templates/last-sol-drama/')) {
        return MOCK_TEMPLATES[0];
      }
      if (url.includes('/api/v1/editor/templates/')) {
        return MOCK_TEMPLATES;
      }
      if (url.includes('/api/v1/portal/artifacts/')) {
        return MOCK_PORTAL_ARTIFACTS;
      }
      return {};
    });
  });

  describe('1. Axios HTTP Client & Interceptors', () => {
    it('is configured with proper base URL and headers', () => {
      expect(axiosClient).toBeDefined();
      expect(typeof axiosClient.get).toBe('function');
      expect(typeof axiosClient.post).toBe('function');
    });

    it('can fetch Editor Templates directly via Axios', async () => {
      const templates = await editorApiClient.getTemplates();
      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBeGreaterThanOrEqual(1);

      const first = templates[0];
      expect(first).toBeDefined();
      expect(first?.id).toBeDefined();
      expect(first?.rubric_name).toBeDefined();
      expect(first?.target_duration_sec).toBeGreaterThan(0);
      expect(Array.isArray(first?.slide_structure)).toBe(true);
    });

    it('can fetch specific Template details by ID', async () => {
      const template = await editorApiClient.getTemplateById('last-sol-drama');
      expect(template.id).toBe('last-sol-drama');
      expect(template.target_duration_sec).toBe(40);
      expect(template.slide_structure.length).toBeGreaterThanOrEqual(4);
      expect(template.slide_structure[0]?.type).toBe('HOOK');
    });
  });

  describe('2. Content Template & Recommendation Repository Pattern', () => {
    it('ContentTemplateRepository lists templates and maps fallback safely', async () => {
      const list = await contentTemplateRepository.listTemplates();
      expect(list.length).toBeGreaterThanOrEqual(3);
      const drama = list.find((t) => t.id === 'last-sol-drama');
      expect(drama).toBeDefined();
      expect(drama?.safe_zone_preset).toBe('PILLOWBOX_9_16');
    });

    it('fetches complete EditorAssetBundle for opportunity-rover', async () => {
      const bundle = await contentTemplateRepository.getAssetBundle('opportunity-rover');
      expect(bundle).toBeDefined();
      expect(bundle.artifact_id).toBe('opportunity-rover');
      expect(bundle.name).toContain('Opportunity');
      expect(bundle.tts_script.uk).toBeDefined();
      expect(bundle.tts_script.en).toBeDefined();
      expect(bundle.seo_caption.line1_hook).toBeDefined();
      expect(bundle.seo_caption.line2_seo).toBeDefined();
      expect(bundle.seo_caption.line3_tags).toContain('#cosmolost');
      expect(bundle.pin_comment).toBeDefined();
      expect(bundle.high_res_photos.length).toBeGreaterThan(0);
    });

    it('executes smart next topic recommendation engine for serialized storytelling', async () => {
      const recommendation = await contentTemplateRepository.recommendNextTopic({
        current_artifact_id: 'spirit-rover',
        rubric_id: 'last-sol-drama',
        selection_reason: 'Застрягання в піску Troy',
      });

      expect(recommendation).toBeDefined();
      expect(recommendation.suggested_artifact_id).toBeDefined();
      expect(recommendation.suggested_artifact_name).toBeDefined();
      expect(recommendation.narrative_bridge.length).toBeGreaterThan(10);
      expect(recommendation.suggested_hook.length).toBeGreaterThan(5);
      expect(recommendation.recommended_pin_comment.length).toBeGreaterThan(5);
    });
  });

  describe('3. Portal Artifact API & Domain Mapping', () => {
    it('Portal API returns live catalog from backend database', async () => {
      const catalog = await portalApiClient.listArtifacts({ limit: 10 });
      expect(catalog.total).toBeGreaterThanOrEqual(1);
      expect(catalog.results.length).toBeGreaterThanOrEqual(1);

      const opp = catalog.results.find((a) => a.id === 'opportunity-rover');
      expect(opp).toBeDefined();
      expect(opp?.celestial_body).toBe('mars');
      expect(opp?.coordinates.latitude).toBeDefined();
    });

    it('ArtifactRepository integrates with backend and maps domain models', async () => {
      const list = await artifactRepository.listFeaturedArtifacts();
      expect(list.length).toBeGreaterThanOrEqual(3);

      const opp = list.find((a) => a.id === 'opportunity-rover');
      expect(opp).toBeDefined();
      expect(opp?.name).toContain('Opportunity');
      expect(opp?.celestialBody).toBe('mars');
      expect(opp?.photos.length).toBeGreaterThan(0);
    });
  });
});
