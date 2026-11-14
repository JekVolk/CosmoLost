import { Badge, Box, HStack, Text, VStack } from '@chakra-ui/react';
import { Handle, type NodeProps, Position } from '@xyflow/react';
import { Layers } from 'lucide-react';
import type { VisualCompositeNodeData } from '../../model/types';

export function VisualCompositeNode({
  data,
  selected,
}: NodeProps & { data: VisualCompositeNodeData }) {
  return (
    <Box
      minW="260px"
      p="3"
      borderRadius="xl"
      bg="bg.panel"
      borderWidth="2px"
      borderColor={selected ? 'cyan.400' : 'border.subtle'}
      boxShadow="md"
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#06b6d4', width: '10px', height: '10px' }}
      />

      <VStack align="stretch" gap="2">
        <HStack justify="space-between" align="center">
          <HStack gap="2">
            <Layers size={16} color="#22d3ee" />
            <Text fontWeight="bold" fontSize="xs" color="fg">
              5. Visual Compositor
            </Text>
          </HStack>
          <Badge colorPalette="cyan" size="xs">
            1080x1920
          </Badge>
        </HStack>

        <Box p="2" borderRadius="md" bg="bg.subtle">
          <VStack align="stretch" gap="1">
            <HStack justify="space-between">
              <Text fontSize="2xs" color="fg.muted">
                Pillow-box 4:3 Blur:
              </Text>
              <Badge colorPalette={data.enablePillowBox ? 'green' : 'gray'} size="xs">
                {data.enablePillowBox ? 'ON' : 'OFF'}
              </Badge>
            </HStack>
            <HStack justify="space-between">
              <Text fontSize="2xs" color="fg.muted">
                PNGTuber Аватар:
              </Text>
              <Badge colorPalette="pink" size="xs">
                {data.pngtuberState}
              </Badge>
            </HStack>
            <HStack justify="space-between">
              <Text fontSize="2xs" color="fg.muted">
                Safe Zones (220/420/150):
              </Text>
              <Badge colorPalette="teal" size="xs">
                ACTIVE
              </Badge>
            </HStack>
          </VStack>
        </Box>
      </VStack>

      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#06b6d4', width: '10px', height: '10px' }}
      />
    </Box>
  );
}
