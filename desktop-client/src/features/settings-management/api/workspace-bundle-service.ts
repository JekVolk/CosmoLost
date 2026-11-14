import type { ScheduledTask } from '@/entities/scheduler';
import { type DesktopSettings, DesktopSettingsSchema } from '@/entities/settings';
import {
  type ProjectProfile,
  type ValidationErrorItem,
  type WorkspaceBundle,
  WorkspaceBundleSchema,
} from '../model/workspace-bundle-schema';

export interface ValidateBundleResult {
  isValid: boolean;
  bundle?: WorkspaceBundle;
  errors: ValidationErrorItem[];
  syntaxError?: string;
  detectedType: 'full-workspace' | 'settings-only' | 'unknown';
}

export const workspaceBundleService = {
  createDefaultProject(): ProjectProfile {
    return {
      id: 'default-project',
      name: 'CosmoLost Production Workspace',
      description: 'Primary desktop client project and environment profiles',
      environment: 'production',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['desktop', 'production', 'cosmolost'],
    };
  },

  exportBundle(params: {
    project?: ProjectProfile;
    settings: DesktopSettings;
    tasks: ScheduledTask[];
  }): string {
    const payload: WorkspaceBundle = {
      version: 1,
      app: 'CosmoLost Desktop Client',
      exportedAt: new Date().toISOString(),
      project: params.project ?? this.createDefaultProject(),
      settings: params.settings,
      tasks: params.tasks,
    };

    const validated = WorkspaceBundleSchema.parse(payload);
    return JSON.stringify(validated, null, 2);
  },

  validateBundle(rawJson: string): ValidateBundleResult {
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawJson);
    } catch (error) {
      const syntaxError = error instanceof Error ? error.message : 'Invalid JSON format';
      return {
        isValid: false,
        syntaxError,
        detectedType: 'unknown',
        errors: [
          {
            field: 'JSON.parse',
            message: syntaxError,
            code: 'SYNTAX_ERROR',
          },
        ],
      };
    }

    // Try parsing as full workspace bundle
    const fullResult = WorkspaceBundleSchema.safeParse(parsed);
    if (fullResult.success) {
      return {
        isValid: true,
        bundle: fullResult.data,
        errors: [],
        detectedType: 'full-workspace',
      };
    }

    // Try parsing as settings only
    const candidateSettings =
      parsed && typeof parsed === 'object' && 'settings' in parsed
        ? (parsed as { settings: unknown }).settings
        : parsed;

    const settingsResult = DesktopSettingsSchema.safeParse(candidateSettings);
    if (settingsResult.success) {
      const fallbackBundle: WorkspaceBundle = {
        version: 1,
        app: 'CosmoLost Desktop Client',
        exportedAt: new Date().toISOString(),
        project: this.createDefaultProject(),
        settings: settingsResult.data,
        tasks: [],
      };
      return {
        isValid: true,
        bundle: fallbackBundle,
        errors: [],
        detectedType: 'settings-only',
      };
    }

    // Map Zod errors
    const errors: ValidationErrorItem[] = fullResult.error.issues.map((issue) => ({
      field: issue.path.join('.') || 'root',
      message: issue.message,
      code: issue.code,
    }));

    return {
      isValid: false,
      errors,
      detectedType: 'unknown',
    };
  },

  downloadFile(jsonContent: string, filename = 'cosmolost-workspace-bundle.json'): void {
    if (typeof window === 'undefined') return;

    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  },
};
