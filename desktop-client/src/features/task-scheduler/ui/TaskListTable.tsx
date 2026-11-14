import { type ScheduledTask, TaskStatusBadge } from '@/entities/scheduler';
import { useSettingsStore } from '@/entities/settings';
import { Badge, Box, Button, Card, Flex, HStack, Heading, Text, VStack } from '@/shared/ui';
import { Clock, Pause, Play, RotateCcw, Trash2, Zap } from 'lucide-react';
import type React from 'react';
import { useTranslation } from 'react-i18next';

interface TaskListTableProps {
  tasks: ScheduledTask[];
  onTriggerNow: (taskId: string) => void;
  onToggleTask: (taskId: string) => void;
  onRemoveTask: (taskId: string) => void;
  onReset: () => void;
}

export const TaskListTable: React.FC<TaskListTableProps> = ({
  tasks,
  onTriggerNow,
  onToggleTask,
  onRemoveTask,
  onReset,
}) => {
  const { t } = useTranslation();
  const accentColor = useSettingsStore((state) => state.settings.accentColor);

  return (
    <Card.Root p="5" bg="bg.panel" borderWidth="1px" borderColor="border.subtle" borderRadius="xl">
      <Card.Header p="0" mb="4">
        <HStack justify="space-between" align="center">
          <HStack gap="2">
            <Clock size={18} color="#38bdf8" />
            <Heading size="sm" color="fg">
              Scheduled Routine Registry ({tasks.length})
            </Heading>
          </HStack>
          <Button size="xs" variant="ghost" colorPalette="red" onClick={onReset}>
            <RotateCcw size={14} />
            {t('common.resetDefaults')}
          </Button>
        </HStack>
      </Card.Header>

      <Card.Body p="0">
        <VStack align="stretch" gap="3">
          {tasks.map((task) => (
            <Box
              key={task.id}
              p="3.5"
              borderRadius="lg"
              bg="bg.canvas"
              borderWidth="1px"
              borderColor="border.subtle"
            >
              <Flex
                justify="space-between"
                align={{ base: 'flex-start', sm: 'center' }}
                direction={{ base: 'column', sm: 'row' }}
                gap="3"
              >
                <VStack align="flex-start" gap="1">
                  <HStack gap="2" wrap="wrap">
                    <Text fontWeight="semibold" fontSize="sm" color="fg">
                      {task.name}
                    </Text>
                    <TaskStatusBadge status={task.status} />
                    <Badge variant="surface" size="xs">
                      {task.type}
                    </Badge>
                  </HStack>
                  <HStack gap="3" fontSize="xs" color="fg.muted">
                    <Text>Interval: {task.intervalSec}s</Text>
                    <Text>•</Text>
                    <Text>Runs: {task.runCount}</Text>
                    {task.lastDurationMs !== null && (
                      <>
                        <Text>•</Text>
                        <Text>Latency: {task.lastDurationMs}ms</Text>
                      </>
                    )}
                  </HStack>
                </VStack>

                <HStack gap="2">
                  <Button
                    size="xs"
                    variant="solid"
                    colorPalette={accentColor}
                    onClick={() => onTriggerNow(task.id)}
                    title="Trigger Immediate Execution"
                  >
                    <Play size={12} />
                    Run Now
                  </Button>

                  <Button
                    size="xs"
                    variant={task.enabled ? 'outline' : 'subtle'}
                    colorPalette={task.enabled ? 'yellow' : 'gray'}
                    onClick={() => onToggleTask(task.id)}
                    title={task.enabled ? 'Pause Schedule' : 'Resume Schedule'}
                  >
                    {task.enabled ? (
                      <>
                        <Pause size={12} /> Pause
                      </>
                    ) : (
                      <>
                        <Zap size={12} /> Resume
                      </>
                    )}
                  </Button>

                  <Button
                    size="xs"
                    variant="ghost"
                    colorPalette="red"
                    onClick={() => onRemoveTask(task.id)}
                    title="Delete Task"
                  >
                    <Trash2 size={12} />
                  </Button>
                </HStack>
              </Flex>

              {task.lastResult && (
                <Box
                  mt="2"
                  p="2"
                  borderRadius="md"
                  bg="bg.panel"
                  fontSize="2xs"
                  fontFamily="mono"
                  color="fg.muted"
                  overflow="hidden"
                  textOverflow="ellipsis"
                  whiteSpace="nowrap"
                >
                  Last Result: {task.lastResult}
                </Box>
              )}
            </Box>
          ))}
        </VStack>
      </Card.Body>
    </Card.Root>
  );
};
