import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { artifactRepository } from '../src/entities/artifact/api/artifact-repository';
import { usePublicationStore } from '../src/entities/publication';
import { HomePage } from '../src/pages/home';

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <MemoryRouter initialEntries={['/']}>
      <ChakraProvider value={defaultSystem}>
        <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
      </ChakraProvider>
    </MemoryRouter>,
  );
}

describe('QA UI Test: Projects Hub & Workspace Flow', () => {
  beforeEach(() => {
    vi.spyOn(artifactRepository, 'listFeaturedArtifacts').mockResolvedValue([
      {
        id: 'opportunity-rover',
        name: 'Opportunity Rover (MER-B)',
        missionName: 'Mars Exploration Rover',
        celestialBody: 'mars',
        artifactType: 'ROVER',
        operationalStatus: 'DORMANT',
        photos: [],
        coordinates: { latitude: 0, longitude: 0, locationName: 'Mars' },
        previewImageUrl: '',
      },
      {
        id: 'apollo-11-lm-eagle',
        name: 'Apollo 11 Lunar Module (Eagle)',
        missionName: 'Apollo 11',
        celestialBody: 'moon',
        artifactType: 'LANDER',
        operationalStatus: 'DORMANT',
        photos: [],
        coordinates: { latitude: 0, longitude: 0, locationName: 'Moon' },
        previewImageUrl: '',
      },
    ]);

    // Reset to initial demo projects
    usePublicationStore.setState({
      projects: [
        {
          id: 'test-proj-1',
          artifactId: 'opportunity-rover',
          artifactName: 'Opportunity Rover (MER-B)',
          rubricId: 'last-sol-drama',
          status: 'READY',
          targetDurationSec: 40,
          selectionReason: 'Трагічна загибель від пилової бурі.',
          slides: [],
          seoCaption: {
            line1Hook: 'Останні слова Opportunity',
            line2Seo: 'SEO текст',
            line3Tags: '#Shorts',
          },
          pinComment: 'Питання в коментарях',
          renderTimeoutSec: 40,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'test-proj-2',
          artifactId: 'apollo-11-lm-eagle',
          artifactName: 'Apollo 11 Lunar Module (Eagle)',
          rubricId: 'tech-explain',
          status: 'PUBLISHED',
          targetDurationSec: 38,
          selectionReason: 'Кутовий відбивач LRRR.',
          slides: [],
          seoCaption: {
            line1Hook: 'Прилад Аполлона 11',
            line2Seo: 'SEO текст',
            line3Tags: '#Shorts',
          },
          pinComment: 'Питання',
          renderTimeoutSec: 40,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      currentProject: null,
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders Projects Studio header, Smart Next Topic banner, and projects shelf', () => {
    renderWithProviders(<HomePage />);

    // Header
    expect(screen.getByText('Студія Проєктів CosmoLost')).toBeDefined();
    expect(screen.getByText('Local-First Studio')).toBeDefined();
    expect(screen.getByText(/Створити новий проєкт/i)).toBeDefined();

    // Smart Next Topic Banner (REQ-FAC-13)
    expect(screen.getByText(/Розумна тема наступного ролика/i)).toBeDefined();

    // Projects shelf cards
    expect(screen.getByText('Opportunity Rover (MER-B)')).toBeDefined();
    expect(screen.getByText('Apollo 11 Lunar Module (Eagle)')).toBeDefined();
  });

  it('filters projects by status', () => {
    renderWithProviders(<HomePage />);

    // Filter by 'Опубліковані'
    const publishedFilterBtn = screen.getByRole('button', { name: /^Опубліковані$/i });
    fireEvent.click(publishedFilterBtn);

    // Only Apollo 11 is PUBLISHED
    expect(screen.queryByText('Opportunity Rover (MER-B)')).toBeNull();
    expect(screen.getByText('Apollo 11 Lunar Module (Eagle)')).toBeDefined();
  });

  it('opens Create New Project Wizard modal and creates a project', () => {
    renderWithProviders(<HomePage />);

    // Click "Створити новий проєкт"
    const createBtn = screen.getByRole('button', { name: /Створити новий проєкт/i });
    fireEvent.click(createBtn);

    // Modal should appear
    expect(screen.getByText('Створити новий проєкт Shorts')).toBeDefined();
    expect(screen.getByText(/1\. Цільовий артефакт/i)).toBeDefined();
    expect(screen.getByText(/2\. SMM-рубрика/i)).toBeDefined();
    expect(screen.getByText(/3\. Причина вибору даних/i)).toBeDefined();

    // Click submit in modal
    const submitBtn = screen.getByRole('button', { name: /Створити та відкрити у Редакторі/i });
    fireEvent.click(submitBtn);

    // Verify a project is now set in store
    const current = usePublicationStore.getState().currentProject;
    expect(current).toBeDefined();
    expect(current?.status).toBe('DRAFT');
  });

  it('allows opening an existing project in the Video Editor', () => {
    renderWithProviders(<HomePage />);

    const openBtns = screen.getAllByRole('button', { name: /Відкрити в Редакторі/i });
    expect(openBtns.length).toBeGreaterThan(0);

    fireEvent.click(openBtns[0]);

    // Active project should be set to Opportunity
    const current = usePublicationStore.getState().currentProject;
    expect(current?.id).toBe('test-proj-1');
  });
});
