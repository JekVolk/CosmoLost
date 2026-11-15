import { Badge, Box, HStack, Text, VStack } from '@chakra-ui/react';
import { Handle, type NodeProps, Position } from '@xyflow/react';
import { FileText } from 'lucide-react';
import type { ScriptTemplateNodeData } from '../../model/types';

export function ScriptTemplateNode({
  data,
  selected,
}: NodeProps & { data: ScriptTemplateNodeData }) {
  return (
    <Box
      minW="260px"
      p="3"
      borderRadius="xl"
      bg="bg.panel"
      borderWidth="2px"
      borderColor={selected ? 'purple.400' : 'border.subtle'}
      boxShadow="md"
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#a855f7', width: '10px', height: '10px' }}
      />

      <VStack align="stretch" gap="2">
        <HStack justify="space-between" align="center">
          <HStack gap="2">
            <FileText size={16} color="#c084fc" />
            <Text fontWeight="bold" fontSize="xs" color="fg">
              2. SMM Rubric (~40s)
            </Text>
          </HStack>
          <Badge colorPalette="purple" size="xs">
            {data.rubricId}
          </Badge>
        </HStack>

        <Box p="2" borderRadius="md" bg="bg.subtle">
          <Text fontSize="2xs" color="fg.muted">
            Хук (0–3с): "{data.hookText}"
          </Text>
          <HStack justify="space-between" pt="1">
            <Badge variant="outline" size="xs">
              {data.slidesCount} слайди
            </Badge>
            <Text fontSize="2xs" color="purple.300">
              Ціль: ~{data.durationSec}с
            </Text>
          </HStack>
        </Box>
      </VStack>

      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#a855f7', width: '10px', height: '10px' }}
      />
    </Box>
  );
}
