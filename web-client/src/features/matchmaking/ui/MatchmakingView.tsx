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
            Searching for opponent in orbit...
          </Text>
          <Text fontSize="sm" color="gray.400">
            Autonomous bot engages in 8s if room is empty
          </Text>
          <Button colorPalette="red" variant="subtle" onClick={onCancel}>
            Cancel
          </Button>
        </VStack>
      ) : (
        <VStack gap={4}>
          <Text fontSize="xl" fontWeight="bold">
            Ready for a deductive duel?
          </Text>
          <Button colorPalette="cyan" size="lg" onClick={onStart}>
            Start Battle (1 Crate)
          </Button>
        </VStack>
      )}
    </Box>
  );
};
