import { type PingResponse, type SystemInfo, tauriCommands } from '@/shared/api/tauri';
import { Badge, Box, Button, Card, HStack, Heading, Text, VStack } from '@/shared/ui';
import { Activity, Clock, Play, Terminal, Zap } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

interface IpcLogEntry {
  command: string;
  timestamp: string;
  durationMs: number;
  response: string;
}

export const IpcBridgePage: React.FC = () => {
  const [logs, setLogs] = useState<IpcLogEntry[]>([]);
  const [isPending, setIsPending] = useState<boolean>(false);

  const handleTestPing = async () => {
    setIsPending(true);
    const start = performance.now();
    try {
      const res: PingResponse = await tauriCommands.ping('Hello from React Frontend');
      const durationMs = Math.round((performance.now() - start) * 100) / 100;
      setLogs((prev) => [
        {
          command: 'ping("Hello from React Frontend")',
          timestamp: new Date().toLocaleTimeString(),
          durationMs,
          response: JSON.stringify(res, null, 2),
        },
        ...prev.slice(0, 8),
      ]);
    } finally {
      setIsPending(false);
    }
  };

  const handleTestSystemInfo = async () => {
    setIsPending(true);
    const start = performance.now();
    try {
      const res: SystemInfo = await tauriCommands.getSystemInfo();
      const durationMs = Math.round((performance.now() - start) * 100) / 100;
      setLogs((prev) => [
        {
          command: 'get_system_info()',
          timestamp: new Date().toLocaleTimeString(),
          durationMs,
          response: JSON.stringify(res, null, 2),
        },
        ...prev.slice(0, 8),
      ]);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Box p="6">
      <VStack align="stretch" gap="5">
        <Box>
          <HStack gap="3" mb="2" align="center">
            <Heading size="2xl" color="fg">
              Tauri IPC Bridge Tester
            </Heading>
            <Badge colorPalette="teal" size="md" variant="subtle">
              Rust ⟷ React
            </Badge>
          </HStack>
          <Text color="fg.muted" fontSize="md">
            Execute native Tauri commands and test IPC message passing with live latency
            measurement.
          </Text>
        </Box>

        <Card.Root
          p="5"
          bg="bg.panel"
          borderWidth="1px"
          borderColor="border.subtle"
          borderRadius="xl"
        >
          <Card.Header p="0" mb="4">
            <HStack justify="space-between" align="center">
              <HStack gap="2">
                <Zap size={18} color="#14b8a6" />
                <Heading size="sm" color="fg">
                  Available Native Commands
                </Heading>
              </HStack>
              <Badge colorPalette="green" variant="surface">
                IPC Ready
              </Badge>
            </HStack>
          </Card.Header>
          <Card.Body p="0">
            <HStack gap="3" flexWrap="wrap">
              <Button
                colorPalette="teal"
                variant="solid"
                size="sm"
                onClick={handleTestPing}
                loading={isPending}
              >
                <Play size={14} />
                Send Ping (Echo)
              </Button>
              <Button
                colorPalette="blue"
                variant="subtle"
                size="sm"
                onClick={handleTestSystemInfo}
                loading={isPending}
              >
                <Terminal size={14} />
                Fetch System Info
              </Button>
              <Button
                variant="ghost"
                size="sm"
                color="fg.muted"
                onClick={() => setLogs([])}
                disabled={logs.length === 0}
              >
                Clear Logs
              </Button>
            </HStack>
          </Card.Body>
        </Card.Root>

        <Card.Root
          p="5"
          bg="bg.panel"
          borderWidth="1px"
          borderColor="border.subtle"
          borderRadius="xl"
        >
          <Card.Header p="0" mb="3">
            <HStack justify="space-between">
              <HStack gap="2">
                <Activity size={18} color="#38bdf8" />
                <Heading size="sm" color="fg">
                  Live Response Console ({logs.length})
                </Heading>
              </HStack>
            </HStack>
          </Card.Header>
          <Card.Body p="0">
            {logs.length === 0 ? (
              <Box
                p="6"
                textAlign="center"
                borderRadius="lg"
                bg="bg.canvas"
                borderWidth="1px"
                borderColor="border.subtle"
              >
                <Text fontSize="sm" color="fg.muted">
                  Click a command above to invoke a Tauri Rust command and view live responses.
                </Text>
              </Box>
            ) : (
              <VStack align="stretch" gap="3">
                {logs.map((log, index) => (
                  <Box
                    key={`${log.timestamp}-${index}`}
                    p="3"
                    borderRadius="md"
                    bg="bg.canvas"
                    borderWidth="1px"
                    borderColor="border.subtle"
                  >
                    <HStack justify="space-between" mb="2">
                      <HStack gap="2">
                        <Terminal size={14} color="#14b8a6" />
                        <Text fontSize="xs" fontWeight="bold" color="teal.300">
                          {log.command}
                        </Text>
                      </HStack>
                      <HStack gap="2">
                        <Clock size={12} color="#94a3b8" />
                        <Text fontSize="xs" color="fg.muted">
                          {log.timestamp} ({log.durationMs}ms)
                        </Text>
                      </HStack>
                    </HStack>
                    <Text
                      as="pre"
                      fontSize="xs"
                      fontFamily="monospace"
                      color="fg"
                      whiteSpace="pre-wrap"
                      wordBreak="break-word"
                    >
                      {log.response}
                    </Text>
                  </Box>
                ))}
              </VStack>
            )}
          </Card.Body>
        </Card.Root>
      </VStack>
    </Box>
  );
};
