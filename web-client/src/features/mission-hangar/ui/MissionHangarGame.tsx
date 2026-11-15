import { Box, Text } from '@chakra-ui/react';
import type React from 'react';

export const MissionHangarGame: React.FC<{ payload?: Record<string, unknown> }> = () => {
  return (
    <Box p={4} bg="black" borderRadius="md" border="1px solid #1F293D">
      <Text color="cyan.300" fontWeight="bold">
        Mission Hangar DnD
      </Text>
      <Text fontSize="sm" color="gray.400">
        Розподіл наукових модулів місії за функціональними відсіками
      </Text>
    </Box>
  );
};
