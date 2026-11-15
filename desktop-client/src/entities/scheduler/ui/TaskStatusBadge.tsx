import { Badge } from '@/shared/ui';
import type React from 'react';
import type { TaskStatus } from '../model/types';

interface TaskStatusBadgeProps {
  status: TaskStatus;
}

export const TaskStatusBadge: React.FC<TaskStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'running':
      return (
        <Badge colorPalette="blue" variant="solid" size="xs" px="2.5" py="0.5" borderRadius="md">
          Running
        </Badge>
      );
    case 'success':
      return (
        <Badge colorPalette="green" variant="subtle" size="xs" px="2.5" py="0.5" borderRadius="md">
          Active (OK)
        </Badge>
      );
    case 'error':
      return (
        <Badge colorPalette="red" variant="solid" size="xs" px="2.5" py="0.5" borderRadius="md">
          Failed
        </Badge>
      );
    case 'paused':
      return (
        <Badge colorPalette="gray" variant="surface" size="xs" px="2.5" py="0.5" borderRadius="md">
          Paused
        </Badge>
      );
    case 'idle':
      return (
        <Badge colorPalette="teal" variant="subtle" size="xs" px="2.5" py="0.5" borderRadius="md">
          Idle (Scheduled)
        </Badge>
      );
    default:
      return (
        <Badge colorPalette="teal" variant="subtle" size="xs" px="2.5" py="0.5" borderRadius="md">
          Idle (Scheduled)
        </Badge>
      );
  }
};
