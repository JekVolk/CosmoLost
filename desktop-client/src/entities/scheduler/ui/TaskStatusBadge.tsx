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
        <Badge colorPalette="blue" variant="solid" size="xs">
          Running
        </Badge>
      );
    case 'success':
      return (
        <Badge colorPalette="green" variant="subtle" size="xs">
          Active (OK)
        </Badge>
      );
    case 'error':
      return (
        <Badge colorPalette="red" variant="solid" size="xs">
          Failed
        </Badge>
      );
    case 'paused':
      return (
        <Badge colorPalette="gray" variant="surface" size="xs">
          Paused
        </Badge>
      );
    case 'idle':
      return (
        <Badge colorPalette="teal" variant="subtle" size="xs">
          Idle (Scheduled)
        </Badge>
      );
    default:
      return (
        <Badge colorPalette="teal" variant="subtle" size="xs">
          Idle (Scheduled)
        </Badge>
      );
  }
};
