import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ARTIFACT_QUERY_KEYS,
  type ArtifactDomainModel,
  artifactRepository,
  useArtifactStore,
} from '../src/entities/artifact';
import { INITIAL_DEMO_PROJECTS, usePublicationStore } from '../src/entities/publication';
import { usePngTuberEditorStore } from '../src/features/pngtuber-editor';
import { localFolderConnector } from '../src/shared/api';
import { ContentFactoryWidget, ShortsMonitorPreview } from '../src/widgets/content-factory';

const mockOpportunityArtifact: ArtifactDomainModel = {
  id: 'opportunity-rover',
  name: 'Opportunity Rover (MER-B)',
  missionName: 'Mars Exploration Rover',
  celestialBody: 'mars',
  artifactType: 'ROVER',
  operationalStatus: 'DORMANT',
  previewImageUrl: 'https://images.nasa.gov/oppy.jpg',
  photos: [],
  coordinates: {
    latitude: -1.94,
    longitude: 354.47,
    locationName: 'Perseverance Valley, Mars',
  },
};

const mockApolloArtifact: ArtifactDomainModel = {
  id: 'apollo-11-lm-eagle',
  name: 'Apollo 11 Lunar Module (Eagle)',
  missionName: 'Apollo 11',
  celestialBody: 'moon',
  artifactType: 'LANDER',
  operationalStatus: 'DORMANT',
  previewImageUrl: 'https://images.nasa.gov/apollo11.jpg',
  photos: [],
  coordinates: {
    latitude: 0.67,
    longitude: 23.47,
    locationName: 'Tranquility Base, Moon',
  },
};

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  queryClient.setQueryData(ARTIFACT_QUERY_KEYS.featured(), [
    mockOpportunityArtifact,
    mockApolloArtifact,
  ]);

  return render(
    <MemoryRouter>
      <ChakraProvider value={defaultSystem}>
        <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
      </ChakraProvider>
    </MemoryRouter>,
  );
}

