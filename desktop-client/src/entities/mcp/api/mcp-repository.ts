import { httpClient } from '@/shared/api';
import { mcpRegistry } from '@/shared/lib/mcp';
import type { McpServer } from '../model/schema';

export interface McpPingResult {
  serverId: string;
  latencyMs: number;
  status: 'connected' | 'error';
  timestamp: string;
}

export interface McpExecutionResult {
  serverId: string;
  toolName: string;
  durationMs: number;
  status: 'success' | 'error';
  response: string;
}

export class McpRepository {
  async pingServer(server: McpServer): Promise<McpPingResult> {
    const start = performance.now();
    try {
      if (server.transport === 'sse' && server.endpoint.startsWith('http')) {
        await httpClient.get(server.endpoint, { timeout: 3000 });
      } else {
        await mcpRegistry.testConnection(server.id, server.endpoint);
      }
      const latencyMs = Math.round((performance.now() - start) * 10) / 10;
      return {
        serverId: server.id,
        latencyMs,
        status: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch {
      const latencyMs = Math.round((performance.now() - start) * 10) / 10;
      return {
        serverId: server.id,
        latencyMs,
        status: 'error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async executeTool(
    server: McpServer,
    toolName: string,
    args: Record<string, unknown> = {},
  ): Promise<McpExecutionResult> {
    const start = performance.now();
    try {
      const result = await mcpRegistry.executeTool(server.id, toolName, args);
      const durationMs = Math.round((performance.now() - start) * 10) / 10;
      const text = result.content.map((c) => c.text).join('\n');
      return {
        serverId: server.id,
        toolName,
        durationMs,
        status: result.isError ? 'error' : 'success',
        response: text,
      };
    } catch (err) {
      const durationMs = Math.round((performance.now() - start) * 10) / 10;
      return {
        serverId: server.id,
        toolName,
        durationMs,
        status: 'error',
        response: err instanceof Error ? err.message : String(err),
      };
    }
  }
}

export const mcpRepository = new McpRepository();
