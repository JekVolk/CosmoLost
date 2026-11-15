import React from 'react';
import { Box, Text } from '@chakra-ui/react';

export const ForensicSolGame: React.FC<{ payload?: Record<string, unknown> }> = () => {
  return (
    <Box p={4} bg="black" borderRadius="md" border="1px solid #1F293D">
      <Text color="cyan.300" fontWeight="bold">ForensicSol Telemetry</Text>
      <Text fontSize="sm" color="gray.400">Аналіз графіків сонячної генерації, пилу та кута нахилу</Text>
    </Box>
  );
};
