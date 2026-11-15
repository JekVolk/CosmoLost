import { usePublicationStore } from '@/entities/publication';
import { useConnectorStore } from '@/entities/social-connector';
import { useSocialPublishing } from '@/features/social-publishing';
import {
  CreateTaskModal,
  TaskListTable,
  TaskLogsViewer,
  useSchedulerEngine,
} from '@/features/task-scheduler';
import { ROUTES } from '@/shared/config';
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  HStack,
  Heading,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react';
import {
  Activity,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Clock,
  Layers,
  PlusCircle,
  Rocket,
  Send,
  Share2,
  Trash2,
  Zap,
} from 'lucide-react';
import type React from 'react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const SchedulerPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'publishing' | 'system'>('publishing');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduledProjectId, setScheduledProjectId] = useState<string>('');
  const [selectedDelaySec, setSelectedDelaySec] = useState<number>(3600);
  const [scheduleFeedback, setScheduleFeedback] = useState<string | null>(null);

  // Scheduler Engine (system routines)
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

  // Publication Store (publishing queue & projects)
  const projects = usePublicationStore((s) => s.projects);
  const batchQueue = usePublicationStore((s) => s.batchQueue);
  const updateBatchQueue = usePublicationStore((s) => s.updateBatchQueue);
  const clearBatchQueue = usePublicationStore((s) => s.clearBatchQueue);
  const openProject = usePublicationStore((s) => s.openProject);
  const updateStatus = usePublicationStore((s) => s.updateStatus);

  // Social Publishing
  const { connectors } = useConnectorStore();
  const { autoPublishAll, isPublishing } = useSocialPublishing();

  const enabledCount = tasks.filter((t) => t.enabled).length;
  const totalRuns = tasks.reduce((sum, t) => sum + t.runCount, 0);

  const readyProjects = useMemo(() => {
    return projects.filter(
      (p) => p.status === 'READY' || p.status === 'RENDERED' || p.status === 'DRAFT',
    );
  }, [projects]);

  const publicationTasks = useMemo(() => {
    return tasks.filter((t) => t.name.startsWith('[Публікація]') || t.name.startsWith('[Post]'));
  }, [tasks]);

  const handleOpenInEditor = (projectId: string) => {
    openProject(projectId);
    navigate(ROUTES.CONTENT_FACTORY);
  };

  const handleAdvanceBatch = () => {
    if (!batchQueue) return;
    const nextCompleted = Math.min(batchQueue.completedCount + 1, batchQueue.totalCount);
    updateBatchQueue({
      completedCount: nextCompleted,
      status: nextCompleted >= batchQueue.totalCount ? 'COMPLETED' : 'IN_PROGRESS',
    });
  };

  const handleScheduleDelayedPost = () => {
    const targetProject = projects.find(
      (p) => p.id === (scheduledProjectId || readyProjects[0]?.id),
    );
    if (!targetProject) return;

    const delayMinutes = Math.round(selectedDelaySec / 60);
    const taskName = `[Публікація] ${targetProject.artifactName} (${delayMinutes}хв)`;

    handleCreateTask(taskName, 'custom', selectedDelaySec);

    // Update project status to READY if it was draft
    if (targetProject.status === 'DRAFT') {
      openProject(targetProject.id);
      updateStatus('READY');
    }

    setScheduleFeedback(
      `✅ Проєкт "${targetProject.artifactName}" додано до черги автопублікації (інтервал/затримка: ${delayMinutes}хв)!`,
    );
    setIsScheduleModalOpen(false);
    setTimeout(() => setScheduleFeedback(null), 5000);
  };

  return (
    <Box p="6">
      <VStack align="stretch" gap="5">
        {/* Page Header */}
        <Flex
          justify="space-between"
          align={{ base: 'flex-start', md: 'center' }}
          direction={{ base: 'column', md: 'row' }}
          gap="3"
        >
          <Box>
            <HStack gap="3" mb="2" align="center">
              <Heading size="2xl" color="fg">
                Desktop Scheduler & Publication Queue
              </Heading>
              <Badge colorPalette="cyan" size="md" variant="subtle">
                v2.1 FSD
              </Badge>
              <Badge colorPalette="teal" size="md" variant="subtle">
                Tauri Native Store
              </Badge>
            </HStack>
            <Text color="fg.muted" fontSize="md">
              Управління чергою пакетної публікації Shorts / Reels, відкладеними релізами та
              системними фоновими задачами.
            </Text>
          </Box>

          <HStack gap="2">
            <Button
              size="sm"
              variant={activeTab === 'publishing' ? 'solid' : 'outline'}
              colorPalette="purple"
              onClick={() => setActiveTab('publishing')}
            >
              <Rocket size={15} />
              Черга публікацій ({readyProjects.length})
            </Button>
            <Button
              size="sm"
              variant={activeTab === 'system' ? 'solid' : 'outline'}
              colorPalette="teal"
              onClick={() => setActiveTab('system')}
            >
              <Zap size={15} />
              Системні задачі ({tasks.length})
            </Button>
          </HStack>
        </Flex>

        {scheduleFeedback && (
          <Box p="3" borderRadius="lg" bg="green.950/40" borderWidth="1px" borderColor="green.700">
            <HStack gap="2">
              <CheckCircle2 size={16} color="#22c55e" />
              <Text fontSize="sm" color="green.300">
                {scheduleFeedback}
              </Text>
            </HStack>
          </Box>
        )}

        {/* Metric Summary Cards */}
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="4">
          <Card.Root
            p="4"
            bg="bg.panel"
            borderWidth="1px"
            borderColor="border.subtle"
            borderRadius="xl"
          >
            <HStack justify="space-between">
              <VStack align="flex-start" gap="1">
                <Text fontSize="xs" color="fg.muted">
                  Активні розклади
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
          >
            <HStack justify="space-between">
              <VStack align="flex-start" gap="1">
                <Text fontSize="xs" color="fg.muted">
                  Пакетна черга генерації
                </Text>
                <Heading size="lg" color="fg">
                  {batchQueue ? `${batchQueue.completedCount}/${batchQueue.totalCount}` : 'Вільна'}
                </Heading>
              </VStack>
              <Layers size={24} color="#eab308" />
            </HStack>
          </Card.Root>

          <Card.Root
            p="4"
            bg="bg.panel"
            borderWidth="1px"
            borderColor="border.subtle"
            borderRadius="xl"
          >
            <HStack justify="space-between">
              <VStack align="flex-start" gap="1">
                <Text fontSize="xs" color="fg.muted">
                  Готові до відкладеного релізу
                </Text>
                <Heading size="lg" color="fg">
                  {readyProjects.length} проєктів
                </Heading>
              </VStack>
              <Share2 size={24} color="#a855f7" />
            </HStack>
          </Card.Root>

          <Card.Root
            p="4"
            bg="bg.panel"
            borderWidth="1px"
            borderColor="border.subtle"
            borderRadius="xl"
          >
            <HStack justify="space-between">
              <VStack align="flex-start" gap="1">
                <Text fontSize="xs" color="fg.muted">
                  Виконано циклів задач
                </Text>
                <Heading size="lg" color="fg">
                  {totalRuns}
                </Heading>
              </VStack>
              <Activity size={24} color="#22c55e" />
            </HStack>
          </Card.Root>
        </SimpleGrid>

        {activeTab === 'publishing' ? (
          <VStack align="stretch" gap="5">
            {/* Batch Generation Queue Card */}
            <Card.Root
              p="5"
              bg="bg.panel"
              borderWidth="1px"
              borderColor="border.subtle"
              borderRadius="xl"
            >
              <Card.Header p="0" mb="3">
                <Flex justify="space-between" align="center" wrap="wrap" gap="2">
                  <HStack gap="2">
                    <Layers size={18} color="#eab308" />
                    <Heading size="sm" color="fg">
                      Пакетна черга генерації роликів (Batch Queue)
                    </Heading>
                  </HStack>
                  {batchQueue && (
                    <HStack gap="2">
                      <Badge
                        colorPalette={
                          batchQueue.status === 'COMPLETED'
                            ? 'green'
                            : batchQueue.status === 'IN_PROGRESS'
                              ? 'yellow'
                              : 'blue'
                        }
                        size="sm"
                      >
                        {batchQueue.status}
                      </Badge>
                      <Button
                        size="xs"
                        variant="outline"
                        colorPalette="gray"
                        onClick={clearBatchQueue}
                      >
                        <Trash2 size={12} />
                        Очистити чергу
                      </Button>
                    </HStack>
                  )}
                </Flex>
              </Card.Header>
              <Card.Body p="0">
                {batchQueue ? (
                  <VStack align="stretch" gap="3">
                    <Flex justify="space-between" align="center">
                      <Text fontSize="sm" color="fg.muted">
                        Прогрес обробки пакету: {batchQueue.completedCount} з{' '}
                        {batchQueue.totalCount} роликів завершено
                      </Text>
                      <Text fontSize="xs" fontWeight="bold" color="fg">
                        {Math.round(
                          (batchQueue.completedCount / Math.max(1, batchQueue.totalCount)) * 100,
                        )}
                        %
                      </Text>
                    </Flex>
                    <Box w="100%" h="8px" bg="bg.subtle" borderRadius="full" overflow="hidden">
                      <Box
                        h="100%"
                        bg="yellow.400"
                        w={`${(batchQueue.completedCount / Math.max(1, batchQueue.totalCount)) * 100}%`}
                        transition="width 0.3s ease"
                      />
                    </Box>
                    <HStack justify="space-between" pt="1">
                      <Text fontSize="2xs" color="fg.subtle">
                        ID черги: {batchQueue.id} • Створено:{' '}
                        {new Date(batchQueue.createdAt).toLocaleTimeString()}
                      </Text>
                      <Button size="xs" colorPalette="yellow" onClick={handleAdvanceBatch}>
                        <Zap size={12} />
                        Обробити наступний крок
                      </Button>
                    </HStack>
                  </VStack>
                ) : (
                  <Box p="4" textAlign="center" borderRadius="lg" bg="bg.subtle" borderWidth="1px">
                    <Text fontSize="sm" color="fg.muted" mb="2">
                      Пакетна черга зараз порожня. Ви можете запустити автоматичну пакетну генерацію
                      одразу для 3-5 артефактів.
                    </Text>
                    <Button
                      size="xs"
                      colorPalette="yellow"
                      variant="outline"
                      onClick={() => navigate(ROUTES.CONTENT_FACTORY)}
                    >
                      Перейти у Фабрику Контенту
                      <ArrowRight size={12} />
                    </Button>
                  </Box>
                )}
              </Card.Body>
            </Card.Root>

            {/* Scheduled Delayed Publications Card */}
            <Card.Root
              p="5"
              bg="bg.panel"
              borderWidth="1px"
              borderColor="border.subtle"
              borderRadius="xl"
            >
              <Card.Header p="0" mb="4">
                <Flex justify="space-between" align="center" wrap="wrap" gap="2">
                  <HStack gap="2">
                    <Clock size={18} color="#a855f7" />
                    <Heading size="sm" color="fg">
                      Відкладені публікації та готові випуски ({readyProjects.length})
                    </Heading>
                  </HStack>
                  <Button
                    size="sm"
                    colorPalette="purple"
                    onClick={() => setIsScheduleModalOpen(!isScheduleModalOpen)}
                  >
                    <PlusCircle size={15} />
                    Запланувати відкладену публікацію
                  </Button>
                </Flex>
              </Card.Header>

              {/* Inline Schedule Creator Drawer / Modal */}
              {isScheduleModalOpen && (
                <Box
                  p="4"
                  mb="4"
                  borderRadius="lg"
                  bg="bg.canvas"
                  borderWidth="1px"
                  borderColor="purple.500/40"
                >
                  <VStack align="stretch" gap="3">
                    <Heading size="xs" color="fg">
                      Налаштування відкладеного автопостингу:
                    </Heading>

                    <Box>
                      <Text fontSize="xs" color="fg.muted" mb="1">
                        1. Оберіть ролик для публікації:
                      </Text>
                      <Flex wrap="wrap" gap="2">
                        {readyProjects.map((p) => {
                          const isSel = (scheduledProjectId || readyProjects[0]?.id) === p.id;
                          return (
                            <Button
                              key={p.id}
                              size="xs"
                              variant={isSel ? 'solid' : 'outline'}
                              colorPalette={isSel ? 'purple' : 'gray'}
                              onClick={() => setScheduledProjectId(p.id)}
                            >
                              {p.artifactName} ({p.status})
                            </Button>
                          );
                        })}
                      </Flex>
                    </Box>

                    <Box>
                      <Text fontSize="xs" color="fg.muted" mb="1">
                        2. Тайм-слот відкладеного випуску:
                      </Text>
                      <HStack gap="2" wrap="wrap">
                        {[
                          { sec: 900, label: '15 хв (Терміновий)' },
                          { sec: 3600, label: '1 год (Прайм-тайм)' },
                          { sec: 14400, label: '4 год (Вечірній пік 19:00)' },
                          { sec: 86400, label: '24 год (Завтра)' },
                        ].map((opt) => (
                          <Button
                            key={opt.sec}
                            size="xs"
                            variant={selectedDelaySec === opt.sec ? 'solid' : 'outline'}
                            colorPalette={selectedDelaySec === opt.sec ? 'purple' : 'gray'}
                            onClick={() => setSelectedDelaySec(opt.sec)}
                          >
                            {opt.label}
                          </Button>
                        ))}
                      </HStack>
                    </Box>

                    <Box>
                      <Text fontSize="xs" color="fg.muted" mb="1">
                        3. Підключені канали дистрибуції:
                      </Text>
                      <HStack gap="2" wrap="wrap">
                        {connectors.map((c) => (
                          <Badge
                            key={c.id}
                            size="xs"
                            colorPalette={c.isActive ? 'green' : 'gray'}
                            variant="subtle"
                          >
                            {c.displayName}
                          </Badge>
                        ))}
                      </HStack>
                    </Box>

                    <HStack justify="flex-end" gap="2" pt="2">
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => setIsScheduleModalOpen(false)}
                      >
                        Скасувати
                      </Button>
                      <Button size="xs" colorPalette="purple" onClick={handleScheduleDelayedPost}>
                        <CheckCircle2 size={13} />
                        Підтвердити та додати до планувальника
                      </Button>
                    </HStack>
                  </VStack>
                </Box>
              )}

              <Card.Body p="0">
                {readyProjects.length === 0 ? (
                  <Text fontSize="sm" color="fg.muted">
                    Немає готових проєктів для публікації. Створіть новий ролик на сторінці Проєкти.
                  </Text>
                ) : (
                  <VStack align="stretch" gap="3">
                    {readyProjects.map((p) => {
                      const isPostScheduled = publicationTasks.some((t) =>
                        t.name.includes(p.artifactName),
                      );
                      return (
                        <Box
                          key={p.id}
                          p="3.5"
                          borderRadius="lg"
                          bg="bg.canvas"
                          borderWidth="1px"
                          borderColor="border.subtle"
                        >
                          <Flex justify="space-between" align="center" wrap="wrap" gap="2">
                            <VStack align="flex-start" gap="1">
                              <HStack gap="2">
                                <Text fontWeight="bold" fontSize="sm" color="fg">
                                  {p.artifactName}
                                </Text>
                                <Badge
                                  size="xs"
                                  colorPalette={
                                    p.status === 'READY'
                                      ? 'teal'
                                      : p.status === 'RENDERED'
                                        ? 'purple'
                                        : 'gray'
                                  }
                                >
                                  {p.status}
                                </Badge>
                                {isPostScheduled && (
                                  <Badge size="xs" colorPalette="green" variant="solid">
                                    <Clock size={10} style={{ marginRight: '3px' }} />
                                    Заплановано в черзі
                                  </Badge>
                                )}
                              </HStack>
                              <Text fontSize="xs" color="fg.muted" lineClamp={1}>
                                {p.seoCaption.line1Hook || p.selectionReason}
                              </Text>
                            </VStack>

                            <HStack gap="2">
                              <Button
                                size="xs"
                                variant="outline"
                                colorPalette="teal"
                                onClick={() => handleOpenInEditor(p.id)}
                              >
                                Відкрити у Фабриці
                              </Button>
                              <Button
                                size="xs"
                                colorPalette="purple"
                                onClick={() => {
                                  openProject(p.id);
                                  autoPublishAll();
                                }}
                                loading={isPublishing}
                              >
                                <Send size={12} />
                                Опублікувати зараз
                              </Button>
                            </HStack>
                          </Flex>
                        </Box>
                      );
                    })}
                  </VStack>
                )}
              </Card.Body>
            </Card.Root>
          </VStack>
        ) : (
          <VStack align="stretch" gap="5">
            <Flex justify="flex-end">
              <CreateTaskModal onCreateTask={handleCreateTask} />
            </Flex>

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
        )}
      </VStack>
    </Box>
  );
};
