import { describe, expect, it } from 'vitest';
import { workspaceBundleService } from '../src/features/settings-management/api/workspace-bundle-service';

describe('Workspace Bundle Import/Export & Schema Validation', () => {
  it('exports valid workspace bundle with required meta and settings', () => {
    const raw = workspaceBundleService.exportBundle({
      settings: {
        themeMode: 'dark',
        accentColor: 'teal',
        language: 'uk',
        compactMode: false,
        developerMode: true,
        autoRefreshMetrics: true,
        telemetryFrequencySec: 15,
        defaultMcpServerId: 'tauri',
        enableDiagnosticsLog: true,
      },
      tasks: [],
    });

    const parsed = JSON.parse(raw);
    expect(parsed.version).toBe(1);
    expect(parsed.app).toBe('CosmoLost Desktop Client');
    expect(parsed.settings.accentColor).toBe('teal');
  });

  it('validates a full workspace bundle successfully', () => {
    const jsonStr = JSON.stringify({
      version: 1,
      app: 'CosmoLost Desktop Client',
      exportedAt: new Date().toISOString(),
      project: {
        id: 'test-project',
        name: 'Test Project',
        description: 'Test',
        environment: 'staging',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ['test'],
      },
      settings: {
        themeMode: 'dark',
        accentColor: 'purple',
        language: 'en',
        compactMode: false,
        developerMode: false,
        autoRefreshMetrics: true,
        telemetryFrequencySec: 30,
        defaultMcpServerId: 'tauri',
        enableDiagnosticsLog: false,
      },
      tasks: [],
    });

    const result = workspaceBundleService.validateBundle(jsonStr);
    expect(result.isValid).toBe(true);
    expect(result.detectedType).toBe('full-workspace');
    expect(result.bundle?.settings.accentColor).toBe('purple');
  });

  it('parses settings-only payload and wraps in fallback workspace bundle', () => {
    const settingsOnly = JSON.stringify({
      themeMode: 'light',
      accentColor: 'orange',
      language: 'uk',
      compactMode: true,
      developerMode: false,
      autoRefreshMetrics: false,
      telemetryFrequencySec: 60,
      defaultMcpServerId: 'tauri',
      enableDiagnosticsLog: true,
    });

    const result = workspaceBundleService.validateBundle(settingsOnly);
    expect(result.isValid).toBe(true);
    expect(result.detectedType).toBe('settings-only');
    expect(result.bundle?.settings.accentColor).toBe('orange');
  });

  it('rejects malformed JSON syntax with SYNTAX_ERROR', () => {
    const malformed = '{ themeMode: "dark", unclosed: ';
    const result = workspaceBundleService.validateBundle(malformed);

    expect(result.isValid).toBe(false);
    expect(result.syntaxError).toBeDefined();
    expect(result.detectedType).toBe('unknown');
    expect(result.errors[0]?.code).toBe('SYNTAX_ERROR');
  });

  it('rejects payload with invalid field types', () => {
    const invalidTypes = JSON.stringify({
      themeMode: 12345, // invalid type
      accentColor: false,
    });

    const result = workspaceBundleService.validateBundle(invalidTypes);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
