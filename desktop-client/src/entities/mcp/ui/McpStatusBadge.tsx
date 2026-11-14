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
        <Badge colorPalette="green" variant="solid" size="xs">
          Connected
        </Badge>
      );
    case 'connecting':
      return (
        <Badge colorPalette="yellow" variant="subtle" size="xs">
          Connecting
        </Badge>
      );
    case 'error':
      return (
        <Badge colorPalette="red" variant="solid" size="xs">
          Error
        </Badge>
      );
    case 'disconnected':
      return (
        <Badge colorPalette="gray" variant="surface" size="xs">
          Offline
        </Badge>
      );
    default:
      return (
        <Badge colorPalette="gray" variant="surface" size="xs">
          Offline
        </Badge>
      );
  }
};
