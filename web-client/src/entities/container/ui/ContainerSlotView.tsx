import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import type { ContainerSlot } from '../model/useContainerStore';

export const ContainerSlotView: React.FC<{
  slot: ContainerSlot;
  onOpen?: (index: number) => void;
}> = ({ slot, onOpen }) => {
  const isReady = !slot.is_opened;

  return (
    <Box
      p={3}
      borderRadius="md"
      borderWidth="1px"
      borderColor={isReady ? 'blue.400' : 'gray.700'}
      bg={isReady ? 'rgba(0, 240, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)'}
      cursor={isReady ? 'pointer' : 'default'}
      onClick={() => isReady && onOpen?.(slot.slot_index)}
      textAlign="center"
    >
      <Text fontSize="2xl">{isReady ? '📦' : '🔒'}</Text>
      <Text fontSize="xs" color="gray.400">
        Слот #{slot.slot_index + 1}
      </Text>
    </Box>
  );
};
