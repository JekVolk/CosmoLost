import { type McpServer, McpStatusBadge, type McpTransport } from '@/entities/mcp';
import { useSettingsStore } from '@/entities/settings';
import { Badge, Box, Button, Card, Flex, HStack, Heading, Input, Text, VStack } from '@/shared/ui';
import { Activity, Plus, Radio, RotateCcw, Server, Trash2 } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

interface McpServerListCardProps {
  servers: McpServer[];
  selectedServerId: string;
  isPinging: boolean;
  onSelectServer: (id: string) => void;
  onToggleServer: (id: string) => void;
  onTestPing: (id: string) => void;
  onRemoveServer: (id: string) => void;
  onAddServer: (name: string, endpoint: string, transport: McpTransport) => void;
  onReset: () => void;
}

export const McpServerListCard: React.FC<McpServerListCardProps> = ({
  servers,
  selectedServerId,
  isPinging,
  onSelectServer,
  onToggleServer,
  onTestPing,
  onRemoveServer,
  onAddServer,
  onReset,
}) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEndpoint, setNewEndpoint] = useState('ipc://custom-server');
  const [newTransport, setNewTransport] = useState<McpTransport>('ipc');
  const accentColor = useSettingsStore((state) => state.settings.accentColor);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    onAddServer(newName.trim(), newEndpoint.trim(), newTransport);
    setNewName('');
    setNewEndpoint('ipc://custom-server');
    setShowAdd(false);
  };

  return (
    <Card.Root p="5" bg="bg.panel" borderWidth="1px" borderColor="border.subtle" borderRadius="xl">
      <Card.Header p="0" mb="4">
        <HStack justify="space-between" align="center">
          <HStack gap="2">
            <Server size={18} color="#38bdf8" />
            <Heading size="sm" color="fg">
              Model Context Protocol (MCP) Endpoints ({servers.length})
            </Heading>
          </HStack>
          <HStack gap="2">
            <Button
              size="xs"
              variant="outline"
              colorPalette={accentColor}
              onClick={() => setShowAdd(!showAdd)}
            >
              <Plus size={14} /> Add Endpoint
            </Button>
            <Button size="xs" variant="ghost" colorPalette="gray" onClick={onReset}>
              <RotateCcw size={12} /> Reset
            </Button>
          </HStack>
        </HStack>
      </Card.Header>

      <Card.Body p="0">
        <VStack align="stretch" gap="3">
          {showAdd && (
            <Box
              p="3.5"
              borderRadius="lg"
              bg="bg.canvas"
              borderWidth="1px"
              borderColor="teal.700"
              mb="2"
            >
              <form onSubmit={handleCreate}>
                <VStack align="stretch" gap="2.5">
                  <Text fontSize="xs" fontWeight="bold" color="teal.300">
                    Register New MCP Server Endpoint
                  </Text>
                  <Input
                    size="xs"
                    placeholder="Server Name (e.g. Local Python Dev Server)"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                  />
                  <Input
                    size="xs"
                    placeholder="Endpoint URL or IPC Channel"
                    value={newEndpoint}
                    onChange={(e) => setNewEndpoint(e.target.value)}
                    required
                  />
                  <HStack gap="2">
                    <Text fontSize="2xs" color="fg.muted">
                      Transport:
                    </Text>
                    {(['ipc', 'sse', 'stdio'] as McpTransport[]).map((tr) => (
                      <Button
                        key={tr}
                        type="button"
                        size="xs"
                        variant={newTransport === tr ? 'solid' : 'subtle'}
                        colorPalette={accentColor}
                        onClick={() => setNewTransport(tr)}
                      >
                        {tr.toUpperCase()}
                      </Button>
                    ))}
                  </HStack>
                  <HStack justify="flex-end" gap="2" pt="1">
                    <Button
                      type="button"
                      size="xs"
                      variant="ghost"
                      onClick={() => setShowAdd(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" size="xs" variant="solid" colorPalette={accentColor}>
                      Connect Endpoint
                    </Button>
                  </HStack>
                </VStack>
              </form>
            </Box>
          )}

          {servers.map((server) => {
            const isSelected = server.id === selectedServerId;
            return (
              <Box
                key={server.id}
                p="3.5"
                borderRadius="lg"
                bg={isSelected ? 'bg.subtle' : 'bg.canvas'}
                borderWidth="1px"
                borderColor={isSelected ? `${accentColor}.500` : 'border.subtle'}
                cursor="pointer"
                onClick={() => onSelectServer(server.id)}
                transition="all 0.15s ease"
              >
                <Flex
                  justify="space-between"
                  align={{ base: 'flex-start', sm: 'center' }}
                  direction={{ base: 'column', sm: 'row' }}
                  gap="2"
                >
                  <VStack align="flex-start" gap="1">
                    <HStack gap="2">
                      <Radio size={14} color={isSelected ? '#38bdf8' : '#94a3b8'} />
                      <Text fontWeight="semibold" fontSize="sm" color="fg">
                        {server.name}
                      </Text>
                      <McpStatusBadge status={server.status} />
                      <Badge variant="surface" size="xs">
                        {server.transport.toUpperCase()}
                      </Badge>
                    </HStack>
                    <Text fontSize="xs" color="fg.muted">
                      {server.description}
                    </Text>
                    <HStack gap="2" fontSize="2xs" color="fg.muted">
                      <Text fontFamily="mono">{server.endpoint}</Text>
                      {server.latencyMs !== null && (
                        <>
                          <Text>•</Text>
                          <Text color="green.300">Latency: {server.latencyMs}ms</Text>
                        </>
                      )}
                    </HStack>
                  </VStack>

                  <HStack gap="2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="xs"
                      variant="outline"
                      colorPalette="cyan"
                      onClick={() => onTestPing(server.id)}
                      loading={isPinging}
                    >
                      <Activity size={12} /> Ping
                    </Button>
                    <Button
                      size="xs"
                      variant={server.enabled ? 'subtle' : 'outline'}
                      colorPalette={server.enabled ? 'green' : 'gray'}
                      onClick={() => onToggleServer(server.id)}
                    >
                      {server.enabled ? 'Active' : 'Disabled'}
                    </Button>
                    {server.id !== 'tauri' &&
                      server.id !== 'chakra-ui' &&
                      server.id !== 'context7' && (
                        <Button
                          size="xs"
                          variant="ghost"
                          colorPalette="red"
                          onClick={() => onRemoveServer(server.id)}
                        >
                          <Trash2 size={12} />
                        </Button>
                      )}
                  </HStack>
                </Flex>
              </Box>
            );
          })}
        </VStack>
      </Card.Body>
    </Card.Root>
  );
};
