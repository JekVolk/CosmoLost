import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_SUBTITLE_STYLE, usePublicationStore } from '../src/entities/publication';
import { useSettingsStore } from '../src/entities/settings';
import { SubtitleCustomizerSection } from '../src/features/media-engine';
import { ScriptGeneratorPanel } from '../src/features/script-generator';

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

describe('QA UI Test: Subtitle Contrast & Language Controls Flow', () => {
  beforeEach(() => {
    useSettingsStore.setState({
      settings: {
        ...useSettingsStore.getState().settings,
        contentGenerationLanguage: 'en',
      },
    });

    usePublicationStore.setState({
      currentProject: {
        id: 'proj-ui-subtitle-test',
        artifactId: 'apollo-11',
        artifactName: 'Apollo 11 Eagle',
        rubricId: 'last-sol-drama',
        status: 'DRAFT',
        contentLanguage: 'en',
        subtitleStyle: { ...DEFAULT_SUBTITLE_STYLE },
        targetDurationSec: 40,
        selectionReason: 'Lunar touchdown',
        slides: [],
        seoCaption: {
          line1Hook: 'How Apollo 11 landed',
          line2Seo: 'NASA moon history',
          line3Tags: '#Apollo11 #NASA',
        },
        pinComment: 'Comment below!',
        renderTimeoutSec: 40,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders SubtitleCustomizerSection with presets and live preview box', () => {
    renderWithProviders(<SubtitleCustomizerSection />);

    expect(screen.getByText(/Контрастні Субтитри/i)).toBeDefined();
    expect(screen.getByText(/Alex Hormozi/i)).toBeDefined();
    expect(screen.getByText(/MrBeast/i)).toBeDefined();
    expect(screen.getByText(/Cyberpunk/i)).toBeDefined();
    expect(screen.getByText(/Clean/i)).toBeDefined();

    // Check preset buttons can be clicked
    const mrBeastBtn = screen.getByText(/MrBeast/i);
    fireEvent.click(mrBeastBtn);

    const projectStyle = usePublicationStore.getState().currentProject?.subtitleStyle;
    expect(projectStyle?.preset).toBe('MRBEAST_CYAN');
    expect(projectStyle?.highlightColor).toBe('#22d3ee');
  });

  it('toggles CAPS / uppercase and keyword highlighting', () => {
    renderWithProviders(<SubtitleCustomizerSection />);

    const capsBtn = screen.getByText(/CAPS/i);
    expect(capsBtn).toBeDefined();
    fireEvent.click(capsBtn);

    let projectStyle = usePublicationStore.getState().currentProject?.subtitleStyle;
    expect(projectStyle?.isUppercase).toBe(false);

    const highlightBtn = screen.getByText(/Виділення/i);
    fireEvent.click(highlightBtn);

    projectStyle = usePublicationStore.getState().currentProject?.subtitleStyle;
    expect(projectStyle?.highlightKeywords).toBe(false);
  });

  it('allows selecting 2, 3, or 4 words per chunk and cycles preview chunk on click', () => {
    renderWithProviders(<SubtitleCustomizerSection />);

    const twoWordBtn = screen.getByRole('button', { name: '2' });
    fireEvent.click(twoWordBtn);

    expect(usePublicationStore.getState().currentProject?.subtitleStyle?.wordsPerChunk).toBe(2);

    // Clicking preview container cycles chunks
    const previewContainer = screen.getByTitle(/Клікніть для зміни чанку/i);
    expect(previewContainer).toBeDefined();
    fireEvent.click(previewContainer);
  });

  it('renders Language Selector buttons in ScriptGeneratorPanel and switches content language', () => {
    renderWithProviders(<ScriptGeneratorPanel />);

    const enBtn = screen.getByText(/English \(Global Shorts\)/i);
    const ukBtn = screen.getByText(/Українська/i);
    const dualBtn = screen.getByText(/Dual \(EN \+ UK\)/i);

    expect(enBtn).toBeDefined();
    expect(ukBtn).toBeDefined();
    expect(dualBtn).toBeDefined();

    // Click Ukrainian
    fireEvent.click(ukBtn);

    // Click Dual
    fireEvent.click(dualBtn);

    // Click English Priority
    fireEvent.click(enBtn);
  });
});
