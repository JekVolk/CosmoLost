import { Badge, Box, HStack, Text, VStack } from '@chakra-ui/react';
import { Handle, type NodeProps, Position } from '@xyflow/react';
import { Sparkles } from 'lucide-react';
import type { HookScorerNodeData } from '../../model/types';

export function HookScorerNode({ data, selected }: NodeProps & { data: HookScorerNodeData }) {
  const getGradeColor = (grade: HookScorerNodeData['viralGrade']) => {
    switch (grade) {
      case 'S':
        return 'purple';
      case 'A':
        return 'green';
      case 'B':
        return 'teal';
      case 'C':
        return 'yellow';
      default:
        return 'red';
    }
  };

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
            <Sparkles size={16} color="#c084fc" />
            <Text fontWeight="bold" fontSize="xs" color="fg">
              Hook Virality Scorer
            </Text>
          </HStack>
          <Badge colorPalette={getGradeColor(data.viralGrade)} size="xs" variant="solid">
            {data.viralGrade} Grade ({data.score}/100)
          </Badge>
        </HStack>

        <Box p="2" borderRadius="md" bg="bg.subtle">
          <HStack justify="space-between" mb="1">
            <Text fontSize="2xs" color="fg.muted">
              Питальна форма:
            </Text>
            <Badge size="xs" colorPalette={data.questionFormat ? 'green' : 'gray'}>
              {data.questionFormat ? '✓ Так' : 'Ні'}
            </Badge>
          </HStack>

          <HStack justify="space-between" mb="1">
            <Text fontSize="2xs" color="fg.muted">
              Curiosity Gap (Інтрига):
            </Text>
            <Badge size="xs" colorPalette={data.curiosityGap ? 'green' : 'gray'}>
              {data.curiosityGap ? '✓ Присутня' : 'Ні'}
            </Badge>
          </HStack>

          <HStack justify="space-between" mb="1">
            <Text fontSize="2xs" color="fg.muted">
              Лаконічність (&lt;12 слів):
            </Text>
            <Badge size="xs" colorPalette={data.brevityUnder12Words ? 'green' : 'orange'}>
              {data.brevityUnder12Words ? '✓ 0-3 сек' : 'Задовгий'}
            </Badge>
          </HStack>

          <Text fontSize="2xs" color="purple.300" pt="1" fontStyle="italic" lineClamp={2}>
            {data.feedbackTip}
          </Text>
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
