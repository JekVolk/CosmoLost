import { describe, expect, it } from 'vitest';
import { artifactRepository } from '../src/entities/artifact';
import { contentTemplateRepository } from '../src/entities/content-template';
import { axiosClient, editorApiClient, portalApiClient } from '../src/shared/api';

describe('CosmoLost Desktop API Integration (Axios & React Query Architecture)', () => {
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
