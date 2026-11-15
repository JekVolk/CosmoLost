import { Badge, Box, Button, HStack, Text, VStack } from '@chakra-ui/react';
import type { ContainerSlot as ContainerSlotType } from '../api/container-repository';

export interface ContainerSlotProps {
  slot: ContainerSlotType;
  onPlay?: (slotIndex: number) => void;
  disabled?: boolean;
}

export function ContainerSlot({ slot, onPlay, disabled = false }: ContainerSlotProps) {
  const isAvailable = Boolean(slot.container_type) && !slot.is_reserved;
  const isPartiallyUnsealed = slot.seal_progress === 50;

  const handlePlayClick = () => {
    if (isAvailable && !disabled) {
      onPlay?.(slot.slot_index);
    }
  };

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      borderColor={slot.is_reserved ? 'yellow.600' : isAvailable ? 'cyan.700' : 'gray.700'}
      bg={slot.is_reserved ? 'yellow.950' : isAvailable ? 'gray.900' : 'blackAlpha.400'}
      p={4}
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      gap={3}
      data-slot-index={slot.slot_index}
    >
      <HStack justify="space-between" align="center">
        <Text fontSize="xs" fontWeight="bold" color="gray.400">
          SLOT #{slot.slot_index + 1}
        </Text>
        {slot.is_reserved ? (
          <Badge colorPalette="yellow" variant="solid" size="sm">
            IN MATCH
          </Badge>
        ) : isPartiallyUnsealed ? (
          <Badge colorPalette="purple" variant="outline" size="sm">
            SEAL 50%
          </Badge>
        ) : slot.container_type ? (
          <Badge colorPalette="cyan" variant="subtle" size="sm">
            READY
          </Badge>
        ) : (
          <Badge colorPalette="gray" variant="surface" size="sm">
            EMPTY
          </Badge>
        )}
      </HStack>

      <VStack align="start" gap={1}>
        <Text fontSize="md" fontWeight="bold" color="gray.100">
          {slot.container_type || 'Empty Container'}
        </Text>
        <Text fontSize="xs" color="gray.400">
          {slot.is_reserved
            ? 'Match in progress...'
            : isPartiallyUnsealed
              ? 'Puncture seal 50% broken. Win to claim!'
              : slot.container_type
                ? 'Container sealed. Enter arena.'
                : 'Awaiting container delivery.'}
        </Text>
      </VStack>

      <Button
        size="sm"
        colorPalette={isAvailable ? 'cyan' : 'gray'}
        disabled={!isAvailable || disabled}
        onClick={handlePlayClick}
        width="100%"
      >
        {slot.is_reserved ? 'In Match' : isAvailable ? 'Play Match' : 'Locked'}
      </Button>
    </Box>
  );
}
