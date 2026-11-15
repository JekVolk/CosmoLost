import { usePublicationStore } from '@/entities/publication';
import { Badge, Button, HStack, Text } from '@chakra-ui/react';
import { Gamepad2 } from 'lucide-react';
import type React from 'react';
import { useGameplayStore } from '../model/use-gameplay-store';

interface GameplayBrollQuickButtonProps {
  size?: 'xs' | 'sm' | 'md';
  variant?: 'solid' | 'outline' | 'subtle';
}

export const GameplayBrollQuickButton: React.FC<GameplayBrollQuickButtonProps> = ({
  size = 'sm',
  variant = 'outline',
}) => {
  const openModal = useGameplayStore((s) => s.openModal);
  const currentProject = usePublicationStore((s) => s.currentProject);

  const hasBrollAttached = Boolean(currentProject?.brollVideoUrl);

  return (
    <Button
      size={size}
      variant={variant}
      colorPalette={hasBrollAttached ? 'teal' : 'purple'}
      onClick={openModal}
      title="Відкрити генератор процедурного геймплею (Moon/Mars Parkour)"
    >
      <Gamepad2 size={16} />
      <HStack gap="2">
        <Text>{hasBrollAttached ? 'B-Roll прикріплено' : '🎮 Геймплейний B-Roll (Moon/Mars)'}</Text>
        {hasBrollAttached && (
          <Badge colorPalette="teal" size="xs" variant="solid" px="2" py="0.5" borderRadius="md">
            {currentProject?.brollPreset?.replace('_', ' ') || 'ACTIVE'}
          </Badge>
        )}
      </HStack>
    </Button>
  );
};
