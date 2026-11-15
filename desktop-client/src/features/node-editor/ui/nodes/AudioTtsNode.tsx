import { Badge, Box, HStack, Text, VStack } from '@chakra-ui/react';
import { Handle, type NodeProps, Position } from '@xyflow/react';
import { Mic } from 'lucide-react';
import type { AudioTtsNodeData } from '../../model/types';

export function AudioTtsNode({ data, selected }: NodeProps & { data: AudioTtsNodeData }) {
  return (
    <Box
      minW="250px"
      p="3"
      borderRadius="xl"
      bg="bg.panel"
      borderWidth="2px"
      borderColor={selected ? 'blue.400' : 'border.subtle'}
      boxShadow="md"
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#3b82f6', width: '10px', height: '10px' }}
      />

      <VStack align="stretch" gap="2">
        <HStack justify="space-between" align="center">
          <HStack gap="2">
            <Mic size={16} color="#60a5fa" />
            <Text fontWeight="bold" fontSize="xs" color="fg">
              3. Edge-TTS Audio
            </Text>
          </HStack>
          <Badge colorPalette="blue" size="xs">
            {data.speedRate}x Speed
          </Badge>
        </HStack>

        <Box p="2" borderRadius="md" bg="bg.subtle">
          <Text fontSize="xs" color="fg" fontWeight="medium">
            {data.voice}
          </Text>
          <HStack justify="space-between" pt="1">
            <Badge colorPalette="green" variant="subtle" size="xs">
              Jump-Cut &lt;0.15s
            </Badge>
            <Text fontSize="2xs" color="blue.300">
              {data.audioDurationSec}с • {data.rmsSampleCount} RMS
            </Text>
          </HStack>
        </Box>
      </VStack>

      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#3b82f6', width: '10px', height: '10px' }}
      />
    </Box>
  );
}
