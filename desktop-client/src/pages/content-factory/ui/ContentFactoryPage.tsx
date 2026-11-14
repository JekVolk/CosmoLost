import { ContentFactoryWidget } from '@/widgets/content-factory';
import { Box } from '@chakra-ui/react';
import type React from 'react';

export const ContentFactoryPage: React.FC = () => {
  return (
    <Box p="6">
      <ContentFactoryWidget />
    </Box>
  );
};
