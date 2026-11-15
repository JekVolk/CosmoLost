import { Badge, Box, Flex, HStack, Text, VStack } from '@chakra-ui/react';
import type { PublicationProject } from '../model/types';

interface ProjectSummaryCardProps {
  project: PublicationProject;
  onOpen?: (project: PublicationProject) => void;
}

export function ProjectSummaryCard({ project, onOpen }: ProjectSummaryCardProps) {
  const getStatusColor = (status: PublicationProject['status']) => {
    switch (status) {
      case 'READY':
        return 'green';
      case 'RENDERING':
      case 'SYNTHESIZING':
        return 'yellow';
      case 'PUBLISHED':
        return 'teal';
      case 'FAILED':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <Box
      p="4"
      borderRadius="xl"
      bg="bg.panel"
      borderWidth="1px"
      borderColor="border.subtle"
      cursor={onOpen ? 'pointer' : 'default'}
      onClick={() => onOpen?.(project)}
      transition="all 0.2s"
      _hover={onOpen ? { borderColor: 'teal.400' } : undefined}
    >
      <VStack align="stretch" gap="2">
        <Flex justify="space-between" align="center">
          <Text fontWeight="semibold" fontSize="md" color="fg">
            {project.artifactName}
          </Text>
          <Badge
            colorPalette={getStatusColor(project.status)}
            size="sm"
            px="2.5"
            py="0.5"
            borderRadius="md"
          >
            {project.status}
          </Badge>
        </Flex>

        <Text fontSize="xs" color="fg.muted" lineClamp={2}>
          {project.selectionReason}
        </Text>

        <HStack justify="space-between" pt="2" borderTopWidth="1px" borderColor="border.subtle">
          <HStack gap="2">
            <Badge variant="outline" size="xs" px="2" py="0.5" borderRadius="md">
              {project.rubricId}
            </Badge>
            {project.brollVideoUrl && (
              <Badge
                colorPalette="purple"
                variant="subtle"
                size="xs"
                px="2"
                py="0.5"
                borderRadius="md"
              >
                🎮 B-Roll: {project.brollPreset?.replace('_', ' ') || 'Custom'}
              </Badge>
            )}
          </HStack>
          <Text fontSize="xs" color="fg.muted">
            {project.slides.length} слайдів • ~{project.targetDurationSec}с
          </Text>
        </HStack>
      </VStack>
    </Box>
  );
}