describe('Studio ShortsMonitorPreview & ContentFactoryWidget Integration Tests', () => {
  let clipboardWriteMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    clipboardWriteMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: clipboardWriteMock,
      },
      writable: true,
      configurable: true,
    });

    usePublicationStore.setState({
      currentProject: { ...INITIAL_DEMO_PROJECTS[0] },
      projects: [...INITIAL_DEMO_PROJECTS],
    });

    useArtifactStore.setState({
      selectedPlanet: 'mars',
      selectedArtifactId: 'opportunity-rover',
      selectedArtifact: mockOpportunityArtifact,
    });

    usePngTuberEditorStore.setState({
      selectedEmotion: null,
    });

    vi.spyOn(artifactRepository, 'listFeaturedArtifacts').mockResolvedValue([
      mockOpportunityArtifact,
      mockApolloArtifact,
    ]);

    vi.spyOn(localFolderConnector, 'publishVideo').mockResolvedValue({
      success: true,
      externalPostId: 'oppy-test',
      externalPostUrl: 'C:\\Videos\\CosmoLost\\oppy.mp4',
      timestamp: new Date().toISOString(),
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  describe('1. ShortsMonitorPreview Canvas & Positioning', () => {
    it('renders 9:16 smartphone preview canvas with header, telemetry HUD, subtitles, and avatar', () => {
      renderWithProviders(<ShortsMonitorPreview />);

      // Streamlined Monitor Header
      expect(screen.getByText('Live 9:16 Shorts Монітор')).toBeDefined();
      expect(screen.getByText('1080×1920')).toBeDefined();

      // Telemetry HUD overlay
      expect(screen.getAllByText(/Opportunity Rover/i)[0]).toBeDefined();
      expect(screen.getByText(/MARS • DSN 60 FPS/i)).toBeDefined();

      // Word Magnet hook badge
      expect(screen.getByText('💔 ОСТАННІ СЛОВА')).toBeDefined();

      // Kinetic Subtitles in Safe Zone
      expect(screen.getByText(/розраховували/i)).toBeDefined();

      // Playback scrubber bar & timecode display
      expect(screen.getByRole('slider', { name: /Відео скрабер/i })).toBeDefined();
      expect(screen.getByText(/0\.0s \//i)).toBeDefined();

      // Avatar Emotion Quick-Bar buttons
      expect(screen.getByRole('button', { name: 'IDLE' })).toBeDefined();
      expect(screen.getByRole('button', { name: 'EXPERT' })).toBeDefined();
      expect(screen.getByRole('button', { name: 'SHOCK' })).toBeDefined();
      expect(screen.getByRole('button', { name: 'HYPE' })).toBeDefined();
      expect(screen.getByRole('button', { name: /Редактор 8 спрайтів/i })).toBeDefined();
    });

    it('allows changing avatar emotions via the quick-bar buttons', () => {
      renderWithProviders(<ShortsMonitorPreview />);

      const shockBtn = screen.getByRole('button', { name: 'SHOCK' });
      fireEvent.click(shockBtn);
      expect(usePngTuberEditorStore.getState().selectedEmotion).toBe('SHOCK');

      const hypeBtn = screen.getByRole('button', { name: 'HYPE' });
      fireEvent.click(hypeBtn);
      expect(usePngTuberEditorStore.getState().selectedEmotion).toBe('HYPE');

      const idleBtn = screen.getByRole('button', { name: 'IDLE' });
      fireEvent.click(idleBtn);
      expect(usePngTuberEditorStore.getState().selectedEmotion).toBe('IDLE');
    });

    it('toggles playback simulation using Play/Pause button', () => {
      renderWithProviders(<ShortsMonitorPreview />);

      const playBtn = screen.getByRole('button', { name: /Превʼю/i });
      fireEvent.click(playBtn);

      // Button toggles to Pause
      expect(screen.getByRole('button', { name: /Пауза/i })).toBeDefined();

      // Toggle back to Play
      const pauseBtn = screen.getByRole('button', { name: /Пауза/i });
      fireEvent.click(pauseBtn);
      expect(screen.getByRole('button', { name: /Превʼю/i })).toBeDefined();
    });
  });

  describe('2. Safe Zones Overlay & Platform Presets', () => {
    it('defaults to Safe Zones OFF for unobscured preview and toggles subtle guidelines ON', () => {
      renderWithProviders(<ShortsMonitorPreview />);

      // Safe Zones is OFF by default (Bug 5 fix: uncluttered default view)
      expect(screen.getByText('Safe Zones: OFF')).toBeDefined();
      expect(screen.queryByText(/TOP SAFE LINE/i)).toBeNull();

      // Toggle Safe Zones ON
      const toggleBtn = screen.getByRole('button', { name: /Safe Zones: OFF/i });
      fireEvent.click(toggleBtn);

      expect(screen.getByText('Safe Zones: ON')).toBeDefined();
      expect(screen.getByText(/TOP SAFE LINE \(YOUTUBE\)/i)).toBeDefined();
      expect(screen.getByText('BOTTOM SAFE LINE')).toBeDefined();
      expect(screen.getByText('@cosmolost')).toBeDefined();
      expect(screen.getByText('🛡️ БЕЗПЕЧНА ЗОНА 9:16')).toBeDefined();
    });

    it('toggles Safe Zones OFF and removes dead zone overlays, then toggles ON again', () => {
      renderWithProviders(<ShortsMonitorPreview />);

      // Toggle ON first
      const safeZoneOffBtn = screen.getByRole('button', { name: /Safe Zones: OFF/i });
      fireEvent.click(safeZoneOffBtn);

      expect(screen.getByText('Safe Zones: ON')).toBeDefined();
      expect(screen.getByText(/TOP SAFE LINE \(YOUTUBE\)/i)).toBeDefined();

      // Now Safe Zones should toggle OFF
      const safeZoneBtn = screen.getByRole('button', { name: /Safe Zones: ON/i });
      fireEvent.click(safeZoneBtn);

      expect(screen.getByText('Safe Zones: OFF')).toBeDefined();
      expect(screen.queryByText(/TOP SAFE LINE/i)).toBeNull();
      expect(screen.queryByText(/BOTTOM SAFE LINE/i)).toBeNull();
      expect(screen.queryByText(/🛡️ БЕЗПЕЧНА ЗОНА 9:16/i)).toBeNull();

      // Platform buttons (Shorts, TikTok, Reels) should also be hidden when Safe Zones is OFF
      expect(screen.queryByRole('button', { name: /^TikTok$/i })).toBeNull();

      // Toggle back ON
      const safeZoneToggleOnBtn = screen.getByRole('button', { name: /Safe Zones: OFF/i });
      fireEvent.click(safeZoneToggleOnBtn);

      expect(screen.getByText('Safe Zones: ON')).toBeDefined();
      expect(screen.getByText(/TOP SAFE LINE \(YOUTUBE\)/i)).toBeDefined();
      expect(screen.getByText('BOTTOM SAFE LINE')).toBeDefined();
    });

    it('switches platform presets between Shorts, TikTok, and Reels updating dead zone labels', () => {
      renderWithProviders(<ShortsMonitorPreview />);

      // Turn Safe Zones ON to access platform buttons
      const toggleBtn = screen.getByRole('button', { name: /Safe Zones: OFF/i });
      fireEvent.click(toggleBtn);

      // Initial: Shorts (YouTube)
      expect(screen.getByText(/TOP SAFE LINE \(YOUTUBE\)/i)).toBeDefined();

      // Switch to TikTok
      const tiktokBtn = screen.getByRole('button', { name: /^TikTok$/i });
      fireEvent.click(tiktokBtn);
      expect(screen.getByText(/TOP SAFE LINE \(TIKTOK\)/i)).toBeDefined();

      // Switch to Reels (Instagram)
      const reelsBtn = screen.getByRole('button', { name: /^Reels$/i });
      fireEvent.click(reelsBtn);
      expect(screen.getByText(/TOP SAFE LINE \(INSTAGRAM\)/i)).toBeDefined();

      // Switch back to Shorts
      const shortsBtn = screen.getByRole('button', { name: /^Shorts$/i });
      fireEvent.click(shortsBtn);
      expect(screen.getByText(/TOP SAFE LINE \(YOUTUBE\)/i)).toBeDefined();
    });
  });

  describe('3. Pillow-Box 4:3 Blur Mode Toggle', () => {
    it('defaults to Pillow-Box ON showing blurred background and crisp 4:3 archival photo', () => {
      renderWithProviders(<ShortsMonitorPreview />);

      expect(screen.getByText('Pillow-Box: ON')).toBeDefined();
      expect(screen.getByAltText('Blurred Background')).toBeDefined();
      expect(screen.getByText(/📷 NASA Archival • 4:3 Original/i)).toBeDefined();
    });

    it('toggles Pillow-Box OFF and unmounts blurred background, then toggles ON again', () => {
      renderWithProviders(<ShortsMonitorPreview />);

      const pillowBoxBtn = screen.getByRole('button', { name: /Pillow-Box: ON/i });
      fireEvent.click(pillowBoxBtn);

      // Pillow-Box is now OFF
      expect(screen.getByText('Pillow-Box: OFF')).toBeDefined();
      expect(screen.queryByAltText('Blurred Background')).toBeNull();
      expect(screen.queryByText(/📷 NASA Archival • 4:3 Original/i)).toBeNull();

      // Full photo image is rendered instead
      expect(screen.getByAltText(/Opportunity Rover \(MER-B\)/i)).toBeDefined();

      // Toggle back ON
      const pillowBoxOffBtn = screen.getByRole('button', { name: /Pillow-Box: OFF/i });
      fireEvent.click(pillowBoxOffBtn);

      expect(screen.getByText('Pillow-Box: ON')).toBeDefined();
      expect(screen.getByAltText('Blurred Background')).toBeDefined();
      expect(screen.getByText(/📷 NASA Archival • 4:3 Original/i)).toBeDefined();
    });
  });

  describe('4. Action Buttons Under Monitor', () => {
    it('copies SEO description and hashtags to clipboard with visual feedback', async () => {
      renderWithProviders(<ShortsMonitorPreview />);

      const copySeoBtn = screen.getByRole('button', { name: 'Копіювати SEO опис' });
      fireEvent.click(copySeoBtn);

      await waitFor(() => {
        expect(clipboardWriteMock).toHaveBeenCalledTimes(1);
        expect(screen.getByText('Опис скопійовано!')).toBeDefined();
      });

      const copiedText = clipboardWriteMock.mock.calls[0][0];
      expect(copiedText).toContain('#Apollo11');
      expect(copiedText).toContain('#CosmoLost');
    });

    it('copies Pin comment to clipboard with visual feedback', async () => {
      renderWithProviders(<ShortsMonitorPreview />);

      const copyPinBtn = screen.getByRole('button', { name: 'Копіювати Pin' });
      fireEvent.click(copyPinBtn);

      await waitFor(() => {
        expect(clipboardWriteMock).toHaveBeenCalledTimes(1);
        expect(screen.getByText('Pin скопійовано!')).toBeDefined();
      });

      const copiedPinText = clipboardWriteMock.mock.calls[0][0];
      expect(copiedPinText).toContain('Opportunity');
    });

    it('triggers Open Output Folder via localFolderConnector with visual feedback', async () => {
      renderWithProviders(<ShortsMonitorPreview />);

      const openFolderBtn = screen.getByRole('button', {
        name: 'Відкрити папку з готовим відео',
      });
      fireEvent.click(openFolderBtn);

      await waitFor(() => {
        expect(localFolderConnector.publishVideo).toHaveBeenCalledTimes(1);
        expect(screen.getByText('Папку відкрито в OS Explorer')).toBeDefined();
      });
    });
  });

  describe('5. ContentFactoryWidget Split-Screen & ShortsMonitor Integration', () => {
    it('renders ContentFactoryWidget with left workspace and right 9:16 Shorts Monitor simultaneously', async () => {
      renderWithProviders(<ContentFactoryWidget />);

      // Top Studio badges
      expect(screen.getByText('Local-First Studio V2')).toBeDefined();
      expect(screen.getAllByText('1080×1920 • 60 FPS')[0]).toBeDefined();

      // Right Pane: ShortsMonitorPreview is mounted (Safe Zones OFF by default)
      expect(screen.getAllByText('Live 9:16 Shorts Монітор')[0]).toBeDefined();
      expect(screen.getByText('Safe Zones: OFF')).toBeDefined();

      // Left Pane: Default is NodeGraphCanvas
      expect(screen.getByText(/Нодовий граф \(@xyflow\/react\)/i)).toBeDefined();

      // Switch left pane to Panels view
      const scriptBtn = screen.getByRole('button', { name: /Скрипт/i });
      fireEvent.click(scriptBtn);

      await waitFor(() => {
        expect(screen.getByText(/Генератор SMM-Сценаріїв/i)).toBeDefined();
        expect(screen.getByText(/Дистрибуція та Мультипостинг/i)).toBeDefined();
      });

      // Right pane ShortsMonitorPreview remains intact
      expect(screen.getAllByText('Live 9:16 Shorts Монітор')[0]).toBeDefined();

      // Switch left pane to Artifacts catalog view
      const artifactsBtn = screen.getByRole('button', { name: /Артефакти/i });
      fireEvent.click(artifactsBtn);

      await waitFor(() => {
        expect(screen.getByText(/Каталог артефактів NASA/i)).toBeDefined();
      });

      // ShortsMonitorPreview still renders right alongside
      expect(screen.getAllByText('Live 9:16 Shorts Монітор')[0]).toBeDefined();
    });
  });
});
