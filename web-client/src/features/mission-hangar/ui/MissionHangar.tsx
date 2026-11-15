import { Badge, Box, Button, HStack, Heading, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type React from 'react';
import { useMissionHangar } from '../model/useMissionHangar';
import { CategoryZone } from './CategoryZone';
import { ComponentCard } from './ComponentCard';

export const MissionHangar: React.FC = () => {
  const {
    grouping,
    categories,
    components,
    unassignedComponents,
    moveComponent,
    removeFromCategory,
    isSubmitted,
    submit,
  } = useMissionHangar();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !active) return;

    const componentId = String(active.id);
    const targetCategory = String(over.id);

    moveComponent(componentId, targetCategory);
  };

  const componentMap = new Map(components.map((c) => [c.id, c]));

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <VStack gap={5} w="100%" maxW="960px" mx="auto" p={4}>
        {/* Header */}
        <HStack justify="space-between" w="100%" flexWrap="wrap" gap={2}>
          <VStack align="start" gap={1}>
            <HStack gap={2}>
              <Heading size="md" color="white">
                MissionHangar: Assemble the Mission
              </Heading>
              <Badge colorPalette="blue">DRAG-AND-DROP CLASSIFICATION</Badge>
            </HStack>
            <Text fontSize="xs" color="gray.400">
              Sort spacecraft hardware modules into the appropriate engineering categories.
            </Text>
          </VStack>

          {isSubmitted && (
            <Badge colorPalette="green" size="lg">
              ✓ CONFIGURATION LOCKED IN
            </Badge>
          )}
        </HStack>

        {/* Unassigned Components Pool */}
        <Box
          w="100%"
          p={4}
          bg="gray.950"
          borderRadius="xl"
          border="1px solid"
          borderColor="gray.800"
        >
          <HStack justify="space-between" mb={3}>
            <Text
              fontSize="xs"
              color="gray.400"
              fontWeight="bold"
              textTransform="uppercase"
              letterSpacing="wider"
            >
              AVAILABLE MISSION COMPONENTS ({unassignedComponents.length})
            </Text>
            <Text fontSize="3xs" color="gray.500">
              Drag items or use the quick-assign buttons
            </Text>
          </HStack>

          {unassignedComponents.length === 0 ? (
            <Box p={3} textAlign="center" borderRadius="md" bg="gray.900">
              <Text fontSize="xs" color="green.400">
                ✓ All components have been assigned to engineering sections
              </Text>
            </Box>
          ) : (
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap={2}>
              {unassignedComponents.map((comp) => (
                <ComponentCard
                  key={comp.id}
                  component={comp}
                  disabled={isSubmitted}
                  categories={categories}
                  onSelectCategory={(cat) => moveComponent(comp.id, cat)}
                />
              ))}
            </SimpleGrid>
          )}
        </Box>

        {/* Droppable Category Zones Grid */}
        <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4} w="100%">
          {categories.map((cat) => {
            const compIds = grouping[cat] || [];
            const comps = compIds
              .map((id) => componentMap.get(id))
              .filter((c): c is (typeof components)[0] => Boolean(c));

            return (
              <CategoryZone
                key={cat}
                category={cat}
                components={comps}
                disabled={isSubmitted}
                onRemoveComponent={removeFromCategory}
              />
            );
          })}
        </SimpleGrid>

        {/* Submit action */}
        <HStack justify="space-between" w="100%" pt={2} flexWrap="wrap" gap={3}>
          <Text fontSize="xs" color="gray.400">
            {unassignedComponents.length > 0
              ? `Unassigned components remaining: ${unassignedComponents.length}`
              : 'Ready to lock in the mission configuration'}
          </Text>

          <Button
            colorPalette="blue"
            size="lg"
            onClick={submit}
            disabled={isSubmitted}
            loading={isSubmitted}
            cursor={isSubmitted ? 'not-allowed' : 'pointer'}
          >
            {isSubmitted ? 'Configuration Submitted' : 'Confirm Mission Assembly'}
          </Button>
        </HStack>
      </VStack>
    </DndContext>
  );
};
