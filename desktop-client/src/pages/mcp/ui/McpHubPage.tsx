import {
  LocalMcpBridgeCard,
  McpCallLogViewer,
  McpServerListCard,
  McpToolRunnerCard,
  useMcpManager,
} from '@/features/mcp-manager';
import { Badge, Box, HStack, Heading, Text, VStack } from '@/shared/ui';
import type React from 'react';

export const McpHubPage: React.FC = () => {
  const {
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
  } = useMcpManager();

  return (
    <Box p="6">
      <VStack align="stretch" gap="5">
        <Box>
          <HStack gap="3" mb="2" align="center">
            <Heading size="2xl" color="fg">
              Model Context Protocol (MCP) Hub
            </Heading>
            <Badge colorPalette="purple" size="md" variant="subtle">
              JSON-RPC 2.0
            </Badge>
            <Badge colorPalette="teal" size="md" variant="subtle">
              Shared Bridge
            </Badge>
          </HStack>
          <Text color="fg.muted" fontSize="md">
            Connect desktop MCP servers (Tauri, Chakra UI, Context7) and control native application
            capabilities and feature tools via standard Model Context Protocol.
          </Text>
        </Box>

        {/* Server Endpoints Management */}
        <McpServerListCard
          servers={servers}
          selectedServerId={selectedServerId}
          isPinging={isPinging}
          onSelectServer={setSelectedServer}
          onToggleServer={toggleServer}
          onTestPing={handleTestPing}
          onRemoveServer={removeServer}
          onAddServer={handleAddServer}
          onReset={resetToDefaults}
        />

        {/* Active Server Discovered Tools Runner */}
        {activeServer && (
          <McpToolRunnerCard
            server={activeServer}
            tools={tools}
            selectedTool={selectedTool}
            toolArgs={toolArgs}
            executionResult={executionResult}
            isExecuting={isExecuting}
            onSelectTool={setSelectedTool}
            onToolArgsChange={setToolArgs}
            onExecuteTool={handleExecuteTool}
          />
        )}

        {/* Audit Call Logs */}
        <McpCallLogViewer logs={logs} onClearLogs={clearLogs} />

        {/* Local Desktop MCP Bridge & Stdio Server Guide */}
        <LocalMcpBridgeCard />
      </VStack>
    </Box>
  );
};
