import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { generateScriptMarkdown, usePublicationStore } from '../src/entities/publication';
import { ShortsSplitScreenStudio } from '../src/features/media-engine';
import { ScriptGeneratorPanel } from '../src/features/script-generator';
import { SocialPublishPanel } from '../src/features/social-publishing';

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <ChakraProvider value={defaultSystem}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{ui}</MemoryRouter>
      </QueryClientProvider>
    </ChakraProvider>,
  );
}

describe('QA Test: Word Magnets, Multi-part Chronicles, Safe Zones & Auto-Publishing', () => {
  beforeEach(() => {
    usePublicationStore.setState({
      currentProject: {
        id: 'test-magnet-project',
        artifactId: 'opportunity-rover',
        artifactName: 'Opportunity Rover (MER-B)',
        rubricId: 'chronicles',
        status: 'READY',
        targetDurationSec: 40,
        selectionReason: 'Трагічна пилова буря на Марсі.',
        magnetWord: '💔 ОСТАННІ СЛОВА',
        seriesInfo: {
          seriesName: 'Хроніки Марса',
          partNumber: 1,
          totalParts: 3,
          cliffhanger: 'У наступній частині: чому вчені не змогли пробудити ровер у 2019 році...',
        },
        tagGroups: ['viral', 'space', 'nasa'],
        slides: [
          {
            id: 's1',
            slideIndex: 1,
            type: 'HOOK',
            durationSec: 3,
            narratorText: '💔 ОСТАННІ СЛОВА: Батарея розряджена, і стає темно...',
            visualPrompt: 'Martian dust storm sunset',
            pngtuberState: 'SHOCK',
          },
          {
            id: 's2',
            slideIndex: 2,
            type: 'B_ROLL_FACTS',
            durationSec: 15,
            narratorText: 'Opportunity пройшов 45 кілометрів по Марсу.',
            visualPrompt: 'Rover tracks in dunes',
            pngtuberState: 'EXPERT',
          },
        ],
        seoCaption: {
          line1Hook: 'Останні слова Opportunity перед вічним замерзанням 😱👇',
          line2Seo: 'Повна історія на 3D мапі CosmoLost',
          line3Tags: '#shorts #viral #space #nasa #марс',
        },
        pinComment: 'Чи хотіли б ви доставити Opportunity на Землю?',
        renderTimeoutSec: 40,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  });

  afterEach(() => {
    cleanup();
    usePublicationStore.setState({ currentProject: null });
  });

  it('1. Markdown Script Exporter generates complete MKT-01 script and content plan', () => {
    const project = usePublicationStore.getState().currentProject!;
    const md = generateScriptMarkdown(project);

    expect(md).toContain('# 🚀 CosmoLost Shorts: Opportunity Rover (MER-B)');
    expect(md).toContain('⚡ [МАГНІТНЕ СЛОВО: 💔 ОСТАННІ СЛОВА]');
    expect(md).toContain('Хроніки Марса (Частина 1 з 3)');
    expect(md).toContain(
      'У наступній частині: чому вчені не змогли пробудити ровер у 2019 році...',
    );
    expect(md).toContain('Покадровий монтажний план (Split-Screen & PNGTuber)');
    expect(md).toContain('Повний суцільний дикторський текст');
    expect(md).toContain("SEO-Пакет та Алгоритмічний Дистриб'юшн");
    expect(md).toContain('Безпечні Зони (Safe Zones Checklist)');
  });

  it('2. Tag Groups toggle updates line3Tags in publication store', () => {
    const store = usePublicationStore.getState();
    expect(store.currentProject?.tagGroups).toContain('viral');

    // Toggle science group
    store.toggleTagGroup('science');
    const updated = usePublicationStore.getState().currentProject!;
    expect(updated.tagGroups).toContain('science');
    expect(updated.seoCaption.line3Tags).toContain('#наука');

    // Toggle again removes it
    store.toggleTagGroup('science');
    const toggledOff = usePublicationStore.getState().currentProject!;
    expect(toggledOff.tagGroups).not.toContain('science');
    expect(toggledOff.seoCaption.line3Tags).not.toContain('#наука');
  });

  it('3. ScriptGeneratorPanel renders Magnetic Words and Chronicles Multi-part controls', () => {
    renderWithProviders(<ScriptGeneratorPanel />);

    // Rubric button for chronicles
    expect(screen.getByText(/Космічні Хроніки \(Серіал\)/i)).toBeDefined();

    // Word magnet chips
    expect(screen.getByText(/Слово-Магніт для Хука/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /⚡ ШОК/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /🔒 ЗАБОРОНЕНО NASA/i })).toBeDefined();

    // Multi-part series controls
    expect(screen.getByText(/Багатосерійні Хроніки/i)).toBeDefined();

    // Script export buttons
    expect(screen.getByRole('button', { name: /Завантажити файл \(\.md\)/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Скопіювати план/i })).toBeDefined();
  });

  it('4. ShortsSplitScreenStudio renders Word Magnet banner and platform-specific Safe Zones', () => {
    renderWithProviders(<ShortsSplitScreenStudio />);

    // Magnet word callout banner during Hook
    expect(screen.getByText(/💔 ОСТАННІ СЛОВА/i)).toBeDefined();

    // Series badge
    expect(screen.getByText(/Хроніки Марса • Ч\.1\/3/i)).toBeDefined();

    // Platform switcher buttons
    const tiktokBtn = screen.getByRole('button', { name: 'TikTok' });
    const shortsBtn = screen.getByRole('button', { name: 'Shorts' });
    const reelsBtn = screen.getByRole('button', { name: 'Reels' });
    expect(tiktokBtn).toBeDefined();
    expect(shortsBtn).toBeDefined();
    expect(reelsBtn).toBeDefined();

    // Switch to YouTube Shorts
    fireEvent.click(shortsBtn);
    expect(screen.getByText(/YouTube Shorts/i)).toBeDefined();

    // Switch to Instagram Reels
    fireEvent.click(reelsBtn);
    expect(screen.getByText(/Instagram Reels/i)).toBeDefined();
  });

  it('5. SocialPublishPanel renders Tag Groups, Auto-publish button and copies SEO package', () => {
    renderWithProviders(<SocialPublishPanel />);

    // Tag Groups section
    expect(screen.getByText(/Згруповані Хештеги для Алгоритмів/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Віральні тренди/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /NASA та Марс/i })).toBeDefined();

    // Auto-publish button
    expect(screen.getByRole('button', { name: /Авто-публікація у всі канали/i })).toBeDefined();

    // Download script button
    expect(screen.getByRole('button', { name: /Завантажити сценарій \(\.md\)/i })).toBeDefined();
  });
});
