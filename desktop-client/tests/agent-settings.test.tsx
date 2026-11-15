import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_AGENT_PROFILES, useSettingsStore } from '../src/entities/settings';
import {
  downloadAgent,
  downloadAllAgents,
  exportAgentJson,
  exportAgentSkillMarkdown,
  exportAllAgentsBundle,
} from '../src/features/settings-management/api/agent-export-service';
import { AgentStudioSettingsCard } from '../src/features/settings-management/ui/AgentStudioSettingsCard';

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

describe('Agent Studio, AI Profiles & Export Service', () => {
  beforeEach(() => {
    useSettingsStore.getState().resetSettings();
  });

  afterEach(() => {
    cleanup();
  });

  it('formats AgentProfile as Markdown skill with YAML frontmatter', () => {
    const agent = DEFAULT_AGENT_PROFILES[0];
    const md = exportAgentSkillMarkdown(agent);

    expect(md).toContain(`name: ${agent.name}`);
    expect(md).toContain(`model: ${agent.model}`);
    expect(md).toContain(`temperature: ${agent.temperature}`);
    expect(md).toContain('## System Prompt');
    expect(md).toContain(agent.systemPrompt);
  });

  it('formats AgentProfile as JSON and bundles all agents', () => {
    const agent = DEFAULT_AGENT_PROFILES[1];
    const jsonStr = exportAgentJson(agent);
    const parsed = JSON.parse(jsonStr);

    expect(parsed.version).toBe(1);
    expect(parsed.type).toBe('cosmolost-agent-profile');
    expect(parsed.agent.id).toBe('fact_checker');

    const bundleStr = exportAllAgentsBundle(DEFAULT_AGENT_PROFILES);
    const parsedBundle = JSON.parse(bundleStr);
    expect(parsedBundle.type).toBe('cosmolost-multi-agent-bundle');
    expect(parsedBundle.agentsCount).toBe(4);
    expect(parsedBundle.agents.length).toBe(4);
  });

  it('handles downloadAgent and downloadAllAgents gracefully in test environment', () => {
    const resMd = downloadAgent(DEFAULT_AGENT_PROFILES[0], 'markdown');
    const resJson = downloadAgent(DEFAULT_AGENT_PROFILES[0], 'json');
    const resBundle = downloadAllAgents(DEFAULT_AGENT_PROFILES);

    // In happy-dom / test environment, document.createElement('a') triggers or succeeds
    expect(typeof resMd).toBe('boolean');
    expect(typeof resJson).toBe('boolean');
    expect(typeof resBundle).toBe('boolean');
  });

  it('renders AgentStudioSettingsCard and allows editing prompts and saving to store', async () => {
    renderWithProviders(<AgentStudioSettingsCard />);

    // Check title and badges
    expect(screen.getByText(/Студія Агентів CosmoLost & Профілі ШІ/i)).toBeDefined();
    expect(screen.getByText(/Multi-Agent Engine/i)).toBeDefined();

    // Verify default agents exist in switcher
    expect(screen.getByRole('button', { name: /CosmoScriptwriter/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /CosmoFactChecker/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /CosmoDirector/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /CosmoPublisher/i })).toBeDefined();

    // Switch to CosmoFactChecker
    const factCheckerBtn = screen.getByRole('button', { name: /CosmoFactChecker/i });
    fireEvent.click(factCheckerBtn);

    // Check that header updates to selected agent
    expect(screen.getByText(/Налаштування агента: CosmoFactChecker/i)).toBeDefined();

    // Edit prompt textarea
    const textarea = screen.getByDisplayValue(/You are CosmoFactChecker/i) as HTMLTextAreaElement;
    fireEvent.change(textarea, {
      target: { value: 'Custom audited system prompt for strict astrophysics facts.' },
    });

    // Click Save button
    const saveBtn = screen.getByRole('button', { name: /Зберегти агента/i });
    fireEvent.click(saveBtn);

    // Verify notification appeared
    expect(
      screen.getByText(/Профіль агента \[CosmoFactChecker\] успішно збережено/i),
    ).toBeDefined();

    // Verify store has the updated prompt
    const savedAgents = useSettingsStore.getState().settings.agentProfiles;
    const updated = savedAgents?.find((a) => a.id === 'fact_checker');
    expect(updated?.systemPrompt).toBe(
      'Custom audited system prompt for strict astrophysics facts.',
    );
  });
});
