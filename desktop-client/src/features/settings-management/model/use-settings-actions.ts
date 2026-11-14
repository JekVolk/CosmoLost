import { useSchedulerStore } from '@/entities/scheduler';
import {
  type AccentColor,
  type Language,
  type ThemeMode,
  settingsRepository,
  useSettingsStore,
} from '@/entities/settings';
import { useDiagnosticsStore } from '@/shared';
import { isTauri } from '@tauri-apps/api/core';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type ValidateBundleResult, workspaceBundleService } from '../api/workspace-bundle-service';
import type { ProjectProfile } from './workspace-bundle-schema';

export type ImportMode = 'overwrite' | 'merge';

export function useSettingsActions() {
  const { t } = useTranslation();
  const {
    settings,
    isHydrated,
    setAccentColor,
    setThemeMode,
    setLanguage,
    setAutoRefresh,
    setRefreshInterval,
    toggleCompactMode,
    toggleSound,
    toggleDeveloperMode,
    updateSettings,
    resetSettings,
  } = useSettingsStore();

  const schedulerStore = useSchedulerStore();
  const { addError } = useDiagnosticsStore();

  const [project, setProject] = useState<ProjectProfile>(() =>
    workspaceBundleService.createDefaultProject(),
  );
  const [importText, setImportText] = useState('');
  const [importMode, setImportMode] = useState<ImportMode>('overwrite');
  const [validationResult, setValidationResult] = useState<ValidateBundleResult | null>(null);

  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const isTauriNative = isTauri();

  const handleExportWorkspace = async () => {
    try {
      const jsonStr = workspaceBundleService.exportBundle({
        project,
        settings,
        tasks: schedulerStore.tasks,
      });

      workspaceBundleService.downloadFile(
        jsonStr,
        `cosmolost-${project.name.toLowerCase().replace(/\s+/g, '-')}-bundle.json`,
      );

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(jsonStr);
      }

      updateSettings({ lastExportedAt: new Date().toISOString() });
      setFeedback({
        type: 'success',
        message: 'Full Workspace & Project Bundle (.json) exported & copied to clipboard!',
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown export error';
      addError('Workspace Export', msg);
      setFeedback({ type: 'error', message: `Export failed: ${msg}` });
    }
  };

  const handleExportSettingsOnly = async () => {
    try {
      const jsonStr = settingsRepository.exportToJson(settings);
      settingsRepository.downloadAsFile(jsonStr);

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(jsonStr);
      }

      updateSettings({ lastExportedAt: new Date().toISOString() });
      setFeedback({
        type: 'success',
        message: t('settings.exportSuccess'),
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown export error';
      addError('Settings Export', msg);
      setFeedback({ type: 'error', message: `Export failed: ${msg}` });
    }
  };

  const handleValidateText = (text: string) => {
    setImportText(text);
    if (!text.trim()) {
      setValidationResult(null);
      return;
    }

    const result = workspaceBundleService.validateBundle(text);
    setValidationResult(result);
  };

  const handleApplyImport = () => {
    if (!importText.trim()) {
      setFeedback({
        type: 'error',
        message: 'Please paste or upload JSON configuration before applying.',
      });
      return;
    }

    const validation = workspaceBundleService.validateBundle(importText);
    setValidationResult(validation);

    if (!validation.isValid || !validation.bundle) {
      const issues = validation.errors.map((e) => `${e.field}: ${e.message}`).join('; ');
      const errorMsg = `Validation failed: ${validation.syntaxError || issues}`;
      addError('Import Validation', errorMsg, undefined, {
        errors: validation.errors,
      });
      setFeedback({
        type: 'error',
        message: errorMsg,
      });
      return;
    }

    const { bundle } = validation;

    try {
      // Apply settings
      updateSettings(bundle.settings);

      // Apply project metadata
      if (bundle.project) {
        setProject(bundle.project);
      }

      // Apply tasks according to importMode (Overwrite vs Merge)
      if (bundle.tasks && bundle.tasks.length > 0) {
        if (importMode === 'overwrite') {
          // Overwrite mode: clear and set imported tasks
          useSchedulerStore.setState({ tasks: bundle.tasks });
        } else {
          // Merge mode: append or update matching
          const currentTasks = useSchedulerStore.getState().tasks;
          const merged = [...currentTasks];
          for (const incoming of bundle.tasks) {
            const index = merged.findIndex((t) => t.id === incoming.id);
            if (index >= 0) {
              merged[index] = incoming;
            } else {
              merged.push(incoming);
            }
          }
          useSchedulerStore.setState({ tasks: merged });
        }
      }

      setFeedback({
        type: 'success',
        message: `Successfully imported [${bundle.project?.name || 'Project'}] with mode "${importMode.toUpperCase()}"!`,
      });
      setImportText('');
      setValidationResult(null);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to apply import';
      addError('Apply Import', msg);
      setFeedback({ type: 'error', message: msg });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        handleValidateText(text);
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    resetSettings();
    schedulerStore.resetToDefaults();
    setProject(workspaceBundleService.createDefaultProject());
    setFeedback({
      type: 'success',
      message: t('settings.resetSuccess'),
    });
  };

  return {
    settings,
    project,
    tasks: schedulerStore.tasks,
    isHydrated,
    isTauriNative,
    importText,
    importMode,
    validationResult,
    feedback,
    setImportMode,
    setProject,
    clearFeedback: () => setFeedback({ type: null, message: '' }),
    setAccentColor: (color: AccentColor) => setAccentColor(color),
    setThemeMode: (mode: ThemeMode) => setThemeMode(mode),
    setLanguage: (lang: Language) => setLanguage(lang),
    toggleAutoRefresh: () => setAutoRefresh(!settings.autoRefreshMetrics),
    setRefreshInterval: (sec: number) => setRefreshInterval(sec),
    toggleCompactMode,
    toggleSound,
    toggleDeveloperMode,
    handleExportWorkspace,
    handleExportSettingsOnly,
    handleValidateText,
    handleApplyImport,
    handleFileUpload,
    handleReset,
  };
}
