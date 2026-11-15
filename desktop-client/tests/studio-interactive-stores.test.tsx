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
import {
  DEFAULT_DEMO_PROJECT,
  INITIAL_DEMO_PROJECTS,
  usePublicationStore,
} from '../src/entities/publication';
import { useSystemInfoStore } from '../src/entities/system-info';
import { StudioActionHeader, StudioSettingsModal } from '../src/widgets/content-factory';

const mockMoonArtifact: ArtifactDomainModel = {
  id: 'apollo-11-lm-eagle',
  name: 'Apollo 11 Lunar Module (Eagle)',
  missionName: 'Apollo 11',
  celestialBody: 'moon',
  artifactType: 'LANDER',
  operationalStatus: 'DORMANT',
  previewImageUrl: 'https://images.nasa.gov/apollo11.jpg',
  photos: [],
  coordinates: { latitude: 0.67, longitude: 23.47, locationName: 'Tranquility Base, Moon' },
};

const mockMarsArtifact: ArtifactDomainModel = {
  id: 'opportunity-rover',
  name: 'Opportunity Rover (MER-B)',
  missionName: 'Mars Exploration Rover',
  celestialBody: 'mars',
  artifactType: 'ROVER',
  operationalStatus: 'DORMANT',
  previewImageUrl: 'https://images.nasa.gov/oppy.jpg',
  photos: [],
  coordinates: { latitude: -1.94, longitude: 354.47, locationName: 'Perseverance Valley, Mars' },
};

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  queryClient.setQueryData(ARTIFACT_QUERY_KEYS.featured(), [mockMarsArtifact, mockMoonArtifact]);

  return render(
    <MemoryRouter>
      <ChakraProvider value={defaultSystem}>
        <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
      </ChakraProvider>
    </MemoryRouter>,
  );
}

