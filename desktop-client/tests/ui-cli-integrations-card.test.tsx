import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type React from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useSettingsStore } from '../src/entities/settings';
import { CliIntegrationsSettingsCard } from '../src/features/settings-management/ui/CliIntegrationsSettingsCard';

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <ChakraProvider value={defaultSystem}>
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    </ChakraProvider>,
  );
}

describe('UI Test: CliIntegrationsSettingsCard', () => {
  beforeEach(() => {
    useSettingsStore.getState().resetSettings();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders all sections and badges', () => {
    renderWithProviders(<CliIntegrationsSettingsCard />);

    expect(screen.getByText(/CLI Interception, Multi-LLM & Media Studio/i)).toBeDefined();
    expect(screen.getByText('Claude CLI')).toBeDefined();
    expect(screen.getByText('AGY CLI')).toBeDefined();
    expect(screen.getByText('Codex / OpenAI')).toBeDefined();
    expect(screen.getByText(/Відео • Фото • Музика/i)).toBeDefined();
    expect(screen.getByText(/1. Claude CLI & Anthropic API Token/i)).toBeDefined();
    expect(screen.getByText(/2. Antigravity CLI \(agy\) Swarm Integration/i)).toBeDefined();
    expect(screen.getByText(/3. OpenAI \/ Codex CLI & Custom OpenAPI/i)).toBeDefined();
    expect(screen.getByText(/4. Media Generation Studio: Відео, Фото та Музика/i)).toBeDefined();
    expect(screen.getByText(/5. CLI Interceptor Bridge & Terminal Simulator/i)).toBeDefined();
  });

  it('saves Claude, OpenAI tokens, and media providers to settings store', async () => {
    renderWithProviders(<CliIntegrationsSettingsCard />);

    const claudeInput = screen.getByPlaceholderText('sk-ant-api03-...');
    fireEvent.change(claudeInput, { target: { value: 'sk-ant-my-test-key-999' } });

    const openaiInput = screen.getByPlaceholderText('sk-proj-...');
    fireEvent.change(openaiInput, { target: { value: 'sk-proj-openai-token-456' } });

    const saveBtn = screen.getByRole('button', {
      name: /Зберегти налаштування CLI, Токенів та Медіа/i,
    });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      const state = useSettingsStore.getState().settings;
      expect(state.claudeApiKey).toBe('sk-ant-my-test-key-999');
      expect(state.openaiApiKey).toBe('sk-proj-openai-token-456');
    });

    expect(screen.getByText(/збережено в нативне сховище/i)).toBeDefined();
  });

  it('triggers auto-configure in 1-click under the hood for Claude Desktop/CLI', async () => {
    renderWithProviders(<CliIntegrationsSettingsCard />);

    const autoBtn = screen.getByRole('button', {
      name: /Підключити до Claude Desktop\/CLI/i,
    });
    fireEvent.click(autoBtn);

    await waitFor(() => {
      expect(screen.getByText(/автоматично підключено під капотом/i)).toBeDefined();
    });
  });

  it('triggers photo, video, and music generation in Media Studio', async () => {
    renderWithProviders(<CliIntegrationsSettingsCard />);

    // Generate Photo
    const photoBtn = screen.getByRole('button', {
      name: /Згенерувати тестове фото Марса/i,
    });
    fireEvent.click(photoBtn);

    await waitFor(() => {
      expect(screen.getByText(/Фото успішно згенеровано/i)).toBeDefined();
    });

    // Generate Music
    const musicBtn = screen.getByRole('button', {
      name: /Синтезувати космічний трек/i,
    });
    fireEvent.click(musicBtn);

    await waitFor(() => {
      expect(screen.getByText(/Аудіо-трек готовий/i)).toBeDefined();
    });
  });

  it('executes command in the Terminal Simulator and displays stdout output', async () => {
    renderWithProviders(<CliIntegrationsSettingsCard />);

    const cmdInput = screen.getByPlaceholderText(/Введіть CLI команду/i);
    fireEvent.change(cmdInput, { target: { value: 'cosmolost ping' } });

    const runBtn = screen.getByRole('button', { name: /Виконати/i });
    fireEvent.click(runBtn);

    await waitFor(() => {
      expect(screen.getByText(/pong - CosmoLost Desktop CLI Bridge online/i)).toBeDefined();
    });
  });
});
