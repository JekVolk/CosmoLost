import { useDiagnosticsStore } from '../diagnostics/diagnostics-store';

export interface DesktopMcpBridgeApi {
  isReady: boolean;
  getAppState: () => {
    currentRoute: string;
    timestamp: string;
    theme: {
      mode: string;
      accent: string;
    };
    language: string;
    scheduler: {
      totalTasks: number;
      activeCount: number;
    };
    diagnostics: {
      errorCount: number;
    };
  };
  navigateTo: (route: string) => boolean;
  setTheme: (params: {
    mode?: 'dark' | 'light' | 'system';
    accent?: string;
  }) => boolean;
  triggerTask: (taskId: string) => Promise<string>;
  getTasks: () => unknown[];
  getLogs: () => unknown[];
  exportBundle: () => string;
  executeTool: (toolName: string, args?: Record<string, unknown>) => Promise<unknown>;
}

declare global {
  interface Window {
    __COSMOLOST_MCP__?: DesktopMcpBridgeApi;
  }
}

export interface StateProviders {
  getSettings?: () => Record<string, unknown>;
  getTasks?: () => Array<{ id: string; name?: string; enabled?: boolean }>;
}

class DesktopMcpBridge implements DesktopMcpBridgeApi {
  public isReady = true;
  private stateProviders: StateProviders = {};

  registerStateProviders(providers: StateProviders): void {
    this.stateProviders = { ...this.stateProviders, ...providers };
  }

  getAppState() {
    const route =
      typeof window !== 'undefined'
        ? window.location.hash.replace('#', '') || '/overview'
        : '/overview';

    // Live state from registered providers, with localStorage fallback
    const liveSettings = this.stateProviders.getSettings?.();
    let themeMode = (liveSettings?.themeMode as string) || 'dark';
    let accentColor = (liveSettings?.accentColor as string) || 'blue';
    let language = (liveSettings?.language as string) || 'en';

    if (!liveSettings) {
      try {
        const rawSettings = localStorage.getItem('cosmolost-app-settings');
        if (rawSettings) {
          const parsed = JSON.parse(rawSettings);
          themeMode = parsed.state?.settings?.themeMode || 'dark';
          accentColor = parsed.state?.settings?.accentColor || 'blue';
          language = parsed.state?.settings?.language || 'en';
        }
      } catch {
        // Fallback
      }
    }

    const liveTasks = this.stateProviders.getTasks?.();
    let totalTasks = liveTasks?.length || 0;
    let activeCount = liveTasks?.filter((t) => t.enabled).length || 0;

    if (!liveTasks) {
      try {
        const rawTasks = localStorage.getItem('cosmolost-scheduler-tasks');
        if (rawTasks) {
          const parsed = JSON.parse(rawTasks);
          const tasks = parsed.state?.tasks || [];
          totalTasks = tasks.length;
          activeCount = tasks.filter((t: { enabled: boolean }) => t.enabled).length;
        }
      } catch {
        // Fallback
      }
    }

    const errors = useDiagnosticsStore.getState().errors;

    return {
      currentRoute: route,
      timestamp: new Date().toISOString(),
      theme: {
        mode: themeMode,
        accent: accentColor,
      },
      language,
      scheduler: {
        totalTasks,
        activeCount,
      },
      diagnostics: {
        errorCount: errors.length,
      },
    };
  }

  navigateTo(route: string): boolean {
    if (typeof window === 'undefined') return false;
    const formattedRoute = route.startsWith('/') ? route : `/${route}`;
    window.location.hash = `#${formattedRoute}`;
    return true;
  }

