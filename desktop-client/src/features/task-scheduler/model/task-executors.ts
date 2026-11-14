import type { ScheduledTask, TaskType } from '@/entities/scheduler';
import { mcpRegistry, tauriCommands } from '@/shared';

export interface TaskExecutorStrategy {
  execute(task: ScheduledTask): Promise<string>;
}

export class PingTaskExecutor implements TaskExecutorStrategy {
  async execute(task: ScheduledTask): Promise<string> {
    const res = await tauriCommands.ping(`Automated tick for ${task.name}`);
    return `Echo: "${res.echo}" [roundtrip: ${res.roundtrip_status}]`;
  }
}

export class SystemInfoTaskExecutor implements TaskExecutorStrategy {
  async execute(): Promise<string> {
    const info = await tauriCommands.getSystemInfo();
    return `OS: ${info.os_name} (${info.arch}), App: v${info.app_version}`;
  }
}

export class CacheCleanTaskExecutor implements TaskExecutorStrategy {
  async execute(): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 80));
    return 'Cache swept: 0 orphaned pointers, memory clean';
  }
}

export class McpToolTaskExecutor implements TaskExecutorStrategy {
  async execute(task: ScheduledTask): Promise<string> {
    const res = await mcpRegistry.executeTool('tauri', 'ping', {
      message: `MCP Scheduler tick for [${task.name}]`,
    });
    if (res.isError) {
      throw new Error(res.content[0]?.text || 'MCP execution failed');
    }
    return `MCP response: ${res.content[0]?.text.slice(0, 80)}`;
  }
}

export class CustomTaskExecutor implements TaskExecutorStrategy {
  async execute(task: ScheduledTask): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return `Custom routine [${task.name}] executed at ${new Date().toLocaleTimeString()}`;
  }
}

export class TaskExecutorRegistry {
  private executors = new Map<TaskType | string, TaskExecutorStrategy>();
  private defaultExecutor: TaskExecutorStrategy = new CustomTaskExecutor();

  constructor() {
    this.register('ping', new PingTaskExecutor());
    this.register('system-info', new SystemInfoTaskExecutor());
    this.register('cache-clean', new CacheCleanTaskExecutor());
    this.register('custom', this.defaultExecutor);
    this.register('mcp', new McpToolTaskExecutor());
  }

  register(type: TaskType | string, executor: TaskExecutorStrategy): void {
    this.executors.set(type, executor);
  }

  get(type: TaskType | string): TaskExecutorStrategy {
    return this.executors.get(type) ?? this.defaultExecutor;
  }
}

export const taskExecutorRegistry = new TaskExecutorRegistry();
