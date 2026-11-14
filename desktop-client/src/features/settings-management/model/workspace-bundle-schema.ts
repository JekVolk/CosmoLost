import { ScheduledTaskSchema } from '@/entities/scheduler';
import { DesktopSettingsSchema } from '@/entities/settings';
import { z } from 'zod';

export const ProjectProfileSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Project name is required'),
  description: z.string().default(''),
  environment: z.enum(['development', 'staging', 'production']).default('development'),
  createdAt: z.string(),
  updatedAt: z.string(),
  tags: z.array(z.string()).default([]),
});

export const WorkspaceBundleSchema = z.object({
  version: z.literal(1),
  app: z.string().default('CosmoLost Desktop Client'),
  exportedAt: z.string(),
  project: ProjectProfileSchema,
  settings: DesktopSettingsSchema,
  tasks: z.array(ScheduledTaskSchema).default([]),
});

export const ValidationErrorItemSchema = z.object({
  field: z.string(),
  message: z.string(),
  code: z.string(),
});

export type ProjectProfile = z.infer<typeof ProjectProfileSchema>;
export type WorkspaceBundle = z.infer<typeof WorkspaceBundleSchema>;
export type ValidationErrorItem = z.infer<typeof ValidationErrorItemSchema>;
