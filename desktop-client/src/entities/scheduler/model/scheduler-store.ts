import { tauriStorage } from '@/shared';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { DEFAULT_SCHEDULED_TASKS } from './defaults';
import type { ScheduledTask, SchedulerStoreState, TaskExecutionLog } from './types';

export const useSchedulerStore = create<SchedulerStoreState>()(
  persist(
    (set, get) => ({
      tasks: DEFAULT_SCHEDULED_TASKS,
      logs: [],
      isHydrated: false,

      addTask: (newTaskData) => {
        const id = `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const task: ScheduledTask = {
          ...newTaskData,
          id,
          status: newTaskData.enabled ? 'idle' : 'paused',
          lastRunAt: null,
          nextRunAt: null,
          runCount: 0,
          lastDurationMs: null,
          lastResult: null,
        };
        set((state) => ({ tasks: [...state.tasks, task] }));
      },

      removeTask: (taskId: string) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== taskId),
          logs: state.logs.filter((l) => l.taskId !== taskId),
        }));
      },

      toggleTask: (taskId: string) => {
        set((state) => ({
          tasks: state.tasks.map((t) => {
            if (t.id === taskId) {
              const enabled = !t.enabled;
              return {
                ...t,
                enabled,
                status: enabled ? 'idle' : 'paused',
              };
            }
            return t;
          }),
        }));
      },

      updateTaskInterval: (taskId: string, intervalSec: number) => {
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, intervalSec } : t)),
        }));
      },

      setTaskRunning: (taskId: string) => {
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, status: 'running' } : t)),
        }));
      },

      recordTaskRun: ({ taskId, status, durationMs, result }) => {
        const now = new Date().toISOString();
        const currentTask = get().tasks.find((t) => t.id === taskId);
        const taskName = currentTask?.name || taskId;

        const nextRun = currentTask?.intervalSec
          ? new Date(Date.now() + currentTask.intervalSec * 1000).toISOString()
          : null;

        const log: TaskExecutionLog = {
          id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          taskId,
          taskName,
          timestamp: now,
          status,
          durationMs,
          message: result,
        };

        set((state) => ({
          tasks: state.tasks.map((t) => {
            if (t.id === taskId) {
              return {
                ...t,
                status: t.enabled ? status : 'paused',
                lastRunAt: now,
                nextRunAt: nextRun,
                runCount: t.runCount + 1,
                lastDurationMs: durationMs,
                lastResult: result,
              };
            }
            return t;
          }),
          logs: [log, ...state.logs.slice(0, 49)],
        }));
      },

      clearLogs: () => set({ logs: [] }),

      resetToDefaults: () => set({ tasks: DEFAULT_SCHEDULED_TASKS, logs: [] }),

      setHydrated: (isHydrated: boolean) => set({ isHydrated }),
    }),
    {
      name: 'cosmolost-scheduler-tasks',
      storage: createJSONStorage(() => tauriStorage),
      partialize: (state) => ({
        tasks: state.tasks,
        logs: state.logs.slice(0, 20),
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
