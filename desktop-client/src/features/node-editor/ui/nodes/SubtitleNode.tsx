import { Badge, Box, HStack, Text, VStack } from '@chakra-ui/react';
import { Handle, type NodeProps, Position } from '@xyflow/react';
import { Captions } from 'lucide-react';
import type { SubtitleNodeData } from '../../model/types';

export function SubtitleNode({ data, selected }: NodeProps & { data: SubtitleNodeData }) {
  return (
    <Box
      minW="240px"
      p="3"
      borderRadius="xl"
      bg="bg.panel"
      borderWidth="2px"
      borderColor={selected ? 'yellow.400' : 'border.subtle'}
      boxShadow="md"
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#eab308', width: '10px', height: '10px' }}
      />

      <VStack align="stretch" gap="2">
        <HStack justify="space-between" align="center">
          <HStack gap="2">
            <Captions size={16} color="#facc15" />
            <Text fontWeight="bold" fontSize="xs" color="fg">
              4. Kinetic Subtitles
            </Text>
          </HStack>
          <Badge colorPalette="yellow" size="xs">
            {data.format}
          </Badge>
        </HStack>

        <Box p="2" borderRadius="md" bg="bg.subtle">
          <HStack justify="space-between">
            <Text fontSize="2xs" color="fg.muted">
              Підсвічування:
            </Text>
            <HStack gap="1">
              <Box w="10px" h="10px" borderRadius="full" bg={data.highlightColor} />
              <Text fontSize="2xs" fontFamily="mono" color="fg">
                {data.highlightColor}
              </Text>
            </HStack>
          </HStack>
          <Text fontSize="2xs" color="fg.muted" pt="1">
            {data.wordsPerChunk} слова на чанк (Safe Area)
          </Text>
        </Box>
      </VStack>

      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#eab308', width: '10px', height: '10px' }}
      />
    </Box>
  );
}
