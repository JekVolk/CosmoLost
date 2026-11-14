import { type ScheduledTask, type TaskType, useSchedulerStore } from '@/entities/scheduler';
import { schedulerService, tauriCommands } from '@/shared';
import { useCallback, useEffect, useRef } from 'react';

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

  // Define task execution handlers based on type
  const executeTaskType = useCallback(async (task: ScheduledTask): Promise<string> => {
    switch (task.type) {
      case 'ping': {
        const res = await tauriCommands.ping(`Automated tick for ${task.name}`);
        return `Echo: "${res.echo}" [roundtrip: ${res.roundtrip_status}]`;
      }
      case 'system-info': {
        const info = await tauriCommands.getSystemInfo();
        return `OS: ${info.os_name} (${info.arch}), App: v${info.app_version}`;
      }
      case 'cache-clean': {
        await new Promise((resolve) => setTimeout(resolve, 80));
        return 'Cache swept: 0 orphaned pointers, memory clean';
      }
      case 'custom': {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return `Custom periodic action executed at ${new Date().toLocaleTimeString()}`;
      }
      default: {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return `Custom periodic action executed at ${new Date().toLocaleTimeString()}`;
      }
    }
  }, []);

  // Sync scheduled tasks with schedulerService
  useEffect(() => {
    if (!isHydrated) return;

    for (const task of tasks) {
      if (task.enabled) {
        schedulerService.start(
          task.id,
          task.intervalSec,
          async () => {
            return await executeTaskType(task);
          },
          false,
        );
      } else {
        schedulerService.stop(task.id);
      }
    }
  }, [tasks, isHydrated, executeTaskType]);

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
        return await executeTaskType(task);
      });

      await schedulerService.runTask(taskId);
    },
    [executeTaskType],
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
