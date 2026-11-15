import { type McpCallResult, McpClient, type McpToolDefinition } from './mcp-client';

class McpRegistry {
  private clients = new Map<string, McpClient>();

  getClient(
    serverId: string,
    endpoint = 'ipc://internal',
    transport: 'sse' | 'stdio' | 'ipc' = 'ipc',
  ): McpClient {
    let client = this.clients.get(serverId);
    if (!client) {
      client = new McpClient(serverId, endpoint, transport);
      this.clients.set(serverId, client);
    }
    return client;
  }

  async testConnection(serverId: string, endpoint?: string): Promise<number> {
    const client = this.getClient(serverId, endpoint);
    return await client.ping();
  }

  async getToolsForServer(serverId: string, endpoint?: string): Promise<McpToolDefinition[]> {
    const client = this.getClient(serverId, endpoint);
    return await client.listTools();
  }

  async executeTool(
    serverId: string,
    toolName: string,
    args: Record<string, unknown> = {},
  ): Promise<McpCallResult> {
    const client = this.getClient(serverId);
    return await client.callTool(toolName, args);
  }
}

export const mcpRegistry = new McpRegistry();
