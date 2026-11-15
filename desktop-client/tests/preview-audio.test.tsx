import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ARTIFACT_QUERY_KEYS, type ArtifactDomainModel, useArtifactStore } from '../src/entities/artifact';
import { INITIAL_DEMO_PROJECTS, usePublicationStore } from '../src/entities/publication';
import { usePreviewAudio } from '../src/features/media-engine';
import { ShortsMonitorPreview } from '../src/widgets/content-factory';

const mockArtifact: ArtifactDomainModel = {
  id: 'opportunity-rover',
  name: 'Opportunity Rover',
  missionName: 'Mars Exploration',
  celestialBody: 'mars',
  artifactType: 'ROVER',
  operationalStatus: 'DORMANT',
  previewImageUrl: 'https://images.nasa.gov/oppy.jpg',
  photos: [],
  coordinates: { latitude: -1.94, longitude: 354.47, locationName: 'Mars' },
};

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  queryClient.setQueryData(ARTIFACT_QUERY_KEYS.featured(), [mockArtifact]);

  return render(
    <MemoryRouter>
      <ChakraProvider value={defaultSystem}>
        <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
      </ChakraProvider>
    </MemoryRouter>,
  );
}

describe('Cosmic Web Audio Preview & Synthesizer Engine', () => {
  let mockResume: ReturnType<typeof vi.fn>;
  let mockCreateGain: ReturnType<typeof vi.fn>;
  let mockCreateOscillator: ReturnType<typeof vi.fn>;
  let mockCreateBiquadFilter: ReturnType<typeof vi.fn>;
  let mockCreateDynamicsCompressor: ReturnType<typeof vi.fn>;
  let mockCreateAnalyser: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockResume = vi.fn().mockResolvedValue(undefined);
    const mockGainNode = {
      gain: {
        value: 1,
        setValueAtTime: vi.fn(),
        setTargetAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      disconnect: vi.fn(),
    };
    mockCreateGain = vi.fn().mockReturnValue(mockGainNode);

    const mockOscNode = {
      type: 'sine',
      frequency: { setValueAtTime: vi.fn() },
      detune: { setValueAtTime: vi.fn() },
      connect: vi.fn(),
      disconnect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
    mockCreateOscillator = vi.fn().mockReturnValue(mockOscNode);

    const mockFilterNode = {
      type: 'lowpass',
      frequency: { setValueAtTime: vi.fn() },
      Q: { setValueAtTime: vi.fn() },
      connect: vi.fn(),
      disconnect: vi.fn(),
    };
    mockCreateBiquadFilter = vi.fn().mockReturnValue(mockFilterNode);

    const mockCompressorNode = {
      threshold: { setValueAtTime: vi.fn() },
      knee: { setValueAtTime: vi.fn() },
      ratio: { setValueAtTime: vi.fn() },
      attack: { setValueAtTime: vi.fn() },
      release: { setValueAtTime: vi.fn() },
      connect: vi.fn(),
      disconnect: vi.fn(),
    };
    mockCreateDynamicsCompressor = vi.fn().mockReturnValue(mockCompressorNode);

    const mockAnalyserNode = {
      fftSize: 64,
      smoothingTimeConstant: 0.8,
      frequencyBinCount: 32,
      getByteFrequencyData: vi.fn((arr: Uint8Array) => {
        arr.fill(120);
      }),
      connect: vi.fn(),
      disconnect: vi.fn(),
    };
    mockCreateAnalyser = vi.fn().mockReturnValue(mockAnalyserNode);

    class MockAudioContext {
      state = 'suspended';
      currentTime = 0;
      destination = {};
      resume = mockResume;
      close = vi.fn().mockResolvedValue(undefined);
      createGain = mockCreateGain;
      createOscillator = mockCreateOscillator;
      createBiquadFilter = mockCreateBiquadFilter;
      createDynamicsCompressor = mockCreateDynamicsCompressor;
      createAnalyser = mockCreateAnalyser;
    }

    Object.defineProperty(window, 'AudioContext', {
      value: MockAudioContext,
      writable: true,
      configurable: true,
    });

    usePublicationStore.setState({
      currentProject: { ...INITIAL_DEMO_PROJECTS[0], targetDurationSec: 40 },
    });
    useArtifactStore.setState({
      selectedArtifactId: 'opportunity-rover',
      selectedArtifact: mockArtifact,
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders sound controls (mute button, volume slider, sound wave) in preview toolbar', () => {
    renderWithProviders(<ShortsMonitorPreview />);

    // Play/Pause button
    const playBtn = screen.getByRole('button', { name: /превʼю/i });
    expect(playBtn).toBeDefined();

    // Mute button
    const muteBtn = screen.getByRole('button', { name: /вимкнути звук/i });
    expect(muteBtn).toBeDefined();

    // Volume input range
    const volumeInput = screen.getByLabelText(/гучність аудіо/i);
    expect(volumeInput).toBeDefined();

    // Reset button
    const resetBtn = screen.getByRole('button', { name: /скинути таймкод/i });
    expect(resetBtn).toBeDefined();
  });

  it('starts audio context and plays sound when Play button is clicked', async () => {
    renderWithProviders(<ShortsMonitorPreview />);

    const playBtn = screen.getByRole('button', { name: /превʼю/i });
    fireEvent.click(playBtn);

    // AudioContext should be resumed on user interaction
    await waitFor(() => {
      expect(mockResume).toHaveBeenCalled();
    });

    // Pause button is now active
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /пауза/i })).toBeDefined();
    });
  });

  it('toggles mute/unmute and updates audio icon', async () => {
    renderWithProviders(<ShortsMonitorPreview />);

    const muteBtn = screen.getByRole('button', { name: /вимкнути звук/i });
    fireEvent.click(muteBtn);

    // Should now show unmute button
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /увімкнути звук/i })).toBeDefined();
    });

    // Clicking again unmutes
    fireEvent.click(screen.getByRole('button', { name: /увімкнути звук/i }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /вимкнути звук/i })).toBeDefined();
    });
  });

  it('updates volume when slider value changes', () => {
    renderWithProviders(<ShortsMonitorPreview />);

    const volumeInput = screen.getByLabelText(/гучність аудіо/i) as HTMLInputElement;
    fireEvent.change(volumeInput, { target: { value: '0.4' } });

    expect(volumeInput.value).toBe('0.4');
  });
});
