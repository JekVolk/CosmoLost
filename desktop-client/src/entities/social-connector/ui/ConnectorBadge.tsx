import { Badge, Button, Text } from '@chakra-ui/react';
import { Check } from 'lucide-react';
import type { ConnectorItem } from '../model/types';

interface ConnectorBadgeProps {
  connector: ConnectorItem;
  isSelected?: boolean;
  onToggle?: (id: string) => void;
}

export function ConnectorBadge({ connector, isSelected = false, onToggle }: ConnectorBadgeProps) {
  const isConnected = connector.status === 'CONNECTED' && connector.isActive;
  const isDisabled = !isConnected;
  const showSelection = isSelected && !isDisabled;

  return (
    <Button
      type="button"
      variant="plain"
      justifyContent="flex-start"
      h="auto"
      minH="0"
      px="3"
      py="2"
      borderRadius="lg"
      bg={isDisabled ? 'bg.subtle' : showSelection ? 'teal.900' : 'bg.panel'}
      borderWidth="1px"
      borderColor={isDisabled ? 'border.subtle' : showSelection ? 'teal.400' : 'border.default'}
      color={isDisabled ? 'fg.subtle' : 'fg'}
      cursor={onToggle && !isDisabled ? 'pointer' : 'not-allowed'}
      opacity={isDisabled ? 0.6 : 1}
      disabled={isDisabled}
      aria-pressed={isSelected}
      onClick={() => {
        if (!isDisabled) onToggle?.(connector.id);
      }}
      transition="all 0.2s"
    >
      <Badge
        colorPalette={showSelection ? 'teal' : isConnected ? 'green' : 'gray'}
        variant={showSelection ? 'solid' : 'subtle'}
        size="xs"
        px="2"
        py="0.5"
        borderRadius="full"
      >
        {showSelection ? (
          <Check size={12} aria-hidden="true" />
        ) : isConnected ? (
          'Готовий'
        ) : (
          'Недоступний'
        )}
      </Badge>
      <Text fontSize="xs" fontWeight="medium" color="inherit">
        {connector.displayName}
      </Text>
      <Badge
        variant="subtle"
        colorPalette={isDisabled ? 'gray' : 'teal'}
        size="xs"
        px="2"
        py="0.5"
        borderRadius="md"
      >
        {connector.platformType}
      </Badge>
    </Button>
  );
}
