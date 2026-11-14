import { z } from 'zod';

export const McpTransportSchema = z.enum(['sse', 'stdio', 'ipc']);
export const McpStatusSchema = z.enum(['connected', 'disconnected', 'connecting', 'error']);

export const McpServerSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Server name is required'),
  description: z.string().default(''),
  endpoint: z.string().default('ipc://local'),
  transport: McpTransportSchema.default('ipc'),
  status: McpStatusSchema.default('connected'),
  enabled: z.boolean().default(true),
  latencyMs: z.number().nullable().default(null),
  toolsCount: z.number().default(0),
  capabilities: z.array(z.string()).default(['tools']),
});

export const McpInvocationLogSchema = z.object({
  id: z.string(),
  serverId: z.string(),
  toolName: z.string(),
  timestamp: z.string(),
  durationMs: z.number(),
  status: z.enum(['success', 'error']),
  response: z.string(),
});

export type McpTransport = z.infer<typeof McpTransportSchema>;
export type McpStatus = z.infer<typeof McpStatusSchema>;
export type McpServer = z.infer<typeof McpServerSchema>;
export type McpInvocationLog = z.infer<typeof McpInvocationLogSchema>;
