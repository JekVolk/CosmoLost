import {
  type McpServer,
  type McpTransport,
  useMcpPingMutation,
  useMcpStore,
  useMcpToolExecutionMutation,
} from '@/entities/mcp';
import { type McpToolDefinition, mcpRegistry, useDiagnosticsStore } from '@/shared';
import { useCallback, useEffect, useState } from 'react';

export function useMcpManager() {
  const {
    servers,
    selectedServerId,
    logs,
    setSelectedServer,
    toggleServer,
    addServer,
    removeServer,
    clearLogs,
    resetToDefaults,
  } = useMcpStore();

  const pingMutation = useMcpPingMutation();
  const executeMutation = useMcpToolExecutionMutation();
  const { addError } = useDiagnosticsStore();

  const [tools, setTools] = useState<McpToolDefinition[]>([]);
  const [selectedTool, setSelectedTool] = useState<McpToolDefinition | null>(null);
  const [toolArgs, setToolArgs] = useState<string>('{}');
  const [executionResult, setExecutionResult] = useState<string | null>(null);

  const activeServer = servers.find((s) => s.id === selectedServerId) || servers[0];

  // Load tools when active server changes
  const loadTools = useCallback(async (server: McpServer) => {
    try {
      const serverTools = await mcpRegistry.getToolsForServer(server.id, server.endpoint);
      setTools(serverTools);
      setSelectedTool(serverTools[0] || null);
    } catch {
      setTools([]);
      setSelectedTool(null);
    }
  }, []);

  useEffect(() => {
    if (activeServer) {
      loadTools(activeServer);
    }
  }, [activeServer, loadTools]);

  const handleTestPing = async (serverId: string) => {
    const target = servers.find((s) => s.id === serverId);
    if (!target) return;
    try {
      await pingMutation.mutateAsync(target);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Ping failure';
      addError('MCP Ping', msg);
    }
  };

  const handleExecuteTool = async () => {
    if (!selectedTool || !activeServer) return;

    let parsedArgs: Record<string, unknown> = {};
    try {
      if (toolArgs.trim()) {
        parsedArgs = JSON.parse(toolArgs);
      }
    } catch (error) {
      setExecutionResult(
        `Invalid JSON Arguments: ${error instanceof Error ? error.message : 'Parse error'}`,
      );
      return;
    }

    try {
      const result = await executeMutation.mutateAsync({
        server: activeServer,
        toolName: selectedTool.name,
        args: parsedArgs,
      });
      setExecutionResult(result.response);
    } catch (error) {
      const errText = error instanceof Error ? error.message : 'Execution failed';
      setExecutionResult(`Execution Error: ${errText}`);
      addError('MCP Tool Call', errText);
    }
  };

  const handleAddServer = (name: string, endpoint: string, transport: McpTransport) => {
    addServer({
      name,
      description: `Custom ${transport.toUpperCase()} MCP Server Endpoint`,
      endpoint,
      transport,
      enabled: true,
      capabilities: ['tools'],
    });
  };

  return {
    servers,
    activeServer,
    selectedServerId,
    tools,
    selectedTool,
    toolArgs,
    executionResult,
    logs,
    isExecuting: executeMutation.isPending,
    isPinging: pingMutation.isPending,
    setSelectedServer,
    setSelectedTool,
    setToolArgs,
    toggleServer,
    handleTestPing,
    handleExecuteTool,
    handleAddServer,
    removeServer,
    clearLogs,
    resetToDefaults,
  };
}
