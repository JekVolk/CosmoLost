import { beforeEach, describe, expect, it } from 'vitest';
import { usePublicationStore } from '../src/entities/publication';
import {
  ASPECT_RATIO_PRESETS,
  AVATAR_OPTIONS,
  CELESTIAL_PRESETS,
  DEFAULT_SIMULATION_CONFIG,
  GameplayRunnerEngine,
  useGameplayStore,
} from '../src/features/gameplay-broll';

describe('Pseudo-Gameplay B-Roll Generator (NASA Parkour & Runner)', () => {
  beforeEach(() => {
    useGameplayStore.setState({
      isModalOpen: false,
      savedClips: [],
      activeClip: null,
    });
    usePublicationStore.setState({
      currentProject: {
        id: 'proj-test-1',
        artifactId: 'apollo-11',
        artifactName: 'Apollo 11 Lunar Module',
        rubricId: 'RETRO_TECH_BREAKTHROUGH',
        status: 'DRAFT',
        targetDurationSec: 45,
        selectionReason: 'Iconic space milestone',
        slides: [],
        seoCaption: {
          line1Hook: 'How Apollo 11 landed',
          line2Seo: 'NASA moon mission',
          line3Tags: '#NASA #Apollo11',
        },
        pinComment: 'Tell us your thoughts!',
        renderTimeoutSec: 40,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  });

  describe('1. Presets and Avatar Configuration', () => {
    it('defines valid physics and celestial parameters for Moon, Mars, and Europa', () => {
      expect(CELESTIAL_PRESETS.MOON_PARKOUR).toBeDefined();
      expect(CELESTIAL_PRESETS.MOON_PARKOUR.gravityDisplay).toBe(1.62);
      expect(CELESTIAL_PRESETS.MOON_PARKOUR.horizonCelestial).toBe('EARTH');

      expect(CELESTIAL_PRESETS.MARS_DUNES).toBeDefined();
      expect(CELESTIAL_PRESETS.MARS_DUNES.gravityDisplay).toBe(3.72);
      expect(CELESTIAL_PRESETS.MARS_DUNES.horizonCelestial).toBe('PHOBOS');

      expect(CELESTIAL_PRESETS.EUROPA_ICE).toBeDefined();
      expect(CELESTIAL_PRESETS.EUROPA_ICE.gravityDisplay).toBe(1.31);
      expect(CELESTIAL_PRESETS.EUROPA_ICE.horizonCelestial).toBe('JUPITER');
    });

    it('provides all 3 avatar types: Sphere, Rover, Astronaut', () => {
      const avatarIds = AVATAR_OPTIONS.map((a) => a.id);
      expect(avatarIds).toContain('COSMIC_SPHERE');
      expect(avatarIds).toContain('LUNAR_ROVER');
      expect(avatarIds).toContain('JETPACK_ASTRONAUT');
    });

    it('supports 9:16 vertical, 1:1 square, and 16:9 landscape aspect ratios', () => {
      expect(ASPECT_RATIO_PRESETS['9:16'].width).toBe(1080);
      expect(ASPECT_RATIO_PRESETS['9:16'].height).toBe(1920);

      expect(ASPECT_RATIO_PRESETS['1:1'].width).toBe(1080);
      expect(ASPECT_RATIO_PRESETS['1:1'].height).toBe(1080);

      expect(ASPECT_RATIO_PRESETS['16:9'].width).toBe(1920);
      expect(ASPECT_RATIO_PRESETS['16:9'].height).toBe(1080);
    });
  });

  describe('2. Procedural Physics Simulation Engine', () => {
    it('initializes with default config and advances world distance upon stepping', () => {
      const engine = new GameplayRunnerEngine(DEFAULT_SIMULATION_CONFIG, 1080, 1920);

      expect(engine.worldDistance).toBe(0);
      expect(engine.isGrounded).toBe(true);

      // Step physics by 1 second (60 frames equivalent)
      for (let i = 0; i < 60; i++) {
        engine.step(1 / 60);
      }

      expect(engine.worldDistance).toBeGreaterThan(0);
      const telemetry = engine.getTelemetry();
      expect(telemetry.distanceMeters).toBeGreaterThan(0);
      expect(telemetry.currentSpeedKmH).toBeGreaterThan(0);
      expect(telemetry.gravityMps2).toBe(1.62);
    });

    it('triggers satisfying jump with squash and stretch relaxation', () => {
      const engine = new GameplayRunnerEngine(DEFAULT_SIMULATION_CONFIG, 1080, 1920);
      const jumped = engine.triggerJump();

      expect(jumped).toBe(true);
      expect(engine.isGrounded).toBe(false);
      expect(engine.playerVy).toBeLessThan(0); // Upwards velocity
      expect(engine.squashX).toBeLessThan(1); // Squashed horizontally
      expect(engine.squashY).toBeGreaterThan(1); // Stretched vertically
    });

    it('switches celestial presets and recalculates gravity correctly', () => {
      const engine = new GameplayRunnerEngine(DEFAULT_SIMULATION_CONFIG, 1080, 1920);
      expect(engine.getTelemetry().gravityMps2).toBe(1.62);

      engine.updateConfig({ preset: 'MARS_DUNES' });
      expect(engine.getTelemetry().gravityMps2).toBe(3.72);

      engine.updateConfig({ preset: 'EUROPA_ICE' });
      expect(engine.getTelemetry().gravityMps2).toBe(1.31);
    });

    it('AI Autopilot executes jumps over procedural hazards autonomously', () => {
      const engine = new GameplayRunnerEngine(
        { ...DEFAULT_SIMULATION_CONFIG, autoPilot: true },
        1080,
        1920,
      );

      // Simulate a 5-second continuous run with autopilot
      for (let i = 0; i < 300; i++) {
        engine.step(1 / 60);
      }

      // Autopilot should have accumulated distance without permanently falling
      expect(engine.worldDistance).toBeGreaterThan(50);
      expect(engine.playerY).toBeLessThan(1920);
    });
  });

  describe('3. Gameplay Store & Publication B-Roll Pipeline Integration', () => {
    it('manages modal visibility and saved clips shelf', () => {
      const store = useGameplayStore.getState();
      expect(store.isModalOpen).toBe(false);

      store.openModal();
      expect(useGameplayStore.getState().isModalOpen).toBe(true);

      const mockClip = {
        id: 'clip-1',
        preset: 'MOON_PARKOUR' as const,
        avatar: 'COSMIC_SPHERE' as const,
        durationSec: 15,
        videoBlobUrl: 'blob:http://localhost:3000/mock-video-1',
        sizeBytes: 4_500_000,
        createdAt: new Date().toISOString(),
        aspectRatio: '9:16' as const,
      };

      store.addClip(mockClip);
      expect(useGameplayStore.getState().savedClips).toHaveLength(1);
      expect(useGameplayStore.getState().activeClip?.id).toBe('clip-1');

      store.closeModal();
      expect(useGameplayStore.getState().isModalOpen).toBe(false);
    });

    it('attaches generated gameplay video directly to active publication project as background B-roll', () => {
      const store = useGameplayStore.getState();
      const pubStore = usePublicationStore.getState();

      expect(pubStore.currentProject?.brollVideoUrl).toBeUndefined();

      const mockClip = {
        id: 'clip-mars-1',
        preset: 'MARS_DUNES' as const,
        avatar: 'LUNAR_ROVER' as const,
        durationSec: 15,
        videoBlobUrl: 'blob:http://localhost:3000/mars-rover-broll.webm',
        sizeBytes: 5_200_000,
        createdAt: new Date().toISOString(),
        aspectRatio: '9:16' as const,
      };

      store.attachToActiveProject(mockClip);

      const updatedProject = usePublicationStore.getState().currentProject;
      expect(updatedProject?.brollVideoUrl).toBe(
        'blob:http://localhost:3000/mars-rover-broll.webm',
      );
      expect(updatedProject?.brollPreset).toBe('MARS_DUNES');
      expect(updatedProject?.brollDurationSec).toBe(15);
      expect(updatedProject?.localVideoPath).toBe(
        'blob:http://localhost:3000/mars-rover-broll.webm',
      );
    });

    it('deletes clips from shelf properly', () => {
      const store = useGameplayStore.getState();
      const mockClip = {
        id: 'clip-to-delete',
        preset: 'EUROPA_ICE' as const,
        avatar: 'JETPACK_ASTRONAUT' as const,
        durationSec: 10,
        videoBlobUrl: 'blob:http://localhost:3000/europa.webm',
        sizeBytes: 3_000_000,
        createdAt: new Date().toISOString(),
        aspectRatio: '9:16' as const,
      };

      store.addClip(mockClip);
      expect(useGameplayStore.getState().savedClips.some((c) => c.id === 'clip-to-delete')).toBe(
        true,
      );

      store.deleteClip('clip-to-delete');
      expect(useGameplayStore.getState().savedClips.some((c) => c.id === 'clip-to-delete')).toBe(
        false,
      );
    });
  });
});
