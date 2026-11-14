import { Badge, Box, HStack, Text, VStack } from '@chakra-ui/react';
import { Handle, type NodeProps, Position } from '@xyflow/react';
import { ShieldCheck, Smartphone } from 'lucide-react';
import type { SafeZonePreviewNodeData } from '../../model/types';

export function SafeZonePreviewNode({
  data,
  selected,
}: NodeProps & { data: SafeZonePreviewNodeData }) {
  return (
    <Box
      minW="260px"
      p="3"
      borderRadius="xl"
      bg="bg.panel"
      borderWidth="2px"
      borderColor={selected ? 'emerald.400' : 'border.subtle'}
      boxShadow="md"
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#10b981', width: '10px', height: '10px' }}
      />

      <VStack align="stretch" gap="2">
        <HStack justify="space-between" align="center">
          <HStack gap="2">
            <Smartphone size={16} color="#34d399" />
            <Text fontWeight="bold" fontSize="xs" color="fg">
              Safe Zones (9:16)
            </Text>
          </HStack>
          <Badge colorPalette="green" size="xs" variant="solid">
            {data.preset.toUpperCase()}
          </Badge>
        </HStack>

        <Box p="2" borderRadius="md" bg="bg.subtle">
          <HStack justify="space-between">
            <Text fontSize="2xs" color="fg.muted">
              Мертві зони інтерфейсу:
            </Text>
            <Text fontSize="2xs" color="fg" fontWeight="semibold">
              Top {data.topMarginPx}px • Bot {data.bottomMarginPx}px
            </Text>
          </HStack>

          <HStack justify="space-between" pt="1">
            <Text fontSize="2xs" color="fg.muted">
              Правий відступ (кнопки дій):
            </Text>
            <Badge size="xs" colorPalette="yellow" variant="subtle">
              {data.rightMarginPx}px Safe
            </Badge>
          </HStack>

          <HStack justify="space-between" pt="1">
            <Text fontSize="2xs" color="fg.muted">
              Субтитри & Аватар:
            </Text>
            <HStack gap="1">
              <ShieldCheck size={12} color="#10b981" />
              <Text fontSize="2xs" color="green.400" fontWeight="bold">
                В безпечній зоні
              </Text>
            </HStack>
          </HStack>
        </Box>
      </VStack>

      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#10b981', width: '10px', height: '10px' }}
      />
    </Box>
  );
}
