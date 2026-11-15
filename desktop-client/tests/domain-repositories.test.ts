import { describe, expect, it } from 'vitest';
import { artifactRepository } from '../src/entities/artifact';
import { publicationRepository } from '../src/entities/publication';
import { socialConnectorRepository } from '../src/entities/social-connector';

describe('Domain Repositories (Entities Layer)', () => {
  it('ArtifactRepository maps NASA asset packages to ArtifactDomainModel', async () => {
    const list = await artifactRepository.listFeaturedArtifacts();

    expect(list.length).toBeGreaterThanOrEqual(3);
    const opp = list.find((a) => a.id === 'opportunity-rover');
    expect(opp).toBeDefined();
    expect(opp?.artifactType).toBe('ROVER');
    expect(opp?.celestialBody).toBe('mars');
    expect(opp?.coordinates.locationName).toContain('Perseverance Valley');
    expect(opp?.previewImageUrl).toBeDefined();

    const byId = await artifactRepository.getArtifactById('apollo-11-lm-eagle');
    expect(byId.id).toBe('apollo-11-lm-eagle');
    expect(byId.celestialBody).toBe('moon');
    expect(byId.model3dGlbUrl).toContain('lunar_module.glb');
  });

  it('PublicationRepository creates and persists draft projects', async () => {
    const draft = await publicationRepository.createDraft('opportunity-rover', 'last-sol-drama');

    expect(draft.id).toBeDefined();
    expect(draft.artifactId).toBe('opportunity-rover');
    expect(draft.status).toBe('DRAFT');
    expect(draft.targetDurationSec).toBe(40);
    expect(draft.renderTimeoutSec).toBe(40);

    // Update draft
    draft.status = 'READY';
    draft.selectionReason = 'Updated historical importance';
    await publicationRepository.saveProject(draft);

    const list = await publicationRepository.listProjects();
    const found = list.find((p) => p.id === draft.id);
    expect(found).toBeDefined();
    expect(found?.status).toBe('READY');
    expect(found?.selectionReason).toBe('Updated historical importance');
  });

  it('SocialConnectorRepository fetches configured channels', async () => {
    const connectors = await socialConnectorRepository.getConnectors();

    expect(connectors.length).toBeGreaterThanOrEqual(3);
    const types = connectors.map((c) => c.platformType);
    expect(types).toContain('YOUTUBE_SHORTS');
    expect(types).toContain('TELEGRAM_CHANNEL');
    expect(types).toContain('LOCAL_FOLDER');
  });
});
