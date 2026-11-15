import type { McpInvocationLog } from '@/entities/mcp';
import { Badge, Box, Button, Card, Flex, HStack, Heading, Text, VStack } from '@/shared/ui';
import { CheckCircle2, History, Trash2, XCircle } from 'lucide-react';
import type React from 'react';

interface McpCallLogViewerProps {
  logs: McpInvocationLog[];
  onClearLogs: () => void;
}

export const McpCallLogViewer: React.FC<McpCallLogViewerProps> = ({ logs, onClearLogs }) => {
  return (
    <Card.Root p="5" bg="bg.panel" borderWidth="1px" borderColor="border.subtle" borderRadius="xl">
      <Card.Header p="0" mb="3">
        <HStack justify="space-between" align="center">
          <HStack gap="2">
            <History size={18} color="#22c55e" />
            <Heading size="sm" color="fg">
              MCP Capability Call Audit Trail ({logs.length})
            </Heading>
          </HStack>
          <Button
            size="xs"
            variant="ghost"
            colorPalette="gray"
            onClick={onClearLogs}
            disabled={logs.length === 0}
          >
            <Trash2 size={12} /> Clear Logs
          </Button>
        </HStack>
      </Card.Header>

      <Card.Body p="0">
        {logs.length === 0 ? (
          <Box
            p="4"
            textAlign="center"
            borderRadius="lg"
            bg="bg.canvas"
            fontSize="xs"
            color="fg.muted"
          >
            No MCP invocations recorded yet. Click &quot;Execute Tool via MCP&quot; to test server
            capabilities.
          </Box>
        ) : (
          <VStack align="stretch" gap="2" maxH="220px" overflowY="auto">
            {logs.map((log) => (
              <Box
                key={log.id}
                p="2.5"
                borderRadius="md"
                bg="bg.canvas"
                borderWidth="1px"
                borderColor="border.subtle"
                fontSize="xs"
              >
                <Flex justify="space-between" align="center" mb="1">
                  <HStack gap="2">
                    {log.status === 'success' ? (
                      <CheckCircle2 size={14} color="#22c55e" />
                    ) : (
                      <XCircle size={14} color="#ef4444" />
                    )}
                    <Badge colorPalette="purple" size="xs" variant="surface">
                      {log.serverId}
                    </Badge>
                    <Text fontWeight="semibold" color="fg">
                      {log.toolName}
                    </Text>
                  </HStack>
                  <HStack gap="2" color="fg.muted" fontSize="2xs">
                    <Text>{new Date(log.timestamp).toLocaleTimeString()}</Text>
                    <Text>•</Text>
                    <Text>{log.durationMs}ms</Text>
                  </HStack>
                </Flex>
                <Text
                  fontSize="2xs"
                  fontFamily="mono"
                  color="fg.muted"
                  overflow="hidden"
                  textOverflow="ellipsis"
                  whiteSpace="nowrap"
                >
                  {log.response}
                </Text>
              </Box>
            ))}
          </VStack>
        )}
      </Card.Body>
    </Card.Root>
  );
};
