import { getContainerIconUrl } from '@/shared/lib';
import { Box, Image, Text } from '@chakra-ui/react';
import type React from 'react';
import type { ContainerSlot } from '../model/useContainerStore';

export const ContainerSlotView: React.FC<{
  slot: ContainerSlot;
  onOpen?: (index: number) => void;
}> = ({ slot, onOpen }) => {
  const isReady = !slot.is_opened;
  const iconUrl = getContainerIconUrl('standard', !isReady);

  return (
    <Box
      p={3}
      borderRadius="md"
      borderWidth="1px"
      borderColor={isReady ? 'cyan.400' : 'gray.700'}
      bg={isReady ? 'rgba(0, 240, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)'}
      cursor={isReady ? 'pointer' : 'default'}
      onClick={() => isReady && onOpen?.(slot.slot_index)}
      textAlign="center"
      transition="all 0.2s ease"
      _hover={isReady ? { transform: 'scale(1.05)', borderColor: 'cyan.300' } : undefined}
    >
      <Image
        src={iconUrl}
        alt={isReady ? 'Готовий контейнер' : 'Заблокований контейнерний слот'}
        width="48px"
        height="48px"
        mx="auto"
        mb={2}
        objectFit="contain"
      />
      <Text fontSize="xs" color={isReady ? 'cyan.200' : 'gray.400'} fontWeight="medium">
        Слот #{slot.slot_index + 1}
      </Text>
    </Box>
  );
};
