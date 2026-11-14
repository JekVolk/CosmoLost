import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type McpExecutionResult, type McpPingResult, mcpRepository } from '../api/mcp-repository';
import { useMcpStore } from './mcp-store';
import type { McpServer } from './schema';

export const MCP_QUERY_KEYS = {
  servers: ['mcp', 'servers'] as const,
  serverPing: (id: string) => ['mcp', 'ping', id] as const,
};

export function useMcpServersQuery() {
  const storeServers = useMcpStore((state) => state.servers);

  return useQuery<McpServer[], Error>({
    queryKey: MCP_QUERY_KEYS.servers,
    queryFn: async () => storeServers,
    staleTime: 1000 * 30,
    initialData: storeServers,
  });
}

export function useMcpPingMutation() {
  const queryClient = useQueryClient();
  const updateServerStatus = useMcpStore((state) => state.updateServerStatus);

  return useMutation<McpPingResult, Error, McpServer>({
    mutationFn: (server: McpServer) => mcpRepository.pingServer(server),
    onSuccess: (data) => {
      updateServerStatus(data.serverId, data.status, data.latencyMs);
      queryClient.invalidateQueries({ queryKey: MCP_QUERY_KEYS.servers });
    },
  });
}

export function useMcpToolExecutionMutation() {
  const recordCallLog = useMcpStore((state) => state.recordCallLog);

  return useMutation<
    McpExecutionResult,
    Error,
    { server: McpServer; toolName: string; args?: Record<string, unknown> }
  >({
    mutationFn: ({ server, toolName, args }) =>
      mcpRepository.executeTool(server, toolName, args ?? {}),
    onSuccess: (data) => {
      recordCallLog({
        serverId: data.serverId,
        toolName: data.toolName,
        durationMs: data.durationMs,
        status: data.status,
        response: data.response,
      });
    },
  });
}
