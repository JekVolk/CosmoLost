export type TaskCallback = (taskId: string) => Promise<string | undefined>;

export interface SchedulerEventPayload {
  taskId: string;
  timestamp: string;
  durationMs?: number;
  result?: string;
  error?: string;
}

export type SchedulerEventListener = (payload: SchedulerEventPayload) => void;

class SchedulerService {
  private timers = new Map<string, ReturnType<typeof setInterval>>();
  private taskCallbacks = new Map<string, TaskCallback>();
  private runningTasks = new Set<string>();
  private startListeners = new Set<SchedulerEventListener>();
  private successListeners = new Set<SchedulerEventListener>();
  private errorListeners = new Set<SchedulerEventListener>();

  register(taskId: string, callback: TaskCallback): void {
    this.taskCallbacks.set(taskId, callback);
  }

  unregister(taskId: string): void {
    this.stop(taskId);
    this.taskCallbacks.delete(taskId);
  }

  start(taskId: string, intervalSec: number, callback?: TaskCallback, runImmediate = false): void {
    this.stop(taskId);

    if (callback) {
      this.register(taskId, callback);
    }

    if (runImmediate) {
      this.runTask(taskId);
    }

    const intervalMs = Math.max(1, intervalSec) * 1000;
    const timer = setInterval(() => {
      this.runTask(taskId);
    }, intervalMs);

    this.timers.set(taskId, timer);
  }

  stop(taskId: string): void {
    const timer = this.timers.get(taskId);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(taskId);
    }
  }

  stopAll(): void {
    for (const timer of this.timers.values()) {
      clearInterval(timer);
    }
    this.timers.clear();
  }

  async runTask(taskId: string): Promise<void> {
    if (this.runningTasks.has(taskId)) {
      return; // Skip if already running
    }

    const callback = this.taskCallbacks.get(taskId);
    if (!callback) {
      return;
    }

    this.runningTasks.add(taskId);
    const start = performance.now();
    const timestamp = new Date().toISOString();

    for (const listener of this.startListeners) {
      listener({ taskId, timestamp });
    }

    try {
      const res = await callback(taskId);
      const durationMs = Math.round((performance.now() - start) * 100) / 100;
      const result = typeof res === 'string' ? res : 'Completed successfully';

      for (const listener of this.successListeners) {
        listener({ taskId, timestamp, durationMs, result });
      }
    } catch (error) {
      const durationMs = Math.round((performance.now() - start) * 100) / 100;
      const errorMsg = error instanceof Error ? error.message : 'Unknown execution failure';

      for (const listener of this.errorListeners) {
        listener({ taskId, timestamp, durationMs, error: errorMsg });
      }
    } finally {
      this.runningTasks.delete(taskId);
    }
  }

  isScheduled(taskId: string): boolean {
    return this.timers.has(taskId);
  }

  isRunning(taskId: string): boolean {
    return this.runningTasks.has(taskId);
  }

  onStart(listener: SchedulerEventListener): () => void {
    this.startListeners.add(listener);
    return () => this.startListeners.delete(listener);
  }

  onSuccess(listener: SchedulerEventListener): () => void {
    this.successListeners.add(listener);
    return () => this.successListeners.delete(listener);
  }

  onError(listener: SchedulerEventListener): () => void {
    this.errorListeners.add(listener);
    return () => this.errorListeners.delete(listener);
  }
}

export const schedulerService = new SchedulerService();
