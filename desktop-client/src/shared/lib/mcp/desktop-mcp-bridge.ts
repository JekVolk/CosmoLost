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

class DesktopMcpBridge implements DesktopMcpBridgeApi {
  public isReady = true;

  getAppState() {
    const route =
      typeof window !== 'undefined'
        ? window.location.hash.replace('#', '') || '/overview'
        : '/overview';

    // Safely retrieve settings from localStorage or runtime store
    let themeMode = 'dark';
    let accentColor = 'blue';
    let language = 'en';

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

    let totalTasks = 0;
    let activeCount = 0;
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
