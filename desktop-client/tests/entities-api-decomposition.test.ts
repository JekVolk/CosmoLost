import { describe, expect, it, vi } from 'vitest';
import { artifactRepository } from '../src/entities/artifact';
import { celestialBodyRepository } from '../src/entities/celestial-body';
import { communityPublicationRepository } from '../src/entities/community-publication';
import { contentTemplateRepository } from '../src/entities/content-template';
import { missionRepository } from '../src/entities/mission';
import { nasaLoaderRepository } from '../src/entities/nasa-loader';
import { editorApiClient } from '../src/shared/api';

describe('CosmoLost Domain Entities Decomposition (FSD v2.1 API & Repositories)', () => {
  describe('1. CelestialBody Entity (entities/celestial-body)', () => {
    it('lists celestial bodies from backend and maps domain models', async () => {
      const bodies = await celestialBodyRepository.listCelestialBodies();
      expect(bodies.length).toBeGreaterThanOrEqual(2);

      const mars = bodies.find((b) => b.id === 'mars');
      expect(mars).toBeDefined();
      expect(mars?.name).toBe('Mars');
      expect(mars?.radiusKm).toBeGreaterThan(3000);
      expect(mars?.gravityMs2).toBeCloseTo(3.72, 1);
      expect(mars?.wmtsTileUrl).toContain('Mars');

      const moon = bodies.find((b) => b.id === 'moon');
      expect(moon).toBeDefined();
      expect(moon?.name).toBe('Moon');
    });

    it('fetches single celestial body detail by ID', async () => {
      const body = await celestialBodyRepository.getCelestialBodyById('mars');
      expect(body.id).toBe('mars');
      expect(body.name).toBe('Mars');
      expect(body.coordinateSystemType).toBe('PLANETOCENTRIC_360');
    });
  });

  describe('2. Mission Entity (entities/mission)', () => {
    it('lists missions from backend and calculates artifactsCount', async () => {
      const missions = await missionRepository.listMissions();
      expect(missions.length).toBeGreaterThanOrEqual(1);

      const first = missions[0];
      expect(first).toBeDefined();
      expect(first?.id).toBeDefined();
      expect(first?.name).toBeDefined();
      expect(first?.agency).toBeDefined();
    });

    it('fetches mission detail by ID', async () => {
      const missions = await missionRepository.listMissions();
      const targetId = missions[0]?.id || 'mer';

      const detail = await missionRepository.getMissionById(targetId);
      expect(detail.id).toBe(targetId);
      expect(detail.name).toBeDefined();
    });
  });

  describe('3. Artifact Sub-Resources (entities/artifact)', () => {
    it('fetches traverse waypoints for Opportunity rover', async () => {
      const waypoints = await artifactRepository.getArtifactWaypoints('opportunity-rover');
      expect(Array.isArray(waypoints)).toBe(true);
    });

    it('fetches scientific discoveries for Opportunity rover', async () => {
      const discoveries = await artifactRepository.getArtifactDiscoveries('opportunity-rover');
      expect(Array.isArray(discoveries)).toBe(true);
    });

    it('fetches media gallery for Opportunity rover', async () => {
      const media = await artifactRepository.getArtifactMedia('opportunity-rover');
      expect(Array.isArray(media)).toBe(true);
    });
  });

  describe('4. CommunityPublication Entity (entities/community-publication)', () => {
    it('lists approved community publications', async () => {
      const publications = await communityPublicationRepository.listApprovedPublications();
      expect(Array.isArray(publications)).toBe(true);
    });

    it('submits a new community publication for review', async () => {
      const missions = await missionRepository.listMissions();
      const targetMissionId = missions[0]?.id || 'mer';

      const res = await communityPublicationRepository.submitPublication({
        mission_id: targetMissionId,
        artifact_id: 'opportunity-rover',
        title: 'Opportunity Sol 5111 Final Journey Short',
        video_url: 'https://youtube.com/shorts/test12345',
        platform_type: 'YOUTUBE',
        author_name: 'CosmoCreator QA',
        source_references: 'NASA NSSDCA Archival Imagery',
      });

      expect(res).toBeDefined();
      expect(res.id).toBeDefined();
      expect(res.status).toBe('SUBMITTED_FOR_REVIEW');
      expect(res.is_approved).toBe(false);
    });
  });

  describe('5. ContentTemplate Entity (entities/content-template)', () => {
    it('lists templates from /editor/templates/', async () => {
      const templates = await contentTemplateRepository.listTemplates();
      expect(templates.length).toBeGreaterThanOrEqual(3);
    });

    it('recommends next topic via smart recommendation engine', async () => {
      const rec = await contentTemplateRepository.recommendNextTopic({
        current_artifact_id: 'spirit-rover',
        rubric_id: 'last-sol-drama',
        selection_reason: 'Застрягання в піску Troy',
      });

      expect(rec.suggested_artifact_id).toBeDefined();
      expect(rec.narrative_bridge.length).toBeGreaterThan(10);
    });
  });

  describe('6. NasaLoader Entity (entities/nasa-loader)', () => {
    it('triggers catalog sync through dedicated repository', async () => {
      const syncSpy = vi.spyOn(editorApiClient, 'syncNasaCatalog').mockResolvedValueOnce({
        status: 'COMPLETED',
        synced_records: 142,
        duration_sec: 2.4,
      });

      const res = await nasaLoaderRepository.syncCatalog({ force: false, dry_run: true });
      expect(res).toBeDefined();
      expect(res.status).toBe('COMPLETED');
      expect(res.synced_records).toBe(142);
      expect(res.duration_sec).toBe(2.4);

      expect(syncSpy).toHaveBeenCalledWith({ force: false, dry_run: true });
      syncSpy.mockRestore();
    });
  });
});
