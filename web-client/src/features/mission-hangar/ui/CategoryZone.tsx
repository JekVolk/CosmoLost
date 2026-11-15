import { Badge, Box, Heading, Text, VStack } from '@chakra-ui/react';
import { useDroppable } from '@dnd-kit/core';
import type React from 'react';
import type { MissionComponent } from '../model/useMissionHangar';
import { ComponentCard } from './ComponentCard';

interface CategoryZoneProps {
  category: string;
  components: MissionComponent[];
  disabled?: boolean;
  onRemoveComponent?: (componentId: string) => void;
}

const CATEGORY_META: Record<string, { label: string; icon: string; color: string }> = {
  Science: { label: 'Наукові прилади (Science)', icon: '🔬', color: 'purple' },
  Propulsion: { label: 'Рушійна система & Посадка', icon: '🚀', color: 'orange' },
  Communication: { label: "Зв'язок & Телеметрія", icon: '📡', color: 'blue' },
  Power: { label: 'Живлення & Енергетика', icon: '⚡', color: 'yellow' },
};

export const CategoryZone: React.FC<CategoryZoneProps> = ({
  category,
  components,
  disabled = false,
  onRemoveComponent,
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id: category,
    disabled,
  });

  const meta = CATEGORY_META[category] || {
    label: category,
    icon: '📦',
    color: 'gray',
  };

  return (
    <Box
      ref={setNodeRef}
      p={4}
      borderRadius="xl"
      bg={isOver ? 'gray.850' : 'gray.900'}
      border="2px dashed"
      borderColor={isOver ? 'blue.400' : 'gray.800'}
      boxShadow={isOver ? '0 0 20px rgba(66, 153, 225, 0.3)' : 'none'}
      minH="180px"
      w="100%"
      display="flex"
      flexDirection="column"
      transition="all 0.2s ease"
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Text fontSize="lg" aria-hidden="true">
            {meta.icon}
          </Text>
          <Heading size="xs" color="white">
            {meta.label}
          </Heading>
        </Box>
        <Badge colorPalette={meta.color} size="sm">
          {components.length}
        </Badge>
      </Box>

      <VStack gap={2} flex={1} w="100%">
        {components.length === 0 ? (
          <Box
            flex={1}
            w="100%"
            display="flex"
            alignItems="center"
            justifyContent="center"
            p={4}
            borderRadius="md"
            bg="rgba(0, 0, 0, 0.2)"
          >
            <Text fontSize="xs" color="gray.500" fontStyle="italic" textAlign="center">
              Перетягніть компонент сюди
            </Text>
          </Box>
        ) : (
          components.map((comp) => (
            <ComponentCard
              key={comp.id}
              component={comp}
              disabled={disabled}
              currentCategory={category}
              onRemove={() => onRemoveComponent?.(comp.id)}
            />
          ))
        )}
      </VStack>
    </Box>
  );
};
