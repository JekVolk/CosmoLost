import { Badge, Box, HStack, Text, VStack } from '@chakra-ui/react';
import { Handle, type NodeProps, Position } from '@xyflow/react';
import { Cpu } from 'lucide-react';
import type { FfmpegRenderNodeData } from '../../model/types';

export function FfmpegRenderNode({ data, selected }: NodeProps & { data: FfmpegRenderNodeData }) {
  const getStatusColor = (status: FfmpegRenderNodeData['status']) => {
    switch (status) {
      case 'COMPLETED':
        return 'green';
      case 'RENDERING':
        return 'yellow';
      case 'FAILED':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <Box
      minW="260px"
      p="3"
      borderRadius="xl"
      bg="bg.panel"
      borderWidth="2px"
      borderColor={selected ? 'orange.400' : 'border.subtle'}
      boxShadow="md"
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#f97316', width: '10px', height: '10px' }}
      />

      <VStack align="stretch" gap="2">
        <HStack justify="space-between" align="center">
          <HStack gap="2">
            <Cpu size={16} color="#fb923c" />
            <Text fontWeight="bold" fontSize="xs" color="fg">
              6. FFmpeg Watchdog
            </Text>
          </HStack>
          <Badge colorPalette={getStatusColor(data.status)} size="xs">
            {data.status}
          </Badge>
        </HStack>

        <Box p="2" borderRadius="md" bg="bg.subtle">
          <HStack justify="space-between">
            <Text fontSize="2xs" color="fg.muted">
              Watchdog таймаут:
            </Text>
            <Badge colorPalette="yellow" size="xs">
              {data.renderTimeoutSec}с
            </Badge>
          </HStack>
          <HStack justify="space-between" pt="1">
            <Text fontSize="2xs" color="fg.muted">
              Формат / FPS:
            </Text>
            <Text fontSize="2xs" color="fg" fontWeight="semibold">
              H.264 • {data.fps} FPS
            </Text>
          </HStack>
          {data.progressPct > 0 && (
            <HStack justify="space-between" pt="1">
              <Text fontSize="2xs" color="fg.muted">
                Прогрес:
              </Text>
              <Text fontSize="2xs" color="teal.400" fontWeight="bold">
                {data.progressPct}%
              </Text>
            </HStack>
          )}
        </Box>
      </VStack>

      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#f97316', width: '10px', height: '10px' }}
      />
    </Box>
  );
}
