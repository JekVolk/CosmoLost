import { type ScheduledTask, type TaskType, useSchedulerStore } from '@/entities/scheduler';
import { schedulerService } from '@/shared';
import { useCallback, useEffect, useRef } from 'react';
import { taskExecutorRegistry } from './task-executors';

export function useSchedulerEngine() {
  const {
    tasks,
    logs,
    isHydrated,
    addTask,
    removeTask,
    toggleTask,
    updateTaskInterval,
    setTaskRunning,
    recordTaskRun,
    clearLogs,
    resetToDefaults,
  } = useSchedulerStore();

  const tasksRef = useRef<ScheduledTask[]>(tasks);
  tasksRef.current = tasks;

  // Single responsibility: coordinate task execution via Strategy Registry (OCP)
  const executeTask = useCallback(async (task: ScheduledTask): Promise<string> => {
    const executor = taskExecutorRegistry.get(task.type);
    return await executor.execute(task);
  }, []);

  // Memoized signature of task configuration: only changes when tasks are added, removed, enabled/disabled, or intervals change.
  // Prevents timer restarts whenever execution metrics (runCount, lastRunAt, duration) update.
  const scheduleSignature = tasks
    .map((t) => `${t.id}:${t.enabled}:${t.intervalSec}:${t.type}`)
    .join('|');

  // Sync scheduled tasks with schedulerService without timer starvation
  useEffect(() => {
    if (!isHydrated) return;
    void scheduleSignature;

    for (const task of tasksRef.current) {
      if (task.enabled) {
        schedulerService.start(
          task.id,
          task.intervalSec,
          async (taskId) => {
            const currentTask = tasksRef.current.find((t) => t.id === taskId);
            if (!currentTask) return 'Task not found';
            return await executeTask(currentTask);
          },
          false,
        );
      } else {
        schedulerService.stop(task.id);
      }
    }
  }, [scheduleSignature, isHydrated, executeTask]);

  // Hook into event listeners
  useEffect(() => {
    const unsubStart = schedulerService.onStart(({ taskId }) => {
      setTaskRunning(taskId);
    });

    const unsubSuccess = schedulerService.onSuccess(({ taskId, durationMs, result }) => {
      recordTaskRun({
        taskId,
        status: 'success',
        durationMs: durationMs ?? 0,
        result: result ?? 'Success',
      });
    });

    const unsubError = schedulerService.onError(({ taskId, durationMs, error }) => {
      recordTaskRun({
        taskId,
        status: 'error',
        durationMs: durationMs ?? 0,
        result: error ?? 'Error',
      });
    });

    return () => {
      unsubStart();
      unsubSuccess();
      unsubError();
    };
  }, [setTaskRunning, recordTaskRun]);

  const triggerNow = useCallback(
    async (taskId: string) => {
      const task = tasksRef.current.find((t) => t.id === taskId);
      if (!task) return;

      schedulerService.register(taskId, async () => {
        return await executeTask(task);
      });

      await schedulerService.runTask(taskId);
    },
    [executeTask],
  );

  const handleCreateTask = useCallback(
    (name: string, type: TaskType, intervalSec: number) => {
      addTask({
        name,
        type,
        intervalSec,
        enabled: true,
      });
    },
    [addTask],
  );

  return {
    tasks,
    logs,
    isHydrated,
    triggerNow,
    toggleTask,
    removeTask,
    updateTaskInterval,
    handleCreateTask,
    clearLogs,
    resetToDefaults,
  };
}
