import { Badge, Box, Button, Card, HStack, Heading, Text, VStack } from '@/shared/ui';
import {
  Activity,
  CheckCircle2,
  Clock,
  Copy,
  FolderOpen,
  Play,
  Terminal,
  XCircle,
  Zap,
} from 'lucide-react';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import { useIpcBridge } from '../model/use-ipc-bridge';

export const IpcBridgePage: React.FC = () => {
  const { t } = useTranslation();
  const {
    logs,
    isPending,
    handleTestPing,
    handleTestSystemInfo,
    handleTestClipboard,
    handleTestFolder,
    clearLogs,
  } = useIpcBridge();

  return (
    <Box p="6">
      <VStack align="stretch" gap="5">
        <Box>
          <HStack gap="3" mb="2" align="center">
            <Heading size="2xl" color="fg">
              {t('ipc.title')}
            </Heading>
            <Badge colorPalette="teal" size="md" variant="subtle">
              Rust ⟷ React
            </Badge>
            <Badge colorPalette="purple" size="md" variant="subtle">
              Tauri IPC v2
            </Badge>
          </HStack>
          <Text color="fg.muted" fontSize="md">
            {t('ipc.subtitle')}
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
                  Available Native Commands & Diagnostics
                </Heading>
              </HStack>
              <Badge colorPalette="green" variant="surface">
                {t('common.ready')}
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
                {t('ipc.sendPing')}
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
                colorPalette="purple"
                variant="outline"
                size="sm"
                onClick={handleTestClipboard}
                loading={isPending}
              >
                <Copy size={14} />
                Test Clipboard IPC
              </Button>
              <Button
                colorPalette="yellow"
                variant="outline"
                size="sm"
                onClick={handleTestFolder}
                loading={isPending}
              >
                <FolderOpen size={14} />
                Test OS Explorer IPC
              </Button>
              <Button
                variant="ghost"
                size="sm"
                color="fg.muted"
                onClick={clearLogs}
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
                  Click a command above to invoke a Tauri Rust command and view live responses with
                  latency metrics.
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
                    borderColor={log.status === 'error' ? 'red.500/50' : 'border.subtle'}
                  >
                    <HStack justify="space-between" mb="2">
                      <HStack gap="2">
                        {log.status === 'error' ? (
                          <XCircle size={14} color="#ef4444" />
                        ) : (
                          <CheckCircle2 size={14} color="#22c55e" />
                        )}
                        <Text
                          fontSize="xs"
                          fontWeight="bold"
                          color={log.status === 'error' ? 'red.300' : 'teal.300'}
                        >
                          {log.command}
                        </Text>
                        <Badge
                          size="xs"
                          colorPalette={log.status === 'error' ? 'red' : 'green'}
                          variant="subtle"
                        >
                          {log.status.toUpperCase()}
                        </Badge>
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
                      color={log.status === 'error' ? 'red.200' : 'fg'}
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
