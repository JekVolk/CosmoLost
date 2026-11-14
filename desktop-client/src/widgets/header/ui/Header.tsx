import { WindowControls } from '@/features/window-controls';
import { Flex, HStack, Text } from '@/shared/ui';
import { Rocket } from 'lucide-react';
import type React from 'react';

export const Header: React.FC = () => {
  return (
    <Flex
      as="header"
      align="center"
      justify="space-between"
      height="38px"
      bg="bg.panel"
      borderBottomWidth="1px"
      borderColor="border.subtle"
      userSelect="none"
      cursor="default"
    >
      {/* Draggable Title Area */}
      <Flex flex="1" height="100%" align="center" px="4" data-tauri-drag-region>
        <HStack gap="2" pointerEvents="none">
          <Rocket size={15} color="#38bdf8" />
          <Text fontSize="xs" fontWeight="bold" letterSpacing="wider" color="fg">
            COSMOLOST DESKTOP
          </Text>
        </HStack>
      </Flex>

      {/* Non-draggable Window Controls */}
      <Flex align="center" px="2" height="100%">
        <WindowControls />
      </Flex>
    </Flex>
  );
};
