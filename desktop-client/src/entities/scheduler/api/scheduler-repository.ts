import { z } from 'zod';
import { ScheduledTaskSchema, TaskExecutionLogSchema } from '../model/schema';
import type { ScheduledTask, TaskExecutionLog } from '../model/types';

export const schedulerRepository = {
  validateTask(candidate: unknown): ScheduledTask {
    return ScheduledTaskSchema.parse(candidate);
  },

  validateTaskList(candidates: unknown): ScheduledTask[] {
    return z.array(ScheduledTaskSchema).parse(candidates);
  },

  validateLog(candidate: unknown): TaskExecutionLog {
    return TaskExecutionLogSchema.parse(candidate);
  },
};
