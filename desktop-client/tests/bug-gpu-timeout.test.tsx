import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type React from 'react';
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
  coordinates: { latitude: 0.67408, longitude: 23.47297, locationName: 'Tranquility Base, Moon' },
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

  queryClient.setQueryData(ARTIFACT_QUERY_KEYS.featured(), [mockMoonArtifact, mockMarsArtifact]);

  return render(
    <MemoryRouter>
      <ChakraProvider value={defaultSystem}>
        <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
      </ChakraProvider>
    </MemoryRouter>,
  );
}

describe('Bug 1 QA Verification: GPU Render Timeout Buttons and Range Slider', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    usePublicationStore.setState({
      currentProject: {
        ...INITIAL_DEMO_PROJECTS[0],
        renderTimeoutSec: 40,
        status: 'DRAFT',
      },
      projects: [...INITIAL_DEMO_PROJECTS],
    });
    useArtifactStore.setState({
      selectedPlanet: 'moon',
      selectedArtifactId: 'apollo-11-lm-eagle',
      selectedArtifact: mockMoonArtifact,
    });
    vi.spyOn(artifactRepository, 'listFeaturedArtifacts').mockResolvedValue([
      mockMoonArtifact,
      mockMarsArtifact,
    ]);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('clicking each timeout button (30s, 40s, 90-120s, 180s) in StudioActionHeader reactively updates renderTimeoutSec and header badge', async () => {
    renderWithProviders(
      <StudioActionHeader onOpenPublishModal={vi.fn()} onOpenSettingsModal={vi.fn()} />,
    );

    // Initial timeout is 40s
    const badge = screen.getByTestId('header-timeout-badge');
    expect(badge.textContent).toBe('40с');
    expect(usePublicationStore.getState().currentProject?.renderTimeoutSec).toBe(40);

    // 1. Click 30s button
    const btn30 = screen.getByRole('button', { name: '30с' });
    fireEvent.click(btn30);
    expect(usePublicationStore.getState().currentProject?.renderTimeoutSec).toBe(30);
    expect(badge.textContent).toBe('30с');

    // 2. Click 40s button
    const btn40 = screen.getByRole('button', { name: '40с (Дефолт)' });
    fireEvent.click(btn40);
    expect(usePublicationStore.getState().currentProject?.renderTimeoutSec).toBe(40);
    expect(badge.textContent).toBe('40с');

    // 3. Click 90-120s button (first click sets 90s)
    const btn90to120 = screen.getByRole('button', { name: '90–120с' });
    fireEvent.click(btn90to120);
    expect(usePublicationStore.getState().currentProject?.renderTimeoutSec).toBe(90);
    expect(badge.textContent).toBe('90с');

    // 4. Click 90-120s button again (toggles to 120s)
    fireEvent.click(btn90to120);
    expect(usePublicationStore.getState().currentProject?.renderTimeoutSec).toBe(120);
    expect(badge.textContent).toBe('120с');

    // 5. Click 180s button
    const btn180 = screen.getByRole('button', { name: '180с' });
    fireEvent.click(btn180);
    expect(usePublicationStore.getState().currentProject?.renderTimeoutSec).toBe(180);
    expect(badge.textContent).toBe('180с');
  });

  it('clicking preset chips in StudioSettingsModal immediately updates the store, the modal badge, and the header badge', async () => {
    renderWithProviders(
      <>
        <StudioActionHeader onOpenPublishModal={vi.fn()} onOpenSettingsModal={vi.fn()} />
        <StudioSettingsModal isOpen={true} onClose={vi.fn()} />
      </>,
    );

    const headerBadge = screen.getByTestId('header-timeout-badge');
    const modalBadge = screen.getByTestId('modal-timeout-badge');

    expect(headerBadge.textContent).toBe('40с');
    expect(modalBadge.textContent).toBe('40 секунд');

    // Click 30s preset chip
    const preset30 = screen.getByTitle('Встановити таймаут 30с (Експрес)');
    fireEvent.click(preset30);
    expect(usePublicationStore.getState().currentProject?.renderTimeoutSec).toBe(30);
    expect(headerBadge.textContent).toBe('30с');
    expect(modalBadge.textContent).toBe('30 секунд');

    // Click 90s preset chip
    const preset90 = screen.getByTitle('Встановити таймаут 90с (ШІ Сцени)');
    fireEvent.click(preset90);
    expect(usePublicationStore.getState().currentProject?.renderTimeoutSec).toBe(90);
    expect(headerBadge.textContent).toBe('90с');
    expect(modalBadge.textContent).toBe('90 секунд');

    // Click 120s preset chip
    const preset120 = screen.getByTitle('Встановити таймаут 120с (Ultra 60FPS)');
    fireEvent.click(preset120);
    expect(usePublicationStore.getState().currentProject?.renderTimeoutSec).toBe(120);
    expect(headerBadge.textContent).toBe('120с');
    expect(modalBadge.textContent).toBe('120 секунд');

    // Click 180s preset chip
    const preset180 = screen.getByTitle('Встановити таймаут 180с (Complex B-Roll)');
    fireEvent.click(preset180);
    expect(usePublicationStore.getState().currentProject?.renderTimeoutSec).toBe(180);
    expect(headerBadge.textContent).toBe('180с');
    expect(modalBadge.textContent).toBe('180 секунд');

    // Click 40s preset chip
    const preset40 = screen.getByTitle('Встановити таймаут 40с (Дефолт)');
    fireEvent.click(preset40);
    expect(usePublicationStore.getState().currentProject?.renderTimeoutSec).toBe(40);
    expect(headerBadge.textContent).toBe('40с');
    expect(modalBadge.textContent).toBe('40 секунд');
  });

  it('moving the range slider (30-300s) updates renderTimeoutSec reactively in both the modal and header', async () => {
    renderWithProviders(
      <>
        <StudioActionHeader onOpenPublishModal={vi.fn()} onOpenSettingsModal={vi.fn()} />
        <StudioSettingsModal isOpen={true} onClose={vi.fn()} />
      </>,
    );

    const slider = screen.getByTestId('gpu-timeout-slider');
    const headerBadge = screen.getByTestId('header-timeout-badge');
    const modalBadge = screen.getByTestId('modal-timeout-badge');

    // Move slider to 60s
    fireEvent.change(slider, { target: { value: '60' } });
    expect(usePublicationStore.getState().currentProject?.renderTimeoutSec).toBe(60);
    expect(headerBadge.textContent).toBe('60с');
    expect(modalBadge.textContent).toBe('60 секунд');

    // Move slider to 75s
    fireEvent.change(slider, { target: { value: '75' } });
    expect(usePublicationStore.getState().currentProject?.renderTimeoutSec).toBe(75);
    expect(headerBadge.textContent).toBe('75с');
    expect(modalBadge.textContent).toBe('75 секунд');

    // Move slider to 150s via onInput event
    fireEvent.input(slider, { target: { value: '150' } });
    expect(usePublicationStore.getState().currentProject?.renderTimeoutSec).toBe(150);
    expect(headerBadge.textContent).toBe('150с');
    expect(modalBadge.textContent).toBe('150 секунд');

    // Move slider to max 300s
    fireEvent.change(slider, { target: { value: '300' } });
    expect(usePublicationStore.getState().currentProject?.renderTimeoutSec).toBe(300);
    expect(headerBadge.textContent).toBe('300с');
    expect(modalBadge.textContent).toBe('300 секунд');
  });

  it('verifies clamping, resilience and null safety of setRenderTimeout in usePublicationStore', () => {
    // Underflow clamped to 30
    usePublicationStore.getState().setRenderTimeout(10);
    expect(usePublicationStore.getState().currentProject?.renderTimeoutSec).toBe(30);

    // Overflow clamped to 300
    usePublicationStore.getState().setRenderTimeout(500);
    expect(usePublicationStore.getState().currentProject?.renderTimeoutSec).toBe(300);

    // Floating numbers rounded
    usePublicationStore.getState().setRenderTimeout(45.6);
    expect(usePublicationStore.getState().currentProject?.renderTimeoutSec).toBe(46);

    // String numbers parsed correctly
    usePublicationStore.getState().setRenderTimeout('90' as unknown as number);
    expect(usePublicationStore.getState().currentProject?.renderTimeoutSec).toBe(90);

    // NaN / Invalid inputs fallback to 40
    usePublicationStore.getState().setRenderTimeout(Number.NaN);
    expect(usePublicationStore.getState().currentProject?.renderTimeoutSec).toBe(40);

    // Safe recovery when currentProject is null
    usePublicationStore.setState({ currentProject: null });
    expect(usePublicationStore.getState().currentProject).toBeNull();
    usePublicationStore.getState().setRenderTimeout(180);
    expect(usePublicationStore.getState().currentProject?.renderTimeoutSec).toBe(180);
    expect(usePublicationStore.getState().currentProject?.artifactId).toBe(
      DEFAULT_DEMO_PROJECT.artifactId,
    );
  });
});
