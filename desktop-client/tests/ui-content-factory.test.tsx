import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
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
  });

  afterEach(() => {
    cleanup();
  });

  it('renders Content Factory header, badges, and artifact selector', async () => {
    renderWithProviders(<ContentFactoryWidget />);

    expect(screen.getByText('Фабрика Контенту CosmoLost')).toBeDefined();
    expect(screen.getByText('Local-First Engine')).toBeDefined();
    expect(screen.getByText(/Вибір цільового артефакту/)).toBeDefined();

    // Check artifacts rendered
    await waitFor(() => {
      expect(screen.getByText(/Opportunity Rover/)).toBeDefined();
      expect(screen.getByText(/Spirit Rover/)).toBeDefined();
      expect(screen.getByText(/Apollo 11 Lunar Module/)).toBeDefined();
    });
  });

  it('allows clicking artifacts to change selected target', async () => {
    renderWithProviders(<ContentFactoryWidget />);

    await waitFor(() => {
      expect(screen.getByText(/Spirit Rover/)).toBeDefined();
    });

    const spiritCard = screen.getByText(/Spirit Rover/).closest('div');
    if (spiritCard) {
      fireEvent.click(spiritCard);
    }
  });

  it('switches between Panels view and Visual Node Graph view', async () => {
    renderWithProviders(<ContentFactoryWidget />);

    // Default view has Panels button active
    const graphButton = screen.getByRole('button', {
      name: /Нодовий Граф/i,
    });
    expect(graphButton).toBeDefined();

    // Click to switch to Node Graph view
    fireEvent.click(graphButton);

    // Verify Node Canvas elements appear
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

    // Switch back to Panels view
    const panelsButton = screen.getByRole('button', {
      name: /Панелі керування/i,
    });
    fireEvent.click(panelsButton);

    await waitFor(() => {
      expect(screen.getByText(/Генератор SMM-Сценаріїв/i)).toBeDefined();
      expect(screen.getByText(/Медіа-Конвеєр/i)).toBeDefined();
    });
  });

  it('triggers pipeline execution in Node Graph view', async () => {
    renderWithProviders(<ContentFactoryWidget />);

    // Switch to graph
    fireEvent.click(screen.getByRole('button', { name: /Нодовий Граф/i }));

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
});
