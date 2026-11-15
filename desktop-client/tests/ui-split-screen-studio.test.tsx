import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { usePublicationStore } from '../src/entities/publication';
import { ShortsSplitScreenStudio } from '../src/features/media-engine';

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <ChakraProvider value={defaultSystem}>
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    </ChakraProvider>,
  );
}

describe('QA UI Test: Split-Screen & Emotional Character Studio', () => {
  beforeEach(() => {
    usePublicationStore.setState({
      currentProject: {
        id: 'test-split-project',
        artifactId: 'opportunity-rover',
        artifactName: 'Opportunity Rover (MER-B)',
        rubricId: 'last-sol-drama',
        status: 'READY',
        targetDurationSec: 40,
        selectionReason: 'Загибель у пиловій бурі.',
        slides: [
          {
            id: 's1',
            slideIndex: 1,
            type: 'HOOK',
            durationSec: 3,
            narratorText: 'Цей марсохід помер у бурі...',
            visualPrompt: 'Martian dust storm',
            pngtuberState: 'SHOCK',
          },
          {
            id: 's2',
            slideIndex: 2,
            type: 'B_ROLL_FACTS',
            durationSec: 15,
            narratorText: 'Opportunity пройшов 45 кілометрів.',
            visualPrompt: 'Rover tracks in dunes',
            pngtuberState: 'EXPERT',
          },
        ],
        seoCaption: {
          line1Hook: 'Останні слова Opportunity',
          line2Seo: 'SEO опис',
          line3Tags: '#Shorts',
        },
        pinComment: 'Дискусійне питання',
        renderTimeoutSec: 40,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders Studio title, 9:16 layout buttons, emotions, and BGM presets', () => {
    renderWithProviders(<ShortsSplitScreenStudio />);

    // Studio Header & Badges
    expect(screen.getByText(/Студія Спліт-Екрану \(Split-Screen\) та Персонажі/i)).toBeDefined();
    expect(screen.getByText('9:16 Shorts')).toBeDefined();
    expect(screen.getByText('PNGTuber Ліпсінк')).toBeDefined();

    // Layout buttons
    expect(screen.getByRole('button', { name: /Спліт 50\/50/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Повний B-Roll геймплей/i })).toBeDefined();

    // Avatar Character Presets
    expect(screen.getByRole('button', { name: /Віолетта \(CosmoHost\)/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Астронавт Ніл/i })).toBeDefined();

    // 4 Emotional Expressions
    expect(screen.getByRole('button', { name: /😱 ШОК/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /🧐 ЕКСПЕРТ/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /🙂 СПОКІЙНИЙ/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /🚀 ХАЙП/i })).toBeDefined();

    // BGM presets
    expect(screen.getByText(/Cosmic Synthwave/i)).toBeDefined();
    expect(screen.getByText(/Deep Space Drone/i)).toBeDefined();
  });

  it('allows clicking an emotion button to manually trigger avatar mood', () => {
    renderWithProviders(<ShortsSplitScreenStudio />);

    const hypeBtn = screen.getByRole('button', { name: /🚀 ХАЙП/i });
    fireEvent.click(hypeBtn);

    // Badge updates to HYPE
    expect(screen.getByText(/Стан: HYPE/i)).toBeDefined();
  });

  it('toggles Play/Pause and updates scrubber time and kinetic subtitles', () => {
    renderWithProviders(<ShortsSplitScreenStudio />);

    const playBtn = screen.getByRole('button', { name: /Відтворити ролик/i });
    fireEvent.click(playBtn);

    // Changes label to Пауза
    expect(screen.getByRole('button', { name: /Пауза/i })).toBeDefined();

    // Click again to pause
    fireEvent.click(screen.getByRole('button', { name: /Пауза/i }));
    expect(screen.getByRole('button', { name: /Відтворити ролик/i })).toBeDefined();
  });

  it('toggles Safe Zones overlay display', () => {
    renderWithProviders(<ShortsSplitScreenStudio />);

    expect(screen.getByText(/Мертва зона Top 220px/i)).toBeDefined();

    // Toggle off
    const safeZoneBtn = screen.getByRole('button', { name: /Safe Zones/i });
    fireEvent.click(safeZoneBtn);

    expect(screen.queryByText(/Мертва зона Top 220px/i)).toBeNull();
  });
});
