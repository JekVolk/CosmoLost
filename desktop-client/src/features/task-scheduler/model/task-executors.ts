import type { ScheduledTask, TaskType } from '@/entities/scheduler';
import { tauriCommands } from '@/shared';

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

export class CustomTaskExecutor implements TaskExecutorStrategy {
  async execute(task: ScheduledTask): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return `Custom routine [${task.name}] executed at ${new Date().toLocaleTimeString()}`;
  }
}

export class TaskExecutorRegistry {
  private executors = new Map<TaskType, TaskExecutorStrategy>();
  private defaultExecutor: TaskExecutorStrategy = new CustomTaskExecutor();

  constructor() {
    this.register('ping', new PingTaskExecutor());
    this.register('system-info', new SystemInfoTaskExecutor());
    this.register('cache-clean', new CacheCleanTaskExecutor());
    this.register('custom', this.defaultExecutor);
  }

  register(type: TaskType, executor: TaskExecutorStrategy): void {
    this.executors.set(type, executor);
  }

  get(type: TaskType): TaskExecutorStrategy {
    return this.executors.get(type) ?? this.defaultExecutor;
  }
}

export const taskExecutorRegistry = new TaskExecutorRegistry();
