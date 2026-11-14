import { Badge, Box, HStack, Text, VStack } from '@chakra-ui/react';
import { Handle, type NodeProps, Position } from '@xyflow/react';
import { Database } from 'lucide-react';
import type { ArtifactSourceNodeData } from '../../model/types';

export function ArtifactSourceNode({
  data,
  selected,
}: NodeProps & { data: ArtifactSourceNodeData }) {
  return (
    <Box
      minW="240px"
      p="3"
      borderRadius="xl"
      bg="bg.panel"
      borderWidth="2px"
      borderColor={selected ? 'teal.400' : 'border.subtle'}
      boxShadow="md"
    >
      <VStack align="stretch" gap="2">
        <HStack justify="space-between" align="center">
          <HStack gap="2">
            <Database size={16} color="#2dd4bf" />
            <Text fontWeight="bold" fontSize="xs" color="fg">
              1. NASA Data Source
            </Text>
          </HStack>
          <Badge
            colorPalette={data.celestialBody === 'mars' ? 'red' : 'blue'}
            size="xs"
            variant="solid"
          >
            {data.celestialBody.toUpperCase()}
          </Badge>
        </HStack>

        <Box p="2" borderRadius="md" bg="bg.subtle">
          <Text fontWeight="semibold" fontSize="xs" color="fg" lineClamp={1}>
            {data.artifactName}
          </Text>
          <HStack justify="space-between" pt="1">
            <Text fontSize="2xs" color="fg.muted">
              {data.photosCount} фото в архіві
            </Text>
            {data.has3dModel && (
              <Badge colorPalette="teal" variant="subtle" size="xs">
                3D GLB
              </Badge>
            )}
          </HStack>
        </Box>
      </VStack>

      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#2dd4bf', width: '10px', height: '10px' }}
      />
    </Box>
  );
}
