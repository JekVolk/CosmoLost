import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { usePublicationStore } from '../src/entities/publication';
import {
  GameplayBrollModal,
  GameplayBrollQuickButton,
  useGameplayStore,
} from '../src/features/gameplay-broll';

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

describe('QA UI Test: Gameplay B-Roll Interactive Flow', () => {
  beforeEach(() => {
    useGameplayStore.setState({
      isModalOpen: false,
      savedClips: [],
      activeClip: null,
    });
    usePublicationStore.setState({
      currentProject: {
        id: 'proj-broll-ui',
        artifactId: 'perseverance-rover',
        artifactName: 'Mars 2020 Perseverance Rover',
        rubricId: 'ROBOTIC_FRONTIERS',
        status: 'DRAFT',
        targetDurationSec: 30,
        selectionReason: 'Mars exploration',
        slides: [],
        seoCaption: {
          line1Hook: 'Perseverance discovery',
          line2Seo: 'Mars rocks',
          line3Tags: '#Mars #NASA',
        },
        pinComment: 'Mars sample return!',
        renderTimeoutSec: 40,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders GameplayBrollQuickButton and opens modal on click', () => {
    renderWithProviders(
      <>
        <GameplayBrollQuickButton />
        <GameplayBrollModal />
      </>,
    );

    const btn = screen.getByText(/Геймплейний B-Roll/i);
    expect(btn).toBeDefined();

    fireEvent.click(btn);
    expect(useGameplayStore.getState().isModalOpen).toBe(true);

    expect(
      screen.getByText(/Генератор Псевдо-Геймплею \(NASA Moon\/Mars Parkour B-Roll\)/i),
    ).toBeDefined();
  });

  it('displays celestial location buttons and allows switching to Mars and Europa', () => {
    useGameplayStore.setState({ isModalOpen: true });
    renderWithProviders(<GameplayBrollModal />);

    // Check location presets
    const marsBtn = screen.getByText(/Марсіанські Дюни/i);
    expect(marsBtn).toBeDefined();
    fireEvent.click(marsBtn);

    const europaBtn = screen.getByText(/Крижаний Розлом/i);
    expect(europaBtn).toBeDefined();
    fireEvent.click(europaBtn);
  });

  it('renders avatar switcher and autopilot AI toggle', () => {
    useGameplayStore.setState({ isModalOpen: true });
    renderWithProviders(<GameplayBrollModal />);

    // Check avatars
    expect(screen.getByText(/Неоновий Шар/i)).toBeDefined();
    expect(screen.getByText(/NASA Марсохід/i)).toBeDefined();
    expect(screen.getByText(/Астронавт з Джетпаком/i)).toBeDefined();

    // Toggle Autopilot button specifically
    const autopilotBtn = screen.getByRole('button', { name: /AI Автопілот/i });
    expect(autopilotBtn).toBeDefined();
    fireEvent.click(autopilotBtn);
  });

  it('shows clip duration options and record trigger button', () => {
    useGameplayStore.setState({ isModalOpen: true });
    renderWithProviders(<GameplayBrollModal />);

    expect(screen.getByText('5с')).toBeDefined();
    expect(screen.getByText('10с')).toBeDefined();
    expect(screen.getByText('15с')).toBeDefined();
    expect(screen.getByText('30с')).toBeDefined();

    const recordBtn = screen.getByRole('button', { name: /Записати кліп/i });
    expect(recordBtn).toBeDefined();
  });
});
