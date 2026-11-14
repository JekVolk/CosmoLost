import { HStack, IconButton } from '@/shared/ui';
import { Copy, Minus, Square, X } from 'lucide-react';
import type React from 'react';
import { useWindowControls } from '../model/use-window-controls';

export const WindowControls: React.FC = () => {
  const { isMaximized, minimize, toggleMaximize, close } = useWindowControls();

  return (
    <HStack gap="1" data-tauri-no-drag>
      <IconButton
        aria-label="Minimize"
        size="xs"
        variant="ghost"
        color="fg.muted"
        data-tauri-no-drag
        onClick={(e) => {
          e.stopPropagation();
          void minimize();
        }}
        _hover={{ bg: 'whiteAlpha.200', color: 'fg' }}
      >
        <Minus size={13} />
      </IconButton>
      <IconButton
        aria-label={isMaximized ? 'Restore' : 'Maximize'}
        size="xs"
        variant="ghost"
        color="fg.muted"
        data-tauri-no-drag
        onClick={(e) => {
          e.stopPropagation();
          void toggleMaximize();
        }}
        _hover={{ bg: 'whiteAlpha.200', color: 'fg' }}
      >
        {isMaximized ? <Copy size={12} /> : <Square size={12} />}
      </IconButton>
      <IconButton
        aria-label="Close"
        size="xs"
        variant="ghost"
        color="fg.muted"
        data-tauri-no-drag
        onClick={(e) => {
          e.stopPropagation();
          void close();
        }}
        _hover={{ bg: 'red.600', color: 'white' }}
      >
        <X size={14} />
      </IconButton>
    </HStack>
  );
};
