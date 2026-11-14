import {
  CreateTaskModal,
  TaskListTable,
  TaskLogsViewer,
  useSchedulerEngine,
} from '@/features/task-scheduler';
import { Badge, Box, Card, Flex, HStack, Heading, Text, VStack } from '@/shared/ui';
import { Activity, CalendarClock, Zap } from 'lucide-react';
import type React from 'react';

export const SchedulerPage: React.FC = () => {
  const {
    tasks,
    logs,
    triggerNow,
    toggleTask,
    removeTask,
    handleCreateTask,
    clearLogs,
    resetToDefaults,
  } = useSchedulerEngine();

  const enabledCount = tasks.filter((t) => t.enabled).length;
  const totalRuns = tasks.reduce((sum, t) => sum + t.runCount, 0);

  return (
    <Box p="6">
      <VStack align="stretch" gap="5">
        <Flex
          justify="space-between"
          align={{ base: 'flex-start', md: 'center' }}
          direction={{ base: 'column', md: 'row' }}
          gap="3"
        >
          <Box>
            <HStack gap="3" mb="2" align="center">
              <Heading size="2xl" color="fg">
                Desktop Task Scheduler
              </Heading>
              <Badge colorPalette="cyan" size="md" variant="subtle">
                Beta v0.2
              </Badge>
              <Badge colorPalette="teal" size="md" variant="subtle">
                Tauri Native Store
              </Badge>
            </HStack>
            <Text color="fg.muted" fontSize="md">
              Automated recurring desktop jobs, hardware health polling, and auditable execution
              timers.
            </Text>
          </Box>

          <CreateTaskModal onCreateTask={handleCreateTask} />
        </Flex>

        {/* Metric Summary Cards */}
        <HStack gap="4" wrap="wrap">
          <Card.Root
            p="4"
            bg="bg.panel"
            borderWidth="1px"
            borderColor="border.subtle"
            borderRadius="xl"
            flex="1"
            minW="160px"
          >
            <HStack justify="space-between">
              <VStack align="flex-start" gap="1">
                <Text fontSize="xs" color="fg.muted">
                  Active Schedules
                </Text>
                <Heading size="lg" color="fg">
                  {enabledCount} / {tasks.length}
                </Heading>
              </VStack>
              <CalendarClock size={24} color="#38bdf8" />
            </HStack>
          </Card.Root>

          <Card.Root
            p="4"
            bg="bg.panel"
            borderWidth="1px"
            borderColor="border.subtle"
            borderRadius="xl"
            flex="1"
            minW="160px"
          >
            <HStack justify="space-between">
              <VStack align="flex-start" gap="1">
                <Text fontSize="xs" color="fg.muted">
                  Total Cycles Run
                </Text>
                <Heading size="lg" color="fg">
                  {totalRuns}
                </Heading>
              </VStack>
              <Activity size={24} color="#22c55e" />
            </HStack>
          </Card.Root>

          <Card.Root
            p="4"
            bg="bg.panel"
            borderWidth="1px"
            borderColor="border.subtle"
            borderRadius="xl"
            flex="1"
            minW="160px"
          >
            <HStack justify="space-between">
              <VStack align="flex-start" gap="1">
                <Text fontSize="xs" color="fg.muted">
                  Scheduler Service
                </Text>
                <Badge colorPalette="green" variant="solid" size="sm">
                  Active (Tick Running)
                </Badge>
              </VStack>
              <Zap size={24} color="#a855f7" />
            </HStack>
          </Card.Root>
        </HStack>

        {/* Task List Table */}
        <TaskListTable
          tasks={tasks}
          onTriggerNow={triggerNow}
          onToggleTask={toggleTask}
          onRemoveTask={removeTask}
          onReset={resetToDefaults}
        />

        {/* Live Execution Logs */}
        <TaskLogsViewer logs={logs} onClearLogs={clearLogs} />
      </VStack>
    </Box>
  );
};
