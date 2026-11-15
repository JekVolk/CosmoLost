import { beforeEach, describe, expect, it } from 'vitest';
import { usePublicationStore } from '../src/entities/publication';

describe('Publication & Export System (REQ-PUB-01 – REQ-PUB-07, REQ-FAC-11)', () => {
  beforeEach(() => {
    usePublicationStore.setState({
      currentProject: {
        id: 'test-proj-1',
        artifactId: 'opportunity-rover',
        artifactName: 'Opportunity Rover (MER-B)',
        rubricId: 'last-sol-drama',
        status: 'READY',
        targetDurationSec: 40,
        renderTimeoutSec: 40,
        selectionReason: 'Загибель від пилової бурі',
        slides: [],
        seoCaption: {
          line1Hook: 'Марсохід, що відмовився здаватися!',
          line2Seo: 'Історія місії Opportunity Rover',
          line3Tags: '#shorts #nasa #mars #space #cosmolost',
        },
        pinComment: 'Яка деталь вас вражає найбільше?',
        subtitleStyle: {
          preset: 'HORMOZI_YELLOW',
          textColor: '#ffffff',
          highlightColor: '#facc15',
          strokeColor: '#000000',
          strokeWidth: 4,
          isUppercase: true,
          highlightKeywords: true,
          wordsPerChunk: 3,
          fontSizePx: 26,
        },
        contentLanguage: 'uk',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      batchQueue: null,
    });
  });

  describe('Dispatch Tracking & Manual Confirmation (REQ-PUB-05, REQ-PUB-07)', () => {
    it('updates publication dispatch status per platform', () => {
      const store = usePublicationStore.getState();

      store.updateDispatch({
        id: 'dispatch-yt-1',
        projectId: 'test-proj-1',
        connectorId: 'conn-yt',
        platformType: 'YOUTUBE_SHORTS',
        dispatchStatus: 'UPLOADING',
        pinCommentStatus: 'PENDING',
        dispatchedAt: new Date().toISOString(),
      });

      let current = usePublicationStore.getState().currentProject;
      let dispatch = current?.dispatches?.find((d) => d.platformType === 'YOUTUBE_SHORTS');
      expect(dispatch).toBeDefined();
      expect(dispatch?.dispatchStatus).toBe('UPLOADING');

      store.updateDispatch({
        id: 'dispatch-yt-1',
        projectId: 'test-proj-1',
        connectorId: 'conn-yt',
        platformType: 'YOUTUBE_SHORTS',
        dispatchStatus: 'PUBLISHED',
        pinCommentStatus: 'PINNED',
        externalPostUrl: 'https://youtube.com/shorts/abc123xyz',
        dispatchedAt: new Date().toISOString(),
      });

      current = usePublicationStore.getState().currentProject;
      dispatch = current?.dispatches?.find((d) => d.platformType === 'YOUTUBE_SHORTS');
      expect(dispatch?.dispatchStatus).toBe('PUBLISHED');
      expect(dispatch?.externalPostUrl).toBe('https://youtube.com/shorts/abc123xyz');
    });

    it('sets external post URL and transitions status to PUBLISHED_MANUALLY (REQ-PUB-07)', () => {
      const store = usePublicationStore.getState();
      const testUrl = 'https://t.me/cosmolost_hq/142';

      store.setExternalPostUrl(testUrl);

      const current = usePublicationStore.getState().currentProject;
      expect(current?.externalPostUrl).toBe(testUrl);
      expect(current?.status).toBe('PUBLISHED_MANUALLY');
    });
  });

  describe('Batch Project Generation Pipeline (REQ-FAC-11)', () => {
    it('creates batch queue and initializes 5 projects with narrative continuity', () => {
      const store = usePublicationStore.getState();
      const artifactsToBatch = [
        { id: 'lunokhod-1', name: 'Lunokhod 1' },
        { id: 'apollo-11-lm-eagle', name: 'Apollo 11 Eagle' },
        { id: 'perseverance-rover', name: 'Perseverance Rover' },
        { id: 'spirit-rover', name: 'Spirit Rover' },
        { id: 'curiosity-rover', name: 'Curiosity Rover' },
      ];

      store.batchGenerateProjects(artifactsToBatch, 'last-sol-drama');

      const queue = usePublicationStore.getState().batchQueue;
      expect(queue).toBeDefined();
      expect(queue?.totalCount).toBe(5);
      expect(queue?.projectIds.length).toBe(5);

      // Projects must have been added to the projects array
      const projects = usePublicationStore.getState().projects;
      const createdBatchProjects = projects.filter((p) =>
        artifactsToBatch.some((a) => a.id === p.artifactId),
      );
      expect(createdBatchProjects.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('Smart Next Topic Project Inheritance (REQ-FAC-13)', () => {
    it('stores next suggested artifact and creates a linked sequel project', () => {
      const store = usePublicationStore.getState();
      store.setNextTopicSuggestion('lunokhod-1', 'А що сталося із радянським ровером Луноход-1?');

      const current = usePublicationStore.getState().currentProject;
      expect(current?.nextSuggestedArtifactId).toBe('lunokhod-1');
      expect(current?.nextSuggestedHook).toContain('Луноход-1');

      const nextProject = store.createProjectFromSuggestion();
      expect(nextProject).toBeDefined();
      expect(nextProject?.artifactId).toBe('lunokhod-1');
      expect(nextProject?.rubricId).toBe('last-sol-drama');
      expect(nextProject?.seriesInfo?.seriesName).toBeDefined();
    });
  });
});
