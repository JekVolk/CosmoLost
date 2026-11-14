import type { ScheduledTask, TaskExecutionLog, TaskStatus, TaskType } from './schema';

export type { ScheduledTask, TaskExecutionLog, TaskStatus, TaskType };

export interface SchedulerStoreState {
  tasks: ScheduledTask[];
  logs: TaskExecutionLog[];
  isHydrated: boolean;
  addTask: (
    task: Omit<
      ScheduledTask,
      'id' | 'status' | 'lastRunAt' | 'nextRunAt' | 'runCount' | 'lastDurationMs' | 'lastResult'
    >,
  ) => void;
  removeTask: (taskId: string) => void;
  toggleTask: (taskId: string) => void;
  updateTaskInterval: (taskId: string, intervalSec: number) => void;
  recordTaskRun: (params: {
    taskId: string;
    status: 'success' | 'error';
    durationMs: number;
    result: string;
  }) => void;
  setTaskRunning: (taskId: string) => void;
  clearLogs: () => void;
  resetToDefaults: () => void;
  setHydrated: (hydrated: boolean) => void;
}
