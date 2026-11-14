import { Badge, Box, HStack, Text, VStack } from '@chakra-ui/react';
import { Handle, type NodeProps, Position } from '@xyflow/react';
import { Disc3, Music } from 'lucide-react';
import type { AudioBgmNodeData } from '../../model/types';

export function AudioBgmNode({ data, selected }: NodeProps & { data: AudioBgmNodeData }) {
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
      <VStack align="stretch" gap="2">
        <HStack justify="space-between" align="center">
          <HStack gap="2">
            <Music size={16} color="#22d3ee" />
            <Text fontWeight="bold" fontSize="xs" color="fg">
              BGM & Audio Ducking
            </Text>
          </HStack>
          <Badge colorPalette="cyan" size="xs" variant="solid">
            {data.genre.toUpperCase()}
          </Badge>
        </HStack>

        <Box p="2" borderRadius="md" bg="bg.subtle">
          <HStack gap="2" mb="1">
            <Disc3 size={14} color="#67e8f9" />
            <Text fontWeight="semibold" fontSize="xs" color="fg" lineClamp={1}>
              {data.trackTitle}
            </Text>
          </HStack>

          <HStack justify="space-between" pt="1">
            <Text fontSize="2xs" color="fg.muted">
              Auto-Ducking спад:
            </Text>
            <Badge size="xs" colorPalette="cyan" variant="subtle">
              {data.duckingDb} dB
            </Badge>
          </HStack>

          <HStack justify="space-between" pt="1">
            <Text fontSize="2xs" color="fg.muted">
              Гучність фону / Attack:
            </Text>
            <Text fontSize="2xs" color="fg" fontWeight="semibold">
              {data.bgmVolumePct}% • {data.duckingAttackMs}ms
            </Text>
          </HStack>
        </Box>
      </VStack>

      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#22d3ee', width: '10px', height: '10px' }}
      />
    </Box>
  );
}
