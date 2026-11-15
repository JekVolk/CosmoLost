import { useSchedulerStore } from './scheduler-store';
import type { ScheduledTask, TaskExecutionLog } from './types';

export const useSchedulerTasks = (): ScheduledTask[] => useSchedulerStore((state) => state.tasks);

export const useSchedulerLogs = (): TaskExecutionLog[] => useSchedulerStore((state) => state.logs);

export const useSchedulerHydrated = (): boolean => useSchedulerStore((state) => state.isHydrated);
