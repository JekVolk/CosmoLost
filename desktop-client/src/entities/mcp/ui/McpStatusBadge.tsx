import { Badge } from '@/shared/ui';
import type React from 'react';
import type { McpStatus } from '../model/schema';

interface McpStatusBadgeProps {
  status: McpStatus;
}

export const McpStatusBadge: React.FC<McpStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'connected':
      return (
        <Badge colorPalette="green" variant="solid" size="xs" px="2.5" py="0.5" borderRadius="md">
          Connected
        </Badge>
      );
    case 'connecting':
      return (
        <Badge colorPalette="yellow" variant="subtle" size="xs" px="2.5" py="0.5" borderRadius="md">
          Connecting
        </Badge>
      );
    case 'error':
      return (
        <Badge colorPalette="red" variant="solid" size="xs" px="2.5" py="0.5" borderRadius="md">
          Error
        </Badge>
      );
    case 'disconnected':
      return (
        <Badge colorPalette="gray" variant="surface" size="xs" px="2.5" py="0.5" borderRadius="md">
          Offline
        </Badge>
      );
    default:
      return (
        <Badge colorPalette="gray" variant="surface" size="xs" px="2.5" py="0.5" borderRadius="md">
          Offline
        </Badge>
      );
  }
};
