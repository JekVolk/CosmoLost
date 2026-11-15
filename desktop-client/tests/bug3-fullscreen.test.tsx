import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_SETTINGS, SettingsSummaryCard, useSettingsStore } from '../src/entities/settings';
import { SettingsPreferencesCard } from '../src/features/settings-management';

// Mock Tauri window API
const mockSetFullscreen = vi.fn().mockResolvedValue(undefined);
const mockIsFullscreen = vi.fn().mockResolvedValue(false);

vi.mock('@tauri-apps/api/window', () => ({
  getCurrentWindow: () => ({
    setFullscreen: mockSetFullscreen,
    isFullscreen: mockIsFullscreen,
  }),
}));

const renderWithChakra = (ui: React.ReactElement) => {
  return render(<ChakraProvider value={defaultSystem}>{ui}</ChakraProvider>);
};

describe('Bug 3: Fullscreen Mode in Settings', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('has isFullscreen defaulting to false in DEFAULT_SETTINGS and schema', () => {
    expect(DEFAULT_SETTINGS.isFullscreen).toBe(false);
    const state = useSettingsStore.getState();
    expect(state.settings.isFullscreen).toBe(false);
  });

  it('updates isFullscreen state and calls setFullscreen on toggleFullscreen and setFullscreen', async () => {
    const store = useSettingsStore.getState();
    expect(store.settings.isFullscreen).toBe(false);

    // Test toggleFullscreen
    await store.toggleFullscreen();
    expect(useSettingsStore.getState().settings.isFullscreen).toBe(true);
    expect(mockSetFullscreen).toHaveBeenCalledWith(true);

    // Test toggleFullscreen again to turn off
    await useSettingsStore.getState().toggleFullscreen();
    expect(useSettingsStore.getState().settings.isFullscreen).toBe(false);
    expect(mockSetFullscreen).toHaveBeenCalledWith(false);

    // Test setFullscreen directly
    await useSettingsStore.getState().setFullscreen(true);
    expect(useSettingsStore.getState().settings.isFullscreen).toBe(true);
    expect(mockSetFullscreen).toHaveBeenCalledWith(true);

    // Reset to false
    await useSettingsStore.getState().setFullscreen(false);
    expect(useSettingsStore.getState().settings.isFullscreen).toBe(false);
  });

  it('renders Fullscreen Mode row in SettingsSummaryCard with toggle button', () => {
    const onToggle = vi.fn();
    renderWithChakra(
      <SettingsSummaryCard
        settings={{ ...DEFAULT_SETTINGS, isFullscreen: false }}
        isHydrated={true}
        isTauriNative={true}
        onToggleFullscreen={onToggle}
      />,
    );

    expect(screen.getByText(/WINDOWED/i)).toBeDefined();
    const toggleBtn = screen.getByRole('button', { name: /Повноекранний режим|Fullscreen Mode/i });
    expect(toggleBtn).toBeDefined();

    fireEvent.click(toggleBtn);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('renders prominent Fullscreen Mode section in SettingsPreferencesCard', () => {
    const onToggle = vi.fn();
    renderWithChakra(
      <SettingsPreferencesCard
        settings={{ ...DEFAULT_SETTINGS, isFullscreen: false }}
        onAccentChange={vi.fn()}
        onThemeModeChange={vi.fn()}
        onLanguageChange={vi.fn()}
        onToggleAutoRefresh={vi.fn()}
        onIntervalChange={vi.fn()}
        onToggleCompact={vi.fn()}
        onToggleSound={vi.fn()}
        onToggleDevMode={vi.fn()}
        onToggleFullscreen={onToggle}
        onReset={vi.fn()}
      />,
    );

    const fullscreenElements = screen.getAllByText(/Повноекранний режим|Fullscreen Mode/i);
    expect(fullscreenElements.length).toBeGreaterThan(0);

    const buttons = screen.getAllByRole('button');
    const fullscreenBtn = buttons.find(
      (b) =>
        b.textContent?.includes('Fullscreen') || b.textContent?.includes('Повноекранний режим'),
    );
    expect(fullscreenBtn).toBeDefined();

    if (fullscreenBtn) {
      fireEvent.click(fullscreenBtn);
      expect(onToggle).toHaveBeenCalled();
    }
  });
});
