import { Box, Flex, Text, VStack } from '@chakra-ui/react';
import { Loader2 } from 'lucide-react';
import type React from 'react';

export const RouteSuspense: React.FC = () => {
  return (
    <Flex align="center" justify="center" minH="50vh" p="8" color="fg.muted">
      <VStack gap="3">
        <Box animation="spin 1s linear infinite" display="inline-block">
          <Loader2 size={24} color="#38bdf8" />
        </Box>
        <Text fontSize="xs">Loading screen...</Text>
      </VStack>
    </Flex>
  );
};
