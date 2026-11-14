import { desktopMcpBridge } from '@/shared';
import { Badge, Box, Button, Card, Flex, HStack, Heading, Text, VStack } from '@/shared/ui';
import { Bot, Check, Code, Compass, Copy, Palette } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

export const LocalMcpBridgeCard: React.FC = () => {
  const [liveState, setLiveState] = useState<string | null>(null);
  const [copiedConfig, setCopiedConfig] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const mcpConfigSnippet = JSON.stringify(
    {
      mcpServers: {
        'cosmolost-desktop': {
          command: 'node',
          args: [
            'C:\\Users\\JekVo\\orca\\workspaces\\CosmoLost\\feature-desktop-client\\desktop-client\\scripts\\cosmolost-mcp-server.mjs',
          ],
        },
      },
    },
    null,
    2,
  );

  const handleQueryState = () => {
    const state = desktopMcpBridge.getAppState();
    setLiveState(JSON.stringify(state, null, 2));
    setActionFeedback('Live application state queried via local MCP bridge');
  };

  const handleTestNavigation = () => {
    desktopMcpBridge.navigateTo('/scheduler');
    setActionFeedback('Local MCP bridge dispatched navigation to /scheduler');
  };

  const handleTestTheme = () => {
    desktopMcpBridge.setTheme({ accent: 'teal' });
    setActionFeedback('Local MCP bridge applied accent: "teal"');
  };

  const handleCopySnippet = async () => {
    await navigator.clipboard.writeText(mcpConfigSnippet);
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 2000);
  };

  return (
    <Card.Root p="5" bg="bg.panel" borderWidth="1px" borderColor="border.subtle" borderRadius="xl">
      <Card.Header p="0" mb="4">
        <HStack justify="space-between" align="center">
          <HStack gap="2">
            <Bot size={18} color="#22c55e" />
            <Heading size="sm" color="fg">
              Local Desktop Application MCP Bridge
            </Heading>
          </HStack>
          <Badge colorPalette="green" variant="solid" size="xs">
            Bridge Active (window.__COSMOLOST_MCP__)
          </Badge>
        </HStack>
      </Card.Header>

      <Card.Body p="0">
        <VStack align="stretch" gap="4">
          <Text fontSize="sm" color="fg.muted">
            Allows external AI agents (Antigravity, Claude, Cursor) and local processes to inspect
            application state, control navigation, trigger routines, and manage features via
            standard Model Context Protocol over stdio or runtime bridge.
          </Text>

          {/* Action test buttons */}
          <Box
            p="3.5"
            borderRadius="lg"
            bg="bg.canvas"
            borderWidth="1px"
            borderColor="border.subtle"
          >
            <Text fontSize="xs" fontWeight="bold" color="fg" mb="2">
              Test Local Bridge Actions & Queries:
            </Text>
            <HStack gap="2" wrap="wrap">
              <Button size="xs" variant="solid" colorPalette="teal" onClick={handleQueryState}>
                <Code size={12} /> Query Live App State
              </Button>
              <Button
                size="xs"
                variant="outline"
                colorPalette="cyan"
                onClick={handleTestNavigation}
              >
                <Compass size={12} /> Navigate to /scheduler
              </Button>
              <Button size="xs" variant="outline" colorPalette="purple" onClick={handleTestTheme}>
                <Palette size={12} /> Set Accent to Teal
              </Button>
            </HStack>

            {actionFeedback && (
              <Text fontSize="2xs" color="teal.300" mt="2">
                ✓ {actionFeedback}
              </Text>
            )}
          </Box>

          {/* Live State Output */}
          {liveState && (
            <Box
              p="3"
              borderRadius="md"
              bg="bg.canvas"
              borderWidth="1px"
              borderColor="border.subtle"
            >
              <Text fontSize="xs" fontWeight="bold" color="fg" mb="1">
                Live State Received:
              </Text>
              <Text
                as="pre"
                fontSize="2xs"
                fontFamily="mono"
                color="fg.muted"
                p="2"
                bg="bg.panel"
                borderRadius="sm"
                maxH="120px"
                overflowY="auto"
                whiteSpace="pre-wrap"
              >
                {liveState}
              </Text>
            </Box>
          )}

          {/* MCP Client Setup Config */}
          <Box
            p="3.5"
            borderRadius="lg"
            bg="bg.canvas"
            borderWidth="1px"
            borderColor="border.subtle"
          >
            <Flex justify="space-between" align="center" mb="2">
              <Text fontSize="xs" fontWeight="bold" color="fg">
                Antigravity / External Agent Setup (mcp_config.json):
              </Text>
              <Button size="xs" variant="ghost" colorPalette="gray" onClick={handleCopySnippet}>
                {copiedConfig ? <Check size={12} /> : <Copy size={12} />}
                {copiedConfig ? 'Copied' : 'Copy Configuration'}
              </Button>
            </Flex>
            <Text
              as="pre"
              fontSize="2xs"
              fontFamily="mono"
              color="fg.muted"
              p="2.5"
              borderRadius="md"
              bg="bg.panel"
              whiteSpace="pre-wrap"
            >
              {mcpConfigSnippet}
            </Text>
          </Box>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
};
