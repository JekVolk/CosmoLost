import React from 'react';
import { Box, HStack, Text } from '@chakra-ui/react';

export const CuratorShowcase: React.FC = () => {
  return (
    <Box p={4} bg="#111622" borderRadius="md" border="1px solid #1F293D">
      <Text fontWeight="bold" mb={3}>Вітрина Куратора (Топ-5 Артефактів)</Text>
      <HStack gap={3}>
        {[0, 1, 2, 3, 4].map((i) => (
          <Box key={i} flex={1} p={3} border="1px dashed #3A4D6B" borderRadius="md" textAlign="center">
            <Text fontSize="xs" color="gray.500">Слот #{i + 1}</Text>
          </Box>
        ))}
      </HStack>
    </Box>
  );
};
