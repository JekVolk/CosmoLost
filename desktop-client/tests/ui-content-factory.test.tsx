import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { artifactApi, useArtifactStore } from '../src/entities/artifact';
import { usePublicationStore } from '../src/entities/publication';
import { ContentFactoryWidget } from '../src/widgets/content-factory';

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <MemoryRouter>
      <ChakraProvider value={defaultSystem}>
        <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
      </ChakraProvider>
    </MemoryRouter>,
  );
}

describe('QA UI Test: Content Factory Interactive Flow', () => {
  beforeEach(() => {
    window.location.hash = '#/content-factory';
    usePublicationStore.setState({ currentProject: null });
    useArtifactStore.setState({ selectedArtifactId: 'opportunity-rover' });
    vi.spyOn(artifactApi, 'getCatalog').mockRejectedValue(new Error('Backend offline in test'));
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    usePublicationStore.setState({ currentProject: null });
  });

  it('renders Content Factory header, badges, and artifact catalog tab', async () => {
    renderWithProviders(<ContentFactoryWidget />);

    // Studio badges and navigation
    expect(screen.getByText('Local-First Studio V2')).toBeDefined();
    expect(screen.getByText('1080×1920 • 60 FPS')).toBeDefined();
    expect(screen.getByText('До проєктів')).toBeDefined();

    // Studio Stepper stages
    expect(screen.getByText('Artifact Source')).toBeDefined();
    expect(screen.getByText('Script & Cues')).toBeDefined();
    expect(screen.getByText('Audio & Sync')).toBeDefined();
    expect(screen.getByText('Visual Composite')).toBeDefined();
    expect(screen.getByText('Export & Publish')).toBeDefined();

    // Live 9:16 Shorts Monitor in split-screen right pane
    expect(screen.getByText('Live 9:16 Shorts Монітор')).toBeDefined();

    // Switch to Artifacts tab
    const artifactsTabBtn = screen.getByRole('button', { name: /Артефакти/i });
    expect(artifactsTabBtn).toBeDefined();
    fireEvent.click(artifactsTabBtn);

    // Verify artifacts rendered in catalog
    await waitFor(() => {
      expect(screen.getByText(/Каталог артефактів NASA/i)).toBeDefined();
      expect(screen.getAllByText(/Opportunity Rover/i)[0]).toBeDefined();
      expect(screen.getAllByText(/Spirit Rover/i)[0]).toBeDefined();
    });
  });

  it('allows clicking artifacts to change selected target', async () => {
    renderWithProviders(<ContentFactoryWidget />);

    // Switch to artifacts view
    const artifactsTabBtn = screen.getByRole('button', { name: /Артефакти/i });
    fireEvent.click(artifactsTabBtn);

    await waitFor(() => {
      expect(screen.getAllByText(/Spirit Rover/i)[0]).toBeDefined();
    });

    const spiritCard = screen.getByText(/Spirit Rover/i).closest('div');
    if (spiritCard) {
      fireEvent.click(spiritCard);
    }

    expect(useArtifactStore.getState().selectedArtifactId).toBe('spirit-rover');
  });

  it('switches between Panels view, Visual Node Graph view, and Artifacts view', async () => {
    renderWithProviders(<ContentFactoryWidget />);

    // Default view is Visual Node Graph
    await waitFor(() => {
      expect(screen.getByText(/Нодовий Пайплайн Контенту/i)).toBeDefined();
      expect(screen.getByRole('button', { name: /Валідувати Граф/i })).toBeDefined();
      expect(screen.getByRole('button', { name: /Запустити Пайплайн/i })).toBeDefined();
    });

    // Click "Валідувати Граф"
    const validateBtn = screen.getByRole('button', { name: /Валідувати Граф/i });
    fireEvent.click(validateBtn);

    await waitFor(() => {
      expect(screen.getByText(/DAG Валідний/i)).toBeDefined();
    });

    // Switch to Panels view
    const panelsButton = screen.getByRole('button', {
      name: /Панелі скрипта/i,
    });
    fireEvent.click(panelsButton);

    await waitFor(() => {
      expect(screen.getByText(/Генератор SMM-Сценаріїв/i)).toBeDefined();
      expect(screen.getByText(/Дистрибуція та Мультипостинг/i)).toBeDefined();
    });

    // Switch to Artifacts view
    const artifactsButton = screen.getByRole('button', {
      name: /Артефакти/i,
    });
    fireEvent.click(artifactsButton);

    await waitFor(() => {
      expect(screen.getByText(/Каталог артефактів NASA/i)).toBeDefined();
    });

    // Test Stepper reactivity: clicking Step 2 (Script & Cues) switches to panels
    const step2 = screen.getByText('Script & Cues');
    fireEvent.click(step2);

    await waitFor(() => {
      expect(screen.getByText(/Генератор SMM-Сценаріїв/i)).toBeDefined();
    });

    // Test Stepper reactivity: clicking Step 3 (Audio & Sync) switches back to graph
    const step3 = screen.getByText('Audio & Sync');
    fireEvent.click(step3);

    await waitFor(() => {
      expect(screen.getByText(/Нодовий Пайплайн Контенту/i)).toBeDefined();
    });
  });

  it('triggers pipeline execution in Node Graph view', async () => {
    renderWithProviders(<ContentFactoryWidget />);

    const runBtn = await screen.findByRole('button', {
      name: /Запустити Пайплайн/i,
    });
    fireEvent.click(runBtn);

    // Verify success result badge appears
    await waitFor(
      () => {
        expect(screen.getByText(/Успіх:/i)).toBeDefined();
      },
      { timeout: 3000 },
    );
  });

  it('toggles Safe Zones, platform presets, and Pillow-Box in ShortsMonitorPreview', async () => {
    renderWithProviders(<ContentFactoryWidget />);

    // Default: Safe Zones ON
    expect(screen.getByText(/Safe Zones: ON/i)).toBeDefined();
    expect(screen.getByText(/TOP DEAD ZONE 220px \(YOUTUBE\)/i)).toBeDefined();

    // Switch platform to TikTok
    const tiktokBtn = screen.getByRole('button', { name: /^TikTok$/i });
    fireEvent.click(tiktokBtn);
    expect(screen.getByText(/TOP DEAD ZONE 220px \(TIKTOK\)/i)).toBeDefined();

    // Switch platform to Reels (Instagram)
    const reelsBtn = screen.getByRole('button', { name: /^Reels$/i });
    fireEvent.click(reelsBtn);
    expect(screen.getByText(/TOP DEAD ZONE 220px \(INSTAGRAM\)/i)).toBeDefined();

    // Toggle Safe Zones OFF
    const safeZoneToggleBtn = screen.getByRole('button', { name: /Safe Zones: ON/i });
    fireEvent.click(safeZoneToggleBtn);
    expect(screen.getByText(/Safe Zones: OFF/i)).toBeDefined();
    expect(screen.queryByText(/TOP DEAD ZONE 220px/i)).toBeNull();

    // Toggle Safe Zones back ON
    const safeZoneToggleBackBtn = screen.getByRole('button', { name: /Safe Zones: OFF/i });
    fireEvent.click(safeZoneToggleBackBtn);
    expect(screen.getByText(/Safe Zones: ON/i)).toBeDefined();
    expect(screen.getByText(/TOP DEAD ZONE 220px \(INSTAGRAM\)/i)).toBeDefined();

    // Toggle Pillow-Box
    const pillowBoxBtn = screen.getByRole('button', { name: /Pillow-Box: ON/i });
    fireEvent.click(pillowBoxBtn);
    expect(screen.getByText(/Pillow-Box: OFF/i)).toBeDefined();

    const pillowBoxBackBtn = screen.getByRole('button', { name: /Pillow-Box: OFF/i });
    fireEvent.click(pillowBoxBackBtn);
    expect(screen.getByText(/Pillow-Box: ON/i)).toBeDefined();
  });
});
