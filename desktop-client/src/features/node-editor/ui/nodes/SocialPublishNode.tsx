import { Badge, Box, HStack, Text, VStack } from '@chakra-ui/react';
import { Handle, type NodeProps, Position } from '@xyflow/react';
import { Share2 } from 'lucide-react';
import type { SocialPublishNodeData } from '../../model/types';

export function SocialPublishNode({ data, selected }: NodeProps & { data: SocialPublishNodeData }) {
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
        style={{ background: '#ec4899', width: '10px', height: '10px' }}
      />

      <VStack align="stretch" gap="2">
        <HStack justify="space-between" align="center">
          <HStack gap="2">
            <Share2 size={16} color="#f472b6" />
            <Text fontWeight="bold" fontSize="xs" color="fg">
              7. Multi-Distribution
            </Text>
          </HStack>
          <Badge colorPalette="pink" size="xs">
            {data.selectedChannels.length} Канали
          </Badge>
        </HStack>

        <Box p="2" borderRadius="md" bg="bg.subtle">
          <Text fontSize="2xs" color="fg.muted" lineClamp={1}>
            Хук: "{data.line1Hook}"
          </Text>
          <HStack justify="space-between" pt="1">
            <Badge variant="subtle" size="xs" colorPalette="teal">
              SEO 3-рядки
            </Badge>
            <Badge variant="solid" size="xs" colorPalette="pink">
              Auto-Pin
            </Badge>
          </HStack>
        </Box>
      </VStack>
    </Box>
  );
}
