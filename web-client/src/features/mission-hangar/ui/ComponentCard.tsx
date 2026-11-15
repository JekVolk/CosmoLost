import { Box, HStack, Text } from '@chakra-ui/react';
import { useDraggable } from '@dnd-kit/core';
import type React from 'react';
import type { MissionComponent } from '../model/useMissionHangar';

interface ComponentCardProps {
  component: MissionComponent;
  disabled?: boolean;
  categories?: string[];
  currentCategory?: string | null;
  onSelectCategory?: (category: string) => void;
  onRemove?: () => void;
}

export const ComponentCard: React.FC<ComponentCardProps> = ({
  component,
  disabled = false,
  categories = [],
  currentCategory = null,
  onSelectCategory,
  onRemove,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: component.id,
    disabled,
  });

  const transformStyle = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 999,
      }
    : undefined;

  return (
    <Box
      ref={setNodeRef}
      style={transformStyle}
      {...attributes}
      {...listeners}
      p={3}
      borderRadius="lg"
      bg={isDragging ? 'blue.950' : 'gray.900'}
      border="1px solid"
      borderColor={isDragging ? 'blue.400' : 'gray.700'}
      boxShadow={isDragging ? '0 8px 24px rgba(66, 153, 225, 0.4)' : '0 2px 4px rgba(0, 0, 0, 0.3)'}
      cursor={disabled ? 'not-allowed' : isDragging ? 'grabbing' : 'grab'}
      opacity={isDragging ? 0.75 : 1}
      userSelect="none"
      transition="border-color 0.15s ease, background-color 0.15s ease"
      _hover={!disabled ? { borderColor: 'blue.400', bg: 'gray.850' } : undefined}
      w="100%"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      gap={2}
    >
      <HStack gap={2.5} flex={1} overflow="hidden">
        <Text fontSize="xl" flexShrink={0} aria-hidden="true">
          {component.icon || '⚙️'}
        </Text>
        <Text fontSize="sm" fontWeight="medium" color="gray.200" isTruncated>
          {component.name}
        </Text>
      </HStack>

      {/* Accessible move / remove actions without requiring mouse DnD */}
      {!disabled && onSelectCategory && categories.length > 0 && (
        <HStack gap={1} flexShrink={0}>
          {currentCategory ? (
            <Box
              as="button"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove?.();
              }}
              px={2}
              py={0.5}
              borderRadius="sm"
              bg="gray.800"
              color="red.300"
              fontSize="2xs"
              _hover={{ bg: 'red.900', color: 'white' }}
              title="Прибрати з категорії"
            >
              ✕
            </Box>
          ) : (
            <Box display="flex" gap={1} onClick={(e) => e.stopPropagation()}>
              {categories.map((cat) => (
                <Box
                  key={cat}
                  as="button"
                  type="button"
                  onClick={() => onSelectCategory(cat)}
                  px={1.5}
                  py={0.5}
                  borderRadius="sm"
                  bg="gray.800"
                  color="gray.400"
                  fontSize="3xs"
                  _hover={{ bg: 'blue.800', color: 'white' }}
                  title={`Перемістити до ${cat}`}
                >
                  {cat.slice(0, 3)}
                </Box>
              ))}
            </Box>
          )}
        </HStack>
      )}
    </Box>
  );
};
