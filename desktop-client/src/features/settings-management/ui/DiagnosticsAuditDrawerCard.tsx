import { useDiagnosticsStore } from '@/shared';
import { Badge, Box, Button, Card, Flex, HStack, Heading, Text, VStack } from '@/shared/ui';
import { Bug, Copy, Trash2 } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

export const DiagnosticsAuditDrawerCard: React.FC = () => {
  const { errors, clearErrors } = useDiagnosticsStore();
  const [copied, setCopied] = useState(false);

  const handleCopyErrors = async () => {
    const text = JSON.stringify(errors, null, 2);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <Card.Root p="5" bg="bg.panel" borderWidth="1px" borderColor="border.subtle" borderRadius="xl">
      <Card.Header p="0" mb="3">
        <HStack justify="space-between" align="center">
          <HStack gap="2">
            <Bug size={18} color="#f59e0b" />
            <Heading size="sm" color="fg">
              Application & Import Error Diagnostics ({errors.length})
            </Heading>
          </HStack>
          <HStack gap="2">
            <Button
              size="xs"
              variant="outline"
              onClick={handleCopyErrors}
              disabled={errors.length === 0}
            >
              <Copy size={12} />
              {copied ? 'Copied!' : 'Copy Diagnostics'}
            </Button>
            <Button
              size="xs"
              variant="ghost"
              colorPalette="red"
              onClick={clearErrors}
              disabled={errors.length === 0}
              title="Clear & Reset Error Log"
            >
              <Trash2 size={12} />
              Reset Log
            </Button>
          </HStack>
        </HStack>
      </Card.Header>

      <Card.Body p="0">
        {errors.length === 0 ? (
          <Box
            p="4"
            borderRadius="lg"
            bg="bg.canvas"
            textAlign="center"
            fontSize="xs"
            color="fg.muted"
          >
            No errors captured. Application environment and schemas are running cleanly.
          </Box>
        ) : (
          <VStack align="stretch" gap="2" maxH="200px" overflowY="auto">
            {errors.map((err) => (
              <Box
                key={err.id}
                p="2.5"
                borderRadius="md"
                bg="bg.canvas"
                borderWidth="1px"
                borderColor="red.900"
                fontSize="xs"
              >
                <Flex justify="space-between" align="center" mb="1">
                  <HStack gap="2">
                    <Badge colorPalette="red" variant="subtle" size="xs">
                      {err.source}
                    </Badge>
                    <Text fontWeight="medium" color="red.300">
                      {err.message}
                    </Text>
                  </HStack>
                  <Text color="fg.muted" fontSize="2xs">
                    {new Date(err.timestamp).toLocaleTimeString()}
                  </Text>
                </Flex>
                {err.context && (
                  <Text
                    as="pre"
                    fontSize="2xs"
                    fontFamily="mono"
                    color="fg.muted"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    whiteSpace="nowrap"
                  >
                    Context: {JSON.stringify(err.context)}
                  </Text>
                )}
              </Box>
            ))}
          </VStack>
        )}
      </Card.Body>
    </Card.Root>
  );
};
