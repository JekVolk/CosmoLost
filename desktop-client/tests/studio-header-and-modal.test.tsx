import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type React from 'react';
import { useState } from 'react';
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
import { useNodeGraphStore } from '../src/features/node-editor';
import { useSmartNextTopicStore } from '../src/features/smart-next-topic';
import { tauriCommands } from '../src/shared/api';
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

describe('StudioActionHeader & StudioSettingsModal Component Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    localStorage.clear();
    useSystemInfoStore.getState().resetFfmpegStatus();
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
    vi.useRealTimers();
    localStorage.clear();
    useSystemInfoStore.getState().resetFfmpegStatus();
  });

  describe('StudioActionHeader', () => {
    it('renders project title, DRAFT status badge, and Apollo-11 mission tag', async () => {
      renderWithProviders(
        <StudioActionHeader onOpenPublishModal={vi.fn()} onOpenSettingsModal={vi.fn()} />,
      );

      await waitFor(() => {
        expect(screen.getByText('Opportunity Rover (MER-B)')).toBeDefined();
        expect(screen.getByText('⚪ DRAFT')).toBeDefined();
        expect(screen.getByText(/MISSION:/i)).toBeDefined();
      });
    });

    it('renders correct status badges for RENDERING, READY, and PUBLISHED', () => {
      usePublicationStore.setState({
        currentProject: {
          ...DEFAULT_DEMO_PROJECT,
          status: 'RENDERING',
        },
      });

      const { unmount } = renderWithProviders(
        <StudioActionHeader onOpenPublishModal={vi.fn()} onOpenSettingsModal={vi.fn()} />,
      );
      expect(screen.getByText('🟡 RENDERING')).toBeDefined();
      unmount();

      usePublicationStore.setState({
        currentProject: {
          ...DEFAULT_DEMO_PROJECT,
          status: 'READY',
        },
      });

      const { unmount: unmount2 } = renderWithProviders(
        <StudioActionHeader onOpenPublishModal={vi.fn()} onOpenSettingsModal={vi.fn()} />,
      );
      expect(screen.getByText('🟢 READY')).toBeDefined();
      unmount2();

      usePublicationStore.setState({
        currentProject: {
          ...DEFAULT_DEMO_PROJECT,
          status: 'PUBLISHED',
        },
      });

      renderWithProviders(
        <StudioActionHeader onOpenPublishModal={vi.fn()} onOpenSettingsModal={vi.fn()} />,
      );
      expect(screen.getByText('🚀 PUBLISHED')).toBeDefined();
    });

    it('toggles planet switcher chips between Moon and Mars, updating state and artifact', async () => {
      renderWithProviders(
        <StudioActionHeader onOpenPublishModal={vi.fn()} onOpenSettingsModal={vi.fn()} />,
      );

      const marsBtn = screen.getByRole('button', { name: /Марс \(Mars Orange\)/i });
      fireEvent.click(marsBtn);

      await waitFor(() => {
        expect(useArtifactStore.getState().selectedPlanet).toBe('mars');
        expect(useArtifactStore.getState().selectedArtifactId).toBe('opportunity-rover');
        expect(usePublicationStore.getState().currentProject?.celestialBody).toBe('mars');
      });

      const moonBtn = screen.getByRole('button', { name: /Місяць \(Lunar Blue\)/i });
      fireEvent.click(moonBtn);

      await waitFor(() => {
        expect(useArtifactStore.getState().selectedPlanet).toBe('moon');
        expect(useArtifactStore.getState().selectedArtifactId).toBe('apollo-11-lm-eagle');
        expect(usePublicationStore.getState().currentProject?.celestialBody).toBe('moon');
      });
    });

    it('updates GPU timeout options (30s, 40s, 90-120s, 180s) in the store value', () => {
      renderWithProviders(
        <StudioActionHeader onOpenPublishModal={vi.fn()} onOpenSettingsModal={vi.fn()} />,
      );

      const btn30 = screen.getByRole('button', { name: '30с' });
      fireEvent.click(btn30);
      expect(usePublicationStore.getState().currentProject?.renderTimeoutSec).toBe(30);

      const btn40 = screen.getByRole('button', { name: '40с (Дефолт)' });
      fireEvent.click(btn40);
      expect(usePublicationStore.getState().currentProject?.renderTimeoutSec).toBe(40);

      const btn90to120 = screen.getByRole('button', { name: '90–120с' });
      fireEvent.click(btn90to120);
      expect(usePublicationStore.getState().currentProject?.renderTimeoutSec).toBe(90);

      fireEvent.click(btn90to120);
      expect(usePublicationStore.getState().currentProject?.renderTimeoutSec).toBe(120);

      const btn180 = screen.getByRole('button', { name: '180с' });
      fireEvent.click(btn180);
      expect(usePublicationStore.getState().currentProject?.renderTimeoutSec).toBe(180);
    });

    it('calls onOpenSettingsModal when clicking the Settings button', () => {
      const onOpenSettings = vi.fn();
      renderWithProviders(
        <StudioActionHeader onOpenPublishModal={vi.fn()} onOpenSettingsModal={onOpenSettings} />,
      );

      const settingsBtn = screen.getByRole('button', { name: /Налаштування студії/i });
      fireEvent.click(settingsBtn);
      expect(onOpenSettings).toHaveBeenCalledTimes(1);
    });

    it('triggers Fast render / FFmpeg execution and updates project status', async () => {
      const runPipelineExecutionSpy = vi
        .spyOn(useNodeGraphStore.getState(), 'runPipelineExecution')
        .mockImplementation(async () => {
          await new Promise((resolve) => setTimeout(resolve, 50));
        });

      renderWithProviders(
        <StudioActionHeader onOpenPublishModal={vi.fn()} onOpenSettingsModal={vi.fn()} />,
      );

      const renderBtn = screen.getByRole('button', { name: /Змонтувати відео через FFmpeg/i });
      fireEvent.click(renderBtn);

      expect(usePublicationStore.getState().currentProject?.status).toBe('RENDERING');

      await waitFor(() => {
        expect(runPipelineExecutionSpy).toHaveBeenCalled();
        expect(usePublicationStore.getState().currentProject?.status).toBe('READY');
      });
    });

    it('disables Fast render button while pipeline is currently running', () => {
      useNodeGraphStore.setState({ isPipelineRunning: true });

      renderWithProviders(
        <StudioActionHeader onOpenPublishModal={vi.fn()} onOpenSettingsModal={vi.fn()} />,
      );

      const renderBtn = screen.getByRole('button', { name: /Змонтувати відео через FFmpeg/i });
      expect((renderBtn as HTMLButtonElement).disabled).toBe(true);
      expect(screen.getByText('Монтаж FFmpeg...')).toBeDefined();

      useNodeGraphStore.setState({ isPipelineRunning: false });
    });

    it('calls onOpenPublishModal when clicking the Export button', () => {
      const onOpenPublish = vi.fn();
      renderWithProviders(
        <StudioActionHeader onOpenPublishModal={onOpenPublish} onOpenSettingsModal={vi.fn()} />,
      );

      const exportBtn = screen.getByRole('button', { name: /Експорт проєкту/i });
      fireEvent.click(exportBtn);
      expect(onOpenPublish).toHaveBeenCalledTimes(1);
    });

    it('opens Smart Next Topic modal when clicking Smart Next Topic button', () => {
      const openModalSpy = vi.spyOn(useSmartNextTopicStore.getState(), 'openModal');

      renderWithProviders(
        <StudioActionHeader onOpenPublishModal={vi.fn()} onOpenSettingsModal={vi.fn()} />,
      );

      const topicBtn = screen.getByRole('button', { name: /Підібрати наступну тему/i });
      fireEvent.click(topicBtn);
      expect(openModalSpy).toHaveBeenCalledTimes(1);
    });

    it('Bug 6 fix: shows install button when uninstalled, installs to localStorage, and preserves FFmpeg Ready across remounts without showing install button again', async () => {
      vi.useFakeTimers();

      vi.spyOn(tauriCommands, 'detectCliTool').mockResolvedValue({
        tool_name: 'ffmpeg',
        installed: false,
        path: undefined,
        version: undefined,
      });

      const { unmount } = renderWithProviders(
        <StudioActionHeader onOpenPublishModal={vi.fn()} onOpenSettingsModal={vi.fn()} />,
      );

      await act(async () => {
        await Promise.resolve();
      });

      expect(screen.getByText('FFmpeg не знайдено')).toBeDefined();
      const installBtn = screen.getByRole('button', { name: /Встановити FFmpeg/i });
      expect(installBtn).toBeDefined();

      fireEvent.click(installBtn);

      await act(async () => {
        vi.advanceTimersByTime(1600);
      });

      expect(screen.getByText('FFmpeg Ready')).toBeDefined();
      expect(screen.queryByText('FFmpeg не знайдено')).toBeNull();
      expect(localStorage.getItem('cosmolost_ffmpeg_installed')).toBe('true');

      unmount();

      // Remount header (simulating user navigating away and re-entering the page)
      renderWithProviders(
        <StudioActionHeader onOpenPublishModal={vi.fn()} onOpenSettingsModal={vi.fn()} />,
      );

      // Must immediately show FFmpeg Ready without showing FFmpeg не знайдено or the install button!
      expect(screen.getByText('FFmpeg Ready')).toBeDefined();
      expect(screen.queryByText('FFmpeg не знайдено')).toBeNull();
      expect(screen.queryByRole('button', { name: /Встановити FFmpeg/i })).toBeNull();

      vi.useRealTimers();
    });
  });

  describe('StudioSettingsModal', () => {
    it('returns null and does not render when isOpen is false', () => {
      renderWithProviders(<StudioSettingsModal isOpen={false} onClose={vi.fn()} />);

      expect(screen.queryByText('Налаштування рендеру та студії')).toBeNull();
    });

    it('renders modal dialog correctly with GPU slider, timeout badges, and sections when isOpen is true', () => {
      renderWithProviders(<StudioSettingsModal isOpen={true} onClose={vi.fn()} />);

      expect(screen.getByText('Налаштування рендеру та студії')).toBeDefined();
      expect(screen.getByText('Studio Settings')).toBeDefined();
      expect(screen.getByText('GPU Render Timeout (Таймаут відеорендера)')).toBeDefined();
      expect(screen.getByText('FFmpeg Engine (Локальний рушій монтажу)')).toBeDefined();
      expect(screen.getByText('Відеопресети & Апаратне прискорення')).toBeDefined();
      expect(screen.getByText('Синхронізація з 3D Мапою CosmoLost')).toBeDefined();
      expect(screen.getByText('40 секунд')).toBeDefined();
    });

    it('changing the timeout slider updates the store and display label', () => {
      renderWithProviders(<StudioSettingsModal isOpen={true} onClose={vi.fn()} />);

      const slider = screen.getByLabelText('GPU Render Timeout slider');
      fireEvent.change(slider, { target: { value: '180' } });

      expect(usePublicationStore.getState().currentProject?.renderTimeoutSec).toBe(180);
      expect(screen.getByText('180 секунд')).toBeDefined();
      expect(screen.getByText('Поточне: 180с')).toBeDefined();
    });

    it('clicking preset chips (30s, 40s, 90s, 120s, 180s) updates renderTimeoutSec in store', () => {
      renderWithProviders(<StudioSettingsModal isOpen={true} onClose={vi.fn()} />);

      const preset30 = screen.getByRole('button', { name: /30с/i });
      fireEvent.click(preset30);
      expect(usePublicationStore.getState().currentProject?.renderTimeoutSec).toBe(30);

      const preset90 = screen.getByRole('button', { name: /90с/i });
      fireEvent.click(preset90);
      expect(usePublicationStore.getState().currentProject?.renderTimeoutSec).toBe(90);

      const preset120 = screen.getByRole('button', { name: /120с/i });
      fireEvent.click(preset120);
      expect(usePublicationStore.getState().currentProject?.renderTimeoutSec).toBe(120);

      const preset180 = screen.getByRole('button', { name: /180с/i });
      fireEvent.click(preset180);
      expect(usePublicationStore.getState().currentProject?.renderTimeoutSec).toBe(180);

      const preset40 = screen.getByRole('button', { name: /40с/i });
      fireEvent.click(preset40);
      expect(usePublicationStore.getState().currentProject?.renderTimeoutSec).toBe(40);
    });

    it('displays FFmpeg status indicator when installed and allows refresh check', async () => {
      vi.spyOn(tauriCommands, 'detectCliTool').mockResolvedValue({
        tool_name: 'ffmpeg',
        installed: true,
        path: 'C:\\ffmpeg\\bin\\ffmpeg.exe',
        version: '6.1.1-static',
      });

      renderWithProviders(<StudioSettingsModal isOpen={true} onClose={vi.fn()} />);

      await waitFor(() => {
        expect(screen.getByText(/FFmpeg Встановлено/i)).toBeDefined();
        expect(screen.getByText(/C:\\ffmpeg\\bin\\ffmpeg.exe/i)).toBeDefined();
      });

      const refreshBtn = screen.getByRole('button', { name: /Оновити статус FFmpeg/i });
      fireEvent.click(refreshBtn);
      expect(tauriCommands.detectCliTool).toHaveBeenCalledWith('ffmpeg');
    });

    it('shows missing badge and 1-click install button when FFmpeg is not installed, then installs it', async () => {
      vi.useFakeTimers();

      vi.spyOn(tauriCommands, 'detectCliTool').mockResolvedValue({
        tool_name: 'ffmpeg',
        installed: false,
        path: undefined,
        version: undefined,
      });

      renderWithProviders(<StudioSettingsModal isOpen={true} onClose={vi.fn()} />);

      await act(async () => {
        await Promise.resolve();
      });

      expect(screen.getByText('Не знайдено')).toBeDefined();

      const installBtn = screen.getByRole('button', {
        name: /Встановити FFmpeg автоматично \(1-клік\)/i,
      });
      expect(installBtn).toBeDefined();

      fireEvent.click(installBtn);

      expect(screen.getByText(/Завантаження та налаштування бінарників.../i)).toBeDefined();

      await act(async () => {
        vi.advanceTimersByTime(1600);
      });

      expect(screen.getByText(/FFmpeg Встановлено \(7.0.1-essentials\)/i)).toBeDefined();

      vi.useRealTimers();
    });

    it('Bug 6 fix: installs FFmpeg from modal and keeps it installed after closing and reopening modal', async () => {
      vi.useFakeTimers();

      vi.spyOn(tauriCommands, 'detectCliTool').mockResolvedValue({
        tool_name: 'ffmpeg',
        installed: false,
        path: undefined,
        version: undefined,
      });

      const { unmount } = renderWithProviders(
        <StudioSettingsModal isOpen={true} onClose={vi.fn()} />,
      );

      await act(async () => {
        await Promise.resolve();
      });

      expect(screen.getByText('Не знайдено')).toBeDefined();
      const installBtn = screen.getByRole('button', {
        name: /Встановити FFmpeg автоматично \(1-клік\)/i,
      });
      fireEvent.click(installBtn);

      await act(async () => {
        vi.advanceTimersByTime(1600);
      });

      expect(screen.getByText(/FFmpeg Встановлено/i)).toBeDefined();
      expect(localStorage.getItem('cosmolost_ffmpeg_installed')).toBe('true');

      unmount();

      // Reopen modal: should immediately show FFmpeg Встановлено without "Не знайдено" or install button
      renderWithProviders(<StudioSettingsModal isOpen={true} onClose={vi.fn()} />);

      expect(screen.getByText(/FFmpeg Встановлено/i)).toBeDefined();
      expect(screen.queryByText('Не знайдено')).toBeNull();
      expect(
        screen.queryByRole('button', {
          name: /Встановити FFmpeg автоматично \(1-клік\)/i,
        }),
      ).toBeNull();

      vi.useRealTimers();
    });

    it('toggles video resolution, Pillow-Box, GPU hardware acceleration, and 3D map sync', () => {
      renderWithProviders(<StudioSettingsModal isOpen={true} onClose={vi.fn()} />);

      // Resolution buttons
      const btn30fps = screen.getByRole('button', { name: '1080p 30fps' });
      fireEvent.click(btn30fps);
      const btn60fps = screen.getByRole('button', { name: '1080p 60fps' });
      fireEvent.click(btn60fps);

      // Pillow-Box toggle
      const pillowBoxBtn = screen.getByRole('button', { name: /✓ Увімкнено \(Blur фон\)/i });
      fireEvent.click(pillowBoxBtn);
      expect(screen.getByText('Вимкнено (Letterbox)')).toBeDefined();
      fireEvent.click(screen.getByRole('button', { name: 'Вимкнено (Letterbox)' }));
      expect(screen.getByText('✓ Увімкнено (Blur фон)')).toBeDefined();

      // Hardware Acceleration toggle
      const gpuBtn = screen.getByRole('button', { name: /✓ GPU Прискорення ON/i });
      fireEvent.click(gpuBtn);
      expect(screen.getByText('CPU x264 (Повільніше)')).toBeDefined();
      fireEvent.click(screen.getByRole('button', { name: 'CPU x264 (Повільніше)' }));
      expect(screen.getByText('✓ GPU Прискорення ON')).toBeDefined();

      // 3D Map sync toggle
      const mapSyncBtn = screen.getByRole('button', { name: /3D Мапу зв’язано/i });
      fireEvent.click(mapSyncBtn);
      expect(screen.getByText('Прив’язати 3D Мапу')).toBeDefined();
      fireEvent.click(screen.getByRole('button', { name: 'Прив’язати 3D Мапу' }));
      expect(screen.getByText('3D Мапу зв’язано')).toBeDefined();
    });

    it('closes modal when clicking the X button, Close button, Save button, or pressing Escape', () => {
      const onClose = vi.fn();
      const { rerender } = renderWithProviders(
        <StudioSettingsModal isOpen={true} onClose={onClose} />,
      );

      // Click top-right X button
      const closeIconBtn = screen.getByRole('button', { name: /Закрити налаштування/i });
      fireEvent.click(closeIconBtn);
      expect(onClose).toHaveBeenCalledTimes(1);

      // Click footer "Закрити"
      const footerCloseBtn = screen.getByRole('button', { name: 'Закрити' });
      fireEvent.click(footerCloseBtn);
      expect(onClose).toHaveBeenCalledTimes(2);

      // Click footer "Зберегти та закрити"
      const footerSaveBtn = screen.getByRole('button', { name: 'Зберегти та закрити' });
      fireEvent.click(footerSaveBtn);
      expect(onClose).toHaveBeenCalledTimes(3);

      // Press Escape
      fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
      expect(onClose).toHaveBeenCalledTimes(4);

      rerender(
        <MemoryRouter>
          <ChakraProvider value={defaultSystem}>
            <QueryClientProvider client={new QueryClient()}>
              <StudioSettingsModal isOpen={false} onClose={onClose} />
            </QueryClientProvider>
          </ChakraProvider>
        </MemoryRouter>,
      );
    });
  });

  describe('Header + Modal Integration Workflow', () => {
    const IntegrationWrapper: React.FC = () => {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <>
          <StudioActionHeader
            onOpenPublishModal={vi.fn()}
            onOpenSettingsModal={() => setIsOpen(true)}
          />
          <StudioSettingsModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
      );
    };

    it('opens settings modal from header button and propagates slider changes to header', async () => {
      renderWithProviders(<IntegrationWrapper />);

      expect(screen.queryByText('Studio Settings')).toBeNull();

      const openBtn = screen.getByRole('button', { name: /Налаштування студії/i });
      fireEvent.click(openBtn);

      expect(screen.getByText('Studio Settings')).toBeDefined();

      const slider = screen.getByLabelText('GPU Render Timeout slider');
      fireEvent.change(slider, { target: { value: '90' } });

      expect(usePublicationStore.getState().currentProject?.renderTimeoutSec).toBe(90);

      const closeBtn = screen.getByRole('button', { name: /Закрити налаштування/i });
      fireEvent.click(closeBtn);

      await waitFor(() => {
        expect(screen.queryByText('Studio Settings')).toBeNull();
      });

      expect(usePublicationStore.getState().currentProject?.renderTimeoutSec).toBe(90);
    });
  });
});
