import {
  type AccentColor,
  type Language,
  type ThemeMode,
  settingsRepository,
  useSettingsStore,
} from '@/entities/settings';
import { isTauri } from '@tauri-apps/api/core';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

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

  const [importText, setImportText] = useState('');
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const isTauriNative = isTauri();

  const handleExport = async () => {
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
      setFeedback({
        type: 'error',
        message: `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  };

  const handleImport = () => {
    if (!importText.trim()) {
      setFeedback({
        type: 'error',
        message: 'Please paste valid JSON configuration first.',
      });
      return;
    }

    try {
      const parsed = settingsRepository.importFromJson(importText);
      updateSettings(parsed);
      setFeedback({
        type: 'success',
        message: t('settings.importSuccess'),
      });
      setImportText('');
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to import settings.',
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        setImportText(text);
        try {
          const parsed = settingsRepository.importFromJson(text);
          updateSettings(parsed);
          setFeedback({
            type: 'success',
            message: `Loaded & validated from ${file.name}: ${t('settings.importSuccess')}`,
          });
          setImportText('');
        } catch (error) {
          setFeedback({
            type: 'error',
            message: error instanceof Error ? error.message : 'Invalid JSON file content.',
          });
        }
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    resetSettings();
    setFeedback({
      type: 'success',
      message: t('settings.resetSuccess'),
    });
  };

  return {
    settings,
    isHydrated,
    isTauriNative,
    importText,
    feedback,
    setImportText,
    clearFeedback: () => setFeedback({ type: null, message: '' }),
    setAccentColor: (color: AccentColor) => setAccentColor(color),
    setThemeMode: (mode: ThemeMode) => setThemeMode(mode),
    setLanguage: (lang: Language) => setLanguage(lang),
    toggleAutoRefresh: () => setAutoRefresh(!settings.autoRefreshMetrics),
    setRefreshInterval: (sec: number) => setRefreshInterval(sec),
    toggleCompactMode,
    toggleSound,
    toggleDeveloperMode,
    handleExport,
    handleImport,
    handleFileUpload,
    handleReset,
  };
}
