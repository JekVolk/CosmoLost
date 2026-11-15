import { Box, Button, Text, VStack } from '@chakra-ui/react';
import type React from 'react';

export const MatchmakingView: React.FC<{
  onStart: () => void;
  onCancel: () => void;
  isSearching: boolean;
}> = ({ onStart, onCancel, isSearching }) => {
  return (
    <Box
      p={6}
      borderRadius="lg"
      bg="rgba(17, 22, 34, 0.8)"
      border="1px solid #1F293D"
      textAlign="center"
    >
      {isSearching ? (
        <VStack gap={4}>
          <Text fontSize="lg" color="cyan.400">
            Пошук опонента на орбіті...
          </Text>
          <Text fontSize="sm" color="gray.400">
            Підключення бота через 8 сек, якщо кімната порожня
          </Text>
          <Button colorPalette="red" variant="subtle" onClick={onCancel}>
            Скасувати
          </Button>
        </VStack>
      ) : (
        <VStack gap={4}>
          <Text fontSize="xl" fontWeight="bold">
            Готові до дедуктивної дуелі?
          </Text>
          <Button colorPalette="cyan" size="lg" onClick={onStart}>
            Розпочати бій (1 Скринька)
          </Button>
        </VStack>
      )}
    </Box>
  );
};
