import { ContentFactoryWidget } from '@/widgets/content-factory';
import { Box } from '@chakra-ui/react';
import type React from 'react';

export const ContentFactoryPage: React.FC = () => {
  return (
    <Box px={{ base: '3', md: '4', xl: '5' }} py="4">
      <ContentFactoryWidget />
    </Box>
  );
};