describe('Zustand Stores & StudioActionHeader Interactive Flow', () => {
  beforeEach(() => {
    usePublicationStore.setState({
      currentProject: { ...INITIAL_DEMO_PROJECTS[0] },
      projects: [...INITIAL_DEMO_PROJECTS],
    });
    useArtifactStore.setState({
      selectedPlanet: 'mars',
      selectedArtifactId: 'opportunity-rover',
      selectedArtifact: mockMarsArtifact,
    });
    useSystemInfoStore.setState({
      ffmpegStatus: { installed: true, version: '6.1.1', path: 'C:\\ffmpeg\\ffmpeg.exe' },
    });
    vi.spyOn(artifactRepository, 'listFeaturedArtifacts').mockResolvedValue([
      mockMarsArtifact,
      mockMoonArtifact,
    ]);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  describe('usePublicationStore', () => {
    it('initializes currentProject with INITIAL_DEMO_PROJECTS[0]', () => {
      const state = usePublicationStore.getState();
      expect(state.currentProject).toBeDefined();
      expect(state.currentProject?.id).toBe(DEFAULT_DEMO_PROJECT.id);
      expect(state.currentProject?.artifactId).toBe('opportunity-rover');
    });

    it('updates renderTimeoutSec safely when currentProject exists', () => {
      usePublicationStore.getState().setRenderTimeout(90);
      expect(usePublicationStore.getState().currentProject?.renderTimeoutSec).toBe(90);
    });

    it('safely recovers and initializes currentProject when setRenderTimeout is called on null', () => {
      usePublicationStore.setState({ currentProject: null });
      expect(usePublicationStore.getState().currentProject).toBeNull();

      usePublicationStore.getState().setRenderTimeout(120);
      const restored = usePublicationStore.getState().currentProject;
      expect(restored).toBeDefined();
      expect(restored?.renderTimeoutSec).toBe(120);
      expect(restored?.artifactId).toBe(DEFAULT_DEMO_PROJECT.artifactId);
    });

    it('updates artifact and celestial body seamlessly via setCurrentProjectArtifact', () => {
      usePublicationStore.getState().setCurrentProjectArtifact(
        'apollo-11-lm-eagle',
        'Apollo 11 Lunar Module (Eagle)',
        'moon',
      );
      const proj = usePublicationStore.getState().currentProject;
      expect(proj?.artifactId).toBe('apollo-11-lm-eagle');
      expect(proj?.artifactName).toBe('Apollo 11 Lunar Module (Eagle)');
      expect(proj?.celestialBody).toBe('moon');
    });
  });

  describe('useArtifactStore', () => {
    it('defaults selectedPlanet to mars matching Opportunity Rover', () => {
      expect(useArtifactStore.getState().selectedPlanet).toBe('mars');
    });

    it('supports setSelectedPlanet switching', () => {
      useArtifactStore.getState().setSelectedPlanet('moon');
      expect(useArtifactStore.getState().selectedPlanet).toBe('moon');

      useArtifactStore.getState().setSelectedPlanet('mars');
      expect(useArtifactStore.getState().selectedPlanet).toBe('mars');
    });

    it('updates selectedPlanet to match artifact.celestialBody on selectArtifact', () => {
      useArtifactStore.getState().selectArtifact(mockMoonArtifact);
      expect(useArtifactStore.getState().selectedArtifactId).toBe('apollo-11-lm-eagle');
      expect(useArtifactStore.getState().selectedPlanet).toBe('moon');
      expect(useArtifactStore.getState().selectedArtifact?.name).toBe('Apollo 11 Lunar Module (Eagle)');

      useArtifactStore.getState().selectArtifact(mockMarsArtifact);
      expect(useArtifactStore.getState().selectedArtifactId).toBe('opportunity-rover');
      expect(useArtifactStore.getState().selectedPlanet).toBe('mars');
    });
  });

  describe('StudioActionHeader Component Interactions', () => {
    it('renders current project title and planet switcher', async () => {
      renderWithProviders(<StudioActionHeader onOpenPublishModal={vi.fn()} />);

      await waitFor(() => {
        expect(screen.getAllByText(/Opportunity Rover/i)[0]).toBeDefined();
        expect(screen.getByRole('button', { name: /Місяць/i })).toBeDefined();
        expect(screen.getByRole('button', { name: /Марс/i })).toBeDefined();
      });
    });

    it('switches to Moon on click, updating both stores reactively', async () => {
      renderWithProviders(<StudioActionHeader onOpenPublishModal={vi.fn()} />);

      const moonBtn = screen.getByRole('button', { name: /Місяць/i });
      fireEvent.click(moonBtn);

      await waitFor(() => {
        expect(useArtifactStore.getState().selectedPlanet).toBe('moon');
        expect(useArtifactStore.getState().selectedArtifactId).toBe('apollo-11-lm-eagle');
        expect(usePublicationStore.getState().currentProject?.celestialBody).toBe('moon');
        expect(usePublicationStore.getState().currentProject?.artifactId).toBe('apollo-11-lm-eagle');
        expect(screen.getAllByText(/Apollo 11/i)[0]).toBeDefined();
      });
    });

    it('updates GPU Render Timeout when preset buttons are clicked', async () => {
      renderWithProviders(<StudioActionHeader onOpenPublishModal={vi.fn()} />);

      const timeout30Btn = screen.getByRole('button', { name: /30с/i });
      fireEvent.click(timeout30Btn);
      expect(usePublicationStore.getState().currentProject?.renderTimeoutSec).toBe(30);

      const timeout40Btn = screen.getByRole('button', { name: /40с \(Дефолт\)/i });
      fireEvent.click(timeout40Btn);
      expect(usePublicationStore.getState().currentProject?.renderTimeoutSec).toBe(40);

      const timeout90Btn = screen.getByRole('button', { name: /90–120с/i });
      fireEvent.click(timeout90Btn);
      expect(usePublicationStore.getState().currentProject?.renderTimeoutSec).toBe(90);
    });

    it('triggers Fast Render / FFmpeg execution and updates project status', async () => {
      renderWithProviders(<StudioActionHeader onOpenPublishModal={vi.fn()} />);

      const renderBtn = screen.getByRole('button', { name: /Змонтувати відео через FFmpeg/i });
      expect(renderBtn).toBeDefined();

      fireEvent.click(renderBtn);

      await waitFor(() => {
        expect(usePublicationStore.getState().currentProject?.status).toBe('READY');
        expect(screen.getByText('🟢 READY')).toBeDefined();
      });
    });

    it('triggers settings modal and updates GPU Render Timeout when range slider is dragged', async () => {
      const onOpenSettings = vi.fn();
      renderWithProviders(
        <>
          <StudioActionHeader onOpenPublishModal={vi.fn()} onOpenSettingsModal={onOpenSettings} />
          <StudioSettingsModal isOpen={true} onClose={vi.fn()} />
        </>,
      );

      const settingsBtn = screen.getByRole('button', { name: 'Налаштування студії' });
      fireEvent.click(settingsBtn);
      expect(onOpenSettings).toHaveBeenCalledTimes(1);

      const slider = screen.getByLabelText(/GPU Render Timeout slider/i);
      fireEvent.change(slider, { target: { value: '180' } });

      expect(usePublicationStore.getState().currentProject?.renderTimeoutSec).toBe(180);
      expect(screen.getByText('180 секунд')).toBeDefined();
    });
  });

  describe('StudioSettingsModal Detailed Diagnostics', () => {
    it('renders dialog with GPU slider, presets, and FFmpeg diagnostics status', async () => {
      renderWithProviders(<StudioSettingsModal isOpen={true} onClose={vi.fn()} />);

      // Dialog title and badges
      expect(screen.getByText('Налаштування рендеру та студії')).toBeDefined();
      expect(screen.getByText('Studio Settings')).toBeDefined();

      // GPU slider and timeout preset buttons
      const slider = screen.getByLabelText(/GPU Render Timeout slider/i);
      expect(slider).toBeDefined();

      // Click preset 120s inside modal
      const preset120 = screen.getByRole('button', { name: /120с/i });
      fireEvent.click(preset120);
      expect(usePublicationStore.getState().currentProject?.renderTimeoutSec).toBe(120);

      // FFmpeg engine diagnostics
      expect(screen.getAllByText(/FFmpeg Engine/i)[0]).toBeDefined();
      expect(screen.getByText(/FFmpeg Встановлено/i)).toBeDefined();
      expect(screen.getByText(/6.1.1/i)).toBeDefined();

      // 3D Map coordinates sync
      expect(screen.getByText(/Синхронізація з 3D Мапою/i)).toBeDefined();
    });

    it('does not render when isOpen is false', () => {
      renderWithProviders(<StudioSettingsModal isOpen={false} onClose={vi.fn()} />);
      expect(screen.queryByText('Детальні Налаштування Студії')).toBeNull();
    });
  });
});

