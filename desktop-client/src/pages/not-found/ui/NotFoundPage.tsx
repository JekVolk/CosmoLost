import { ROUTES } from '@/shared/config';
import { Badge, Box, Button, Heading, Text, VStack } from '@/shared/ui';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import type React from 'react';
import { useNavigate } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box display="flex" alignItems="center" justifyContent="center" height="100%" p="8">
      <VStack gap="4" textAlign="center" maxW="450px">
        <AlertCircle size={48} color="#ef4444" />
        <Badge colorPalette="red" variant="subtle" size="md">
          404 Not Found
        </Badge>
        <Heading size="xl" color="fg">
          Screen Does Not Exist
        </Heading>
        <Text color="fg.muted" fontSize="sm">
          The requested route was not found in the desktop navigation table. You can return to the
          main overview screen.
        </Text>
        <Button
          colorPalette="blue"
          variant="solid"
          size="sm"
          onClick={() => navigate(ROUTES.OVERVIEW)}
        >
          <ArrowLeft size={16} />
          Back to Overview
        </Button>
      </VStack>
    </Box>
  );
};
