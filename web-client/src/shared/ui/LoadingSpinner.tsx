import { Spinner, type StackProps, Text, VStack } from '@chakra-ui/react';

export interface LoadingSpinnerProps extends StackProps {
  message?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export function LoadingSpinner({
  message = 'Loading...',
  size = 'md',
  ...props
}: LoadingSpinnerProps) {
  return (
    <VStack gap={3} align="center" justify="center" p={4} {...props}>
      <Spinner size={size} color="blue.500" />
      {message ? (
        <Text fontSize="sm" color="gray.400">
          {message}
        </Text>
      ) : null}
    </VStack>
  );
}
