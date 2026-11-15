import { Badge, Box, HStack, Text } from '@chakra-ui/react';
import { Layers } from 'lucide-react';
import type { ContentTemplate } from '../model/types';

interface ContentTemplateBadgeProps {
  template: ContentTemplate;
  isSelected?: boolean;
  onClick?: () => void;
}

export function ContentTemplateBadge({
  template,
  isSelected = false,
  onClick,
}: ContentTemplateBadgeProps) {
  return (
    <Box
      as="button"
      px="3"
      py="1.5"
      borderRadius="md"
      borderWidth="1px"
      borderColor={isSelected ? 'teal.500' : 'border.subtle'}
      bg={isSelected ? 'teal.subtle' : 'bg.panel'}
      cursor="pointer"
      transition="all 0.15s ease"
      _hover={{ borderColor: 'teal.400' }}
      onClick={onClick}
    >
      <HStack gap="2">
        <Layers size={14} />
        <Text fontSize="xs" fontWeight={isSelected ? 'bold' : 'medium'} color="fg">
          {template.rubric_name}
        </Text>
        <Badge size="xs" colorPalette="teal" variant="subtle">
          {template.target_duration_sec}с
        </Badge>
      </HStack>
    </Box>
  );
}
