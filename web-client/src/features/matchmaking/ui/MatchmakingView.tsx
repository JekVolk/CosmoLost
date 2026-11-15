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
            Searching for an opponent in orbit...
          </Text>
          <Text fontSize="sm" color="gray.400">
            A bot will join in 8 seconds if the room is empty
          </Text>
          <Button colorPalette="red" variant="subtle" onClick={onCancel}>
            Cancel
          </Button>
        </VStack>
      ) : (
        <VStack gap={4}>
          <Text fontSize="xl" fontWeight="bold">
            Ready for a deduction duel?
          </Text>
          <Button colorPalette="cyan" size="lg" onClick={onStart}>
            Start Match (1 Chest)
          </Button>
        </VStack>
      )}
    </Box>
  );
};
