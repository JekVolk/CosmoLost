import { Badge, Box, Flex, HStack, Text, VStack } from '@/shared/ui';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import type React from 'react';
import type { ValidateBundleResult } from '../api/workspace-bundle-service';

interface Props {
  result: ValidateBundleResult | null;
}

export const ImportValidationFeedbackCard: React.FC<Props> = ({ result }) => {
  if (!result) return null;

  if (result.isValid && result.bundle) {
    return (
      <Box p="3" borderRadius="md" bg="green.950" borderWidth="1px" borderColor="green.800">
        <Flex justify="space-between" align="center" mb="1">
          <HStack gap="2">
            <CheckCircle2 size={16} color="#22c55e" />
            <Text fontSize="xs" fontWeight="bold" color="green.300">
              Validated Schema: {result.detectedType.toUpperCase()}
            </Text>
          </HStack>
          <Badge colorPalette="green" variant="solid" size="xs">
            Ready to Apply
          </Badge>
        </Flex>
        <Text fontSize="2xs" color="green.200">
          Project: {result.bundle.project?.name || 'Default'} • Tasks:{' '}
          {result.bundle.tasks?.length || 0} routines • Accent: {result.bundle.settings.accentColor}
        </Text>
      </Box>
    );
  }

  return (
    <Box p="3" borderRadius="md" bg="red.950" borderWidth="1px" borderColor="red.900">
      <Flex justify="space-between" align="center" mb="2">
        <HStack gap="2">
          <AlertCircle size={16} color="#ef4444" />
          <Text fontSize="xs" fontWeight="bold" color="red.300">
            Zod Validation Errors ({result.errors.length})
          </Text>
        </HStack>
        <Badge colorPalette="red" variant="solid" size="xs">
          Validation Blocked
        </Badge>
      </Flex>

      {result.syntaxError && (
        <Text fontSize="2xs" color="red.200" mb="2">
          Syntax: {result.syntaxError}
        </Text>
      )}

      <VStack align="stretch" gap="1.5" maxH="120px" overflowY="auto">
        {result.errors.map((err, i) => (
          <Box
            key={`${err.field}-${i}`}
            p="1.5"
            borderRadius="sm"
            bg="red.900"
            fontSize="2xs"
            color="red.100"
          >
            <Text fontWeight="bold" fontFamily="mono" color="red.200">
              Field: {err.field}
            </Text>
            <Text>{err.message}</Text>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};
