import { type McpServer, type McpTransport, useMcpStore } from '@/entities/mcp';
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
    updateServerStatus,
    recordCallLog,
    clearLogs,
    resetToDefaults,
  } = useMcpStore();

  const { addError } = useDiagnosticsStore();

  const [tools, setTools] = useState<McpToolDefinition[]>([]);
  const [selectedTool, setSelectedTool] = useState<McpToolDefinition | null>(null);
  const [toolArgs, setToolArgs] = useState<string>('{}');
  const [executionResult, setExecutionResult] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isPinging, setIsPinging] = useState(false);

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
    setIsPinging(true);
    try {
      const target = servers.find((s) => s.id === serverId);
      const latency = await mcpRegistry.testConnection(serverId, target?.endpoint);
      updateServerStatus(serverId, 'connected', latency, tools.length);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Ping failure';
      updateServerStatus(serverId, 'error');
      addError('MCP Ping', msg);
    } finally {
      setIsPinging(false);
    }
  };

  const handleExecuteTool = async () => {
    if (!selectedTool || !activeServer) return;

    setIsExecuting(true);
    const start = performance.now();

    let parsedArgs: Record<string, unknown> = {};
    try {
      if (toolArgs.trim()) {
        parsedArgs = JSON.parse(toolArgs);
      }
    } catch (error) {
      setExecutionResult(
        `Invalid JSON Arguments: ${error instanceof Error ? error.message : 'Parse error'}`,
      );
      setIsExecuting(false);
      return;
    }

    try {
      const res = await mcpRegistry.executeTool(activeServer.id, selectedTool.name, parsedArgs);
      const durationMs = Math.round((performance.now() - start) * 100) / 100;
      const textResponse = res.content.map((c) => c.text).join('\n');

      setExecutionResult(textResponse);
      recordCallLog({
        serverId: activeServer.id,
        toolName: selectedTool.name,
        durationMs,
        status: res.isError ? 'error' : 'success',
        response: textResponse,
      });
    } catch (error) {
      const durationMs = Math.round((performance.now() - start) * 100) / 100;
      const errText = error instanceof Error ? error.message : 'Execution failed';
      setExecutionResult(`Execution Error: ${errText}`);
      recordCallLog({
        serverId: activeServer.id,
        toolName: selectedTool.name,
        durationMs,
        status: 'error',
        response: errText,
      });
      addError('MCP Tool Call', errText);
    } finally {
      setIsExecuting(false);
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
    isExecuting,
    isPinging,
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
