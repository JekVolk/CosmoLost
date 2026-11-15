import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useSchedulerStore } from '../src/entities/scheduler';
import { useSettingsStore } from '../src/entities/settings';
import { SettingsImportExportCard } from '../src/features/settings-management/ui/SettingsImportExportCard';
import { SettingsPreferencesCard } from '../src/features/settings-management/ui/SettingsPreferencesCard';
import { TaskListTable } from '../src/features/task-scheduler/ui/TaskListTable';

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

describe('QA UI Test: Scheduler & Settings Interactive Flows', () => {
  beforeEach(() => {
    useSchedulerStore.getState().resetToDefaults();
    useSettingsStore.getState().resetSettings();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Task Scheduler UI Flow', () => {
    it('renders scheduled tasks and allows running a task manually', async () => {
      renderWithProviders(
        <TaskListTable
          tasks={useSchedulerStore.getState().tasks}
          onTriggerNow={async (id) => {
            useSchedulerStore.getState().recordTaskRun({
              taskId: id,
              status: 'success',
              durationMs: 12,
              result: 'Manual run success',
            });
          }}
          onToggleTask={useSchedulerStore.getState().toggleTask}
          onRemoveTask={useSchedulerStore.getState().removeTask}
          onReset={useSchedulerStore.getState().resetToDefaults}
        />,
      );

      // Verify task rows exist
      expect(screen.getByText(/IPC Rust Core Ping Check/i)).toBeDefined();

      // Find the first run task button (title="Trigger Immediate Execution" or Run Now)
      const runButtons = screen.getAllByTitle(/Trigger Immediate Execution/i);
      expect(runButtons.length).toBeGreaterThan(0);

      const firstRunBtn = runButtons[0];
      if (firstRunBtn) {
        fireEvent.click(firstRunBtn);
      }

      await waitFor(() => {
        const tasks = useSchedulerStore.getState().tasks;
        const pingTask = tasks.find((t) => t.id === 'ipc-health-check');
        expect(pingTask?.runCount).toBeGreaterThanOrEqual(1);
      });
    });

    it('toggles task enabled status when pause/resume button is clicked', async () => {
      renderWithProviders(
        <TaskListTable
          tasks={useSchedulerStore.getState().tasks}
          onTriggerNow={() => {}}
          onToggleTask={useSchedulerStore.getState().toggleTask}
          onRemoveTask={useSchedulerStore.getState().removeTask}
          onReset={useSchedulerStore.getState().resetToDefaults}
        />,
      );

      const pauseButtons = screen.getAllByTitle(/Pause Schedule/i);
      expect(pauseButtons.length).toBeGreaterThan(0);

      const firstPauseBtn = pauseButtons[0];
      if (firstPauseBtn) {
        fireEvent.click(firstPauseBtn);
      }

      await waitFor(() => {
        const tasks = useSchedulerStore.getState().tasks;
        const pingTask = tasks.find((t) => t.id === 'ipc-health-check');
        expect(pingTask?.enabled).toBe(false);
      });
    });
  });

  describe('Settings Preferences & Import/Export Flow', () => {
    it('changes theme appearance mode and language', async () => {
      renderWithProviders(
        <SettingsPreferencesCard
          settings={useSettingsStore.getState().settings}
          onAccentChange={useSettingsStore.getState().setAccentColor}
          onThemeModeChange={useSettingsStore.getState().setThemeMode}
          onLanguageChange={useSettingsStore.getState().setLanguage}
          onToggleAutoRefresh={() => {}}
          onIntervalChange={() => {}}
          onToggleCompact={useSettingsStore.getState().toggleCompactMode}
          onToggleSound={useSettingsStore.getState().toggleSound}
          onToggleDevMode={useSettingsStore.getState().toggleDeveloperMode}
          onReset={useSettingsStore.getState().resetSettings}
        />,
      );

      // Switch to light mode
      const lightBtn = screen.getByRole('button', { name: /Light/i });
      fireEvent.click(lightBtn);

      expect(useSettingsStore.getState().settings.themeMode).toBe('light');

      // Switch language to Ukrainian
      const ukBtn = screen.getByRole('button', { name: /Українська/i });
      fireEvent.click(ukBtn);

      expect(useSettingsStore.getState().settings.language).toBe('uk');
    });

    it('exports settings bundle and handles import validation', async () => {
      renderWithProviders(
        <SettingsImportExportCard
          importText=""
          importMode="overwrite"
          validationResult={{
            isValid: false,
            syntaxError: 'SYNTAX_ERROR: Unexpected token in JSON at position 16',
            detectedType: 'unknown',
            errors: [
              {
                field: 'JSON.parse',
                message: 'Unexpected token in JSON',
                code: 'SYNTAX_ERROR',
              },
            ],
          }}
          feedback={{ type: null, message: '' }}
          onImportModeChange={() => {}}
          onImportTextChange={() => {}}
          onExportWorkspace={() => {}}
          onExportSettingsOnly={() => {}}
          onApplyImport={() => {}}
          onFileUpload={() => {}}
        />,
      );

      // Verify validation error card displays
      expect(screen.getByText(/SYNTAX_ERROR/i)).toBeDefined();
    });
  });
});
