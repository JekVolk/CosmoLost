import { z } from 'zod';

export const TaskTypeSchema = z.enum(['ping', 'system-info', 'cache-clean', 'custom']);

export const TaskStatusSchema = z.enum(['idle', 'running', 'success', 'error', 'paused']);

export const ScheduledTaskSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Task name is required'),
  type: TaskTypeSchema.default('ping'),
  intervalSec: z.number().int().min(2).max(86400).default(10),
  enabled: z.boolean().default(true),
  status: TaskStatusSchema.default('idle'),
  lastRunAt: z.string().nullable().default(null),
  nextRunAt: z.string().nullable().default(null),
  runCount: z.number().int().default(0),
  lastDurationMs: z.number().nullable().default(null),
  lastResult: z.string().nullable().default(null),
});

export const TaskExecutionLogSchema = z.object({
  id: z.string(),
  taskId: z.string(),
  taskName: z.string(),
  timestamp: z.string(),
  status: z.enum(['success', 'error']),
  durationMs: z.number(),
  message: z.string(),
});

export type TaskType = z.infer<typeof TaskTypeSchema>;
export type TaskStatus = z.infer<typeof TaskStatusSchema>;
export type ScheduledTask = z.infer<typeof ScheduledTaskSchema>;
export type TaskExecutionLog = z.infer<typeof TaskExecutionLogSchema>;
