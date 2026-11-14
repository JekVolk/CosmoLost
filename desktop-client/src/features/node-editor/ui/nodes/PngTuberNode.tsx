import { Badge, Box, HStack, Text, VStack } from '@chakra-ui/react';
import { Handle, type NodeProps, Position } from '@xyflow/react';
import { Bot, Smile } from 'lucide-react';
import type { PngTuberNodeData } from '../../model/types';

export function PngTuberNode({ data, selected }: NodeProps & { data: PngTuberNodeData }) {
  return (
    <Box
      minW="260px"
      p="3"
      borderRadius="xl"
      bg="bg.panel"
      borderWidth="2px"
      borderColor={selected ? 'pink.400' : 'border.subtle'}
      boxShadow="md"
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#f472b6', width: '10px', height: '10px' }}
      />

      <VStack align="stretch" gap="2">
        <HStack justify="space-between" align="center">
          <HStack gap="2">
            <Bot size={16} color="#f472b6" />
            <Text fontWeight="bold" fontSize="xs" color="fg">
              PNGTuber Avatar
            </Text>
          </HStack>
          <Badge colorPalette="pink" size="xs" variant="solid">
            {data.activeExpression.toUpperCase()}
          </Badge>
        </HStack>

        <Box p="2" borderRadius="md" bg="bg.subtle">
          <HStack gap="2" mb="1">
            <Smile size={14} color="#f472b6" />
            <Text fontWeight="semibold" fontSize="xs" color="fg" lineClamp={1}>
              {data.modelName}
            </Text>
          </HStack>

          <HStack justify="space-between" pt="1">
            <Text fontSize="2xs" color="fg.muted">
              RMS поріг відкриття рота:
            </Text>
            <Badge size="xs" colorPalette="pink" variant="subtle">
              {data.rmsThreshold} RMS
            </Badge>
          </HStack>

          <HStack justify="space-between" pt="1">
            <Text fontSize="2xs" color="fg.muted">
              Позиція / Bounce:
            </Text>
            <Text fontSize="2xs" color="fg" fontWeight="semibold">
              {data.anchorPosition} {data.bounceEnabled ? '• Spring' : ''}
            </Text>
          </HStack>
        </Box>
      </VStack>

      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#f472b6', width: '10px', height: '10px' }}
      />
    </Box>
  );
}
