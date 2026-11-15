import { Badge, Box, Button, Flex, HStack, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { Check, Sparkles } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useCuratorShowcase } from '../model/useCuratorShowcase';
import { ShowcaseSlot } from './ShowcaseSlot';

export interface CuratorShowcaseProps {
  callsign: string;
  isOwner?: boolean;
}

const SHOWCASE_BAY_IDS = [
  'showcase-slot-bay-0',
  'showcase-slot-bay-1',
  'showcase-slot-bay-2',
  'showcase-slot-bay-3',
  'showcase-slot-bay-4',
];

export const CuratorShowcase: React.FC<CuratorShowcaseProps> = ({ callsign, isOwner = false }) => {
  const { slots, isLoading, isSaving, fetchShowcase, reorder, save } = useCuratorShowcase();
  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (callsign) {
      fetchShowcase(callsign);
    }
  }, [callsign, fetchShowcase]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = Number(active.id.toString().replace('slot-', ''));
    const newIndex = Number(over.id.toString().replace('slot-', ''));

    reorder(oldIndex, newIndex);
    setHasChanges(true);
  };

  const handleSave = async () => {
    await save();
    setHasChanges(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const itemIds = slots.map((_, i) => `slot-${i}`);

  return (
    <Box
      w="100%"
      p={{ base: 4, md: 6 }}
      bg="rgba(11, 15, 25, 0.7)"
      borderRadius="xl"
      borderWidth="1px"
      borderColor="whiteAlpha.100"
    >
      <Flex
        justify="space-between"
        align={{ base: 'flex-start', sm: 'center' }}
        direction={{ base: 'column', sm: 'row' }}
        gap={3}
        mb={5}
      >
        <VStack align="flex-start" gap={1}>
          <HStack gap={2}>
            <Sparkles size={18} color="#00F0FF" />
            <Text fontSize="lg" fontWeight="bold" color="white">
              Curator Showcase
            </Text>
            <Badge colorPalette="cyan" variant="subtle" size="xs">
              5 SLOTS
            </Badge>
          </HStack>
          <Text fontSize="xs" color="gray.400">
            {isOwner
              ? 'Drag & drop to organize your 5 showcased artifacts for public viewers.'
              : `Curated artifacts highlighted by ${callsign}.`}
          </Text>
        </VStack>

        {isOwner && hasChanges && (
          <Button size="sm" colorPalette="cyan" onClick={handleSave} loading={isSaving}>
            Save Showcase Order
          </Button>
        )}

        {saveSuccess && (
          <HStack color="green.400" fontSize="xs">
            <Check size={14} />
            <Text>Order saved!</Text>
          </HStack>
        )}
      </Flex>

      {isLoading ? (
        <Box py={8} textAlign="center">
          <Text color="gray.400" fontSize="sm">
            Accessing artifact archives...
          </Text>
        </Box>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={itemIds} strategy={rectSortingStrategy}>
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 5 }} gap={3}>
              {SHOWCASE_BAY_IDS.map((bayId, index) => {
                const item = slots[index] ?? null;
                return (
                  <ShowcaseSlot
                    key={bayId}
                    id={`slot-${index}`}
                    slotIndex={index}
                    item={item}
                    isOwner={isOwner}
                  />
                );
              })}
            </SimpleGrid>
          </SortableContext>
        </DndContext>
      )}
    </Box>
  );
};
