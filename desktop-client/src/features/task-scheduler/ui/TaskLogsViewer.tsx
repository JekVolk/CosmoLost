import type { TaskExecutionLog } from '@/entities/scheduler';
import { Badge, Box, Button, Card, Flex, HStack, Heading, Text, VStack } from '@/shared/ui';
import { CheckCircle2, History, Trash2, XCircle } from 'lucide-react';
import type React from 'react';

interface TaskLogsViewerProps {
  logs: TaskExecutionLog[];
  onClearLogs: () => void;
}

export const TaskLogsViewer: React.FC<TaskLogsViewerProps> = ({ logs, onClearLogs }) => {
  return (
    <Card.Root p="5" bg="bg.panel" borderWidth="1px" borderColor="border.subtle" borderRadius="xl">
      <Card.Header p="0" mb="3">
        <HStack justify="space-between" align="center">
          <HStack gap="2">
            <History size={18} color="#22c55e" />
            <Heading size="sm" color="fg">
              Live Execution Audit Trail ({logs.length})
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
            p="5"
            textAlign="center"
            borderRadius="lg"
            bg="bg.canvas"
            borderWidth="1px"
            borderColor="border.subtle"
          >
            <Text fontSize="sm" color="fg.muted">
              No executions recorded yet. Scheduled tasks will log runtime metrics here
              automatically.
            </Text>
          </Box>
        ) : (
          <VStack align="stretch" gap="2" maxH="280px" overflowY="auto">
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
                    <Text fontWeight="semibold" color="fg">
                      {log.taskName}
                    </Text>
                    <Badge
                      colorPalette={log.status === 'success' ? 'green' : 'red'}
                      size="xs"
                      variant="subtle"
                    >
                      {log.status}
                    </Badge>
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
                  {log.message}
                </Text>
              </Box>
            ))}
          </VStack>
        )}
      </Card.Body>
    </Card.Root>
  );
};