  setTheme(params: {
    mode?: 'dark' | 'light' | 'system';
    accent?: string;
  }): boolean {
    if (typeof window === 'undefined') return false;

    try {
      const raw = localStorage.getItem('cosmolost-app-settings');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (params.mode) parsed.state.settings.themeMode = params.mode;
        if (params.accent) parsed.state.settings.accentColor = params.accent;
        localStorage.setItem('cosmolost-app-settings', JSON.stringify(parsed));
        window.dispatchEvent(new Event('storage'));
        return true;
      }
    } catch {
      // ignore
    }
    return false;
  }

  async triggerTask(taskId: string): Promise<string> {
    try {
      const { schedulerService } = await import('../scheduler');
      await schedulerService.runTask(taskId);
      return `Task ${taskId} invoked via local MCP bridge`;
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Execution error';
      useDiagnosticsStore.getState().addError('Desktop MCP Bridge', msg);
      throw error;
    }
  }

  getTasks(): unknown[] {
    try {
      const raw = localStorage.getItem('cosmolost-scheduler-tasks');
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed.state?.tasks || [];
      }
    } catch {
      // ignore
    }
    return [];
  }

  getLogs(): unknown[] {
    return useDiagnosticsStore.getState().errors;
  }

  exportBundle(): string {
    const state = this.getAppState();
    const tasks = this.getTasks();
    const errors = this.getLogs();

    return JSON.stringify(
      {
        version: 1,
        app: 'CosmoLost Desktop Client',
        exportedVia: 'Local Desktop MCP Bridge',
        exportedAt: new Date().toISOString(),
        state,
        tasks,
        diagnostics: errors,
      },
      null,
      2,
    );
  }

  async executeTool(toolName: string, args: Record<string, unknown> = {}): Promise<unknown> {
    switch (toolName) {
      case 'get_app_state':
        return this.getAppState();
      case 'navigate_to':
        return {
          success: this.navigateTo(String(args.route || '/overview')),
          route: args.route,
        };
      case 'set_theme':
        return {
          success: this.setTheme({
            mode: args.mode as 'dark' | 'light' | 'system',
            accent: args.accent as string,
          }),
        };
      case 'trigger_task':
        return {
          message: await this.triggerTask(String(args.taskId || '')),
        };
      case 'get_tasks':
        return this.getTasks();
      case 'get_logs':
        return this.getLogs();
      case 'export_bundle':
        return this.exportBundle();
      case 'create_video_task': {
        const taskId = `task_${Date.now().toString(36)}`;
        return {
          success: true,
          taskId,
          artifactId: args.artifact_id,
          rubricId: args.rubric_id,
          status: 'QUEUED',
          targetDurationSec: 40,
        };
      }
      case 'get_render_status': {
        return {
          taskId: args.task_id,
          status: 'COMPLETED',
          progressPct: 100,
          outputFilePath: `C:\\Users\\CosmoCreator\\Videos\\CosmoLost\\${args.task_id}.mp4`,
        };
      }
      case 'trigger_social_publish': {
        return {
          success: true,
          taskId: args.task_id,
          platform: args.platform,
          status: 'PUBLISHED',
        };
      }
      case 'batch_generate_rubric': {
        const count = Number(args.count || 5);
        return {
          success: true,
          rubricId: args.rubric_id,
          totalTasks: count,
          status: 'QUEUED',
        };
      }
      case 'suggest_next_video_topic': {
        const artifactId = String(
          args.artifact_id || args.current_artifact_id || 'opportunity-rover',
        );
        const rubricId = String(args.rubric_id || 'last-sol-drama');
        const reason = String(args.selection_reason || 'Наукове відкриття та дослідження планет');

        return {
          success: true,
          currentArtifactId: artifactId,
          rubricId,
          selectionReason: reason,
          suggestedArtifactId:
            artifactId === 'opportunity-rover' ? 'spirit-rover' : 'apollo-11-lm-eagle',
          suggestedArtifactName:
            artifactId === 'opportunity-rover'
              ? 'Spirit Rover (MER-A)'
              : 'Apollo 11 Lunar Module (Eagle)',
          suggestedRubricId: rubricId,
          suggestedHook:
            artifactId === 'opportunity-rover'
              ? 'Як брат-близнюк Spirit застряг у смертельній пастці Troy?'
              : 'Чому спускний ступінь Аполлон-11 залишився на Місяці назавжди?',
          narrativeBridge: `Поки ${artifactId} виконував свою місію, на іншій ділянці розгорталася ще більш драматична історія...`,
          recommendedPinComment:
            'Який космічний апарат ви б повернули на Землю першим? Пишіть у коментарях! 👇',
        };
      }
      default:
        throw new Error(`Unknown desktop MCP bridge tool: ${toolName}`);
    }
  }
}

export const desktopMcpBridge = new DesktopMcpBridge();

// Automatically attach to window for local MCP clients, webviews, and agents
if (typeof window !== 'undefined') {
  window.__COSMOLOST_MCP__ = desktopMcpBridge;
}
