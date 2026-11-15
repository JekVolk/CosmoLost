import { Box, Text } from '@chakra-ui/react';
import type React from 'react';

export const AstroGuessrGame: React.FC<{ payload?: Record<string, unknown> }> = () => {
  return (
    <Box p={4} bg="black" borderRadius="md" border="1px solid #1F293D">
      <Text color="cyan.300" fontWeight="bold">
        AstroGuessr 360°
      </Text>
      <Text fontSize="sm" color="gray.400">
        Панорамний огляд місцевості NASA та встановлення піна на карті
      </Text>
    </Box>
  );
};
