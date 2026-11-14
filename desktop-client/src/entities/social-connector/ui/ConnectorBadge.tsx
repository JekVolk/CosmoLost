import { Badge, HStack, Text } from '@chakra-ui/react';
import type { ConnectorItem } from '../model/types';

interface ConnectorBadgeProps {
  connector: ConnectorItem;
  isSelected?: boolean;
  onToggle?: (id: string) => void;
}

export function ConnectorBadge({ connector, isSelected = false, onToggle }: ConnectorBadgeProps) {
  const isConnected = connector.status === 'CONNECTED';

  return (
    <HStack
      px="3"
      py="2"
      borderRadius="lg"
      bg={isSelected ? 'teal.950' : 'bg.panel'}
      borderWidth="1px"
      borderColor={isSelected ? 'teal.500' : 'border.subtle'}
      cursor={onToggle ? 'pointer' : 'default'}
      onClick={() => onToggle?.(connector.id)}
      transition="all 0.2s"
    >
      <Badge colorPalette={isConnected ? 'green' : 'red'} variant="solid" size="xs" />
      <Text fontSize="xs" fontWeight="medium" color="fg">
        {connector.displayName}
      </Text>
      <Badge variant="subtle" size="xs">
        {connector.platformType}
      </Badge>
    </HStack>
  );
}
