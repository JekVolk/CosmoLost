import type { McpServer } from '@/entities/mcp';
import { useSettingsStore } from '@/entities/settings';
import type { McpToolDefinition } from '@/shared';
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  HStack,
  Heading,
  Text,
  Textarea,
  VStack,
} from '@/shared/ui';
import { Play, Sparkles, Terminal, Wrench } from 'lucide-react';
import type React from 'react';

interface McpToolRunnerCardProps {
  server: McpServer;
  tools: McpToolDefinition[];
  selectedTool: McpToolDefinition | null;
  toolArgs: string;
  executionResult: string | null;
  isExecuting: boolean;
  onSelectTool: (tool: McpToolDefinition) => void;
  onToolArgsChange: (args: string) => void;
  onExecuteTool: () => void;
}

export const McpToolRunnerCard: React.FC<McpToolRunnerCardProps> = ({
  server,
  tools,
  selectedTool,
  toolArgs,
  executionResult,
  isExecuting,
  onSelectTool,
  onToolArgsChange,
  onExecuteTool,
}) => {
  const accentColor = useSettingsStore((state) => state.settings.accentColor);

  return (
    <Card.Root p="5" bg="bg.panel" borderWidth="1px" borderColor="border.subtle" borderRadius="xl">
      <Card.Header p="0" mb="4">
        <HStack justify="space-between" align="center">
          <HStack gap="2">
            <Wrench size={18} color="#a855f7" />
            <Heading size="sm" color="fg">
              Discovered MCP Tools for [{server.name}]
            </Heading>
          </HStack>
          <Badge colorPalette="purple" variant="surface" size="xs">
            {tools.length} Tools Discovered
          </Badge>
        </HStack>
      </Card.Header>

      <Card.Body p="0">
        <VStack align="stretch" gap="4">
          {/* Tool Selector Buttons */}
          <Box>
            <Text fontSize="xs" fontWeight="medium" color="fg.muted" mb="2">
              Select Tool Capability:
            </Text>
            <HStack gap="2" wrap="wrap">
              {tools.map((t) => {
                const isSelected = selectedTool?.name === t.name;
                return (
                  <Button
                    key={t.name}
                    size="sm"
                    variant={isSelected ? 'solid' : 'outline'}
                    colorPalette={accentColor}
                    onClick={() => onSelectTool(t)}
                  >
                    <Sparkles size={14} />
                    {t.name}
                  </Button>
                );
              })}
            </HStack>
          </Box>

          {/* Active Tool Info & Execution Form */}
          {selectedTool && (
            <Box
              p="3.5"
              borderRadius="lg"
              bg="bg.canvas"
              borderWidth="1px"
              borderColor="border.subtle"
            >
              <VStack align="stretch" gap="3">
                <Box>
                  <HStack justify="space-between" align="center" mb="1">
                    <Text fontWeight="semibold" fontSize="sm" color="fg">
                      Tool: {selectedTool.name}
                    </Text>
                    <Badge variant="subtle" colorPalette="teal" size="xs">
                      JSON-RPC 2.0
                    </Badge>
                  </HStack>
                  <Text fontSize="xs" color="fg.muted">
                    {selectedTool.description}
                  </Text>
                </Box>

                {selectedTool.inputSchema && (
                  <Box
                    p="2"
                    borderRadius="md"
                    bg="bg.panel"
                    fontSize="2xs"
                    fontFamily="mono"
                    color="fg.muted"
                  >
                    Schema: {JSON.stringify(selectedTool.inputSchema.properties || {})}
                  </Box>
                )}

                <Box>
                  <Text fontSize="xs" color="fg.muted" mb="1">
                    Invocation Parameters (JSON):
                  </Text>
                  <Textarea
                    size="xs"
                    fontFamily="mono"
                    rows={3}
                    value={toolArgs}
                    onChange={(e) => onToolArgsChange(e.target.value)}
                    placeholder='{"key": "value"}'
                    borderColor="border.subtle"
                  />
                </Box>

                <Flex justify="flex-end">
                  <Button
                    size="sm"
                    variant="solid"
                    colorPalette={accentColor}
                    onClick={onExecuteTool}
                    loading={isExecuting}
                  >
                    <Play size={14} />
                    Execute Tool via MCP
                  </Button>
                </Flex>
              </VStack>
            </Box>
          )}

          {/* Execution Output Console */}
          {executionResult && (
            <Box
              p="3.5"
              borderRadius="lg"
              bg="bg.canvas"
              borderWidth="1px"
              borderColor="border.subtle"
            >
              <HStack gap="2" mb="2">
                <Terminal size={14} color="#14b8a6" />
                <Text fontSize="xs" fontWeight="bold" color="teal.300">
                  Tool Execution Result Output
                </Text>
              </HStack>
              <Text
                as="pre"
                fontSize="xs"
                fontFamily="mono"
                color="fg"
                p="2.5"
                borderRadius="md"
                bg="bg.panel"
                maxH="180px"
                overflowY="auto"
                whiteSpace="pre-wrap"
                wordBreak="break-word"
              >
                {executionResult}
              </Text>
            </Box>
          )}
        </VStack>
      </Card.Body>
    </Card.Root>
  );
};
