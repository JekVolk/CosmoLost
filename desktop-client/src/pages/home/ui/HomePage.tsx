import { useArtifactsQuery } from '@/entities/artifact';
import {
  POPULAR_MAGNET_WORDS,
  downloadScriptMarkdownFile,
  usePublicationStore,
} from '@/entities/publication';
import { useSettingsStore } from '@/entities/settings';
import type { SmmRubricType } from '@/shared/api';
import { ROUTES } from '@/shared/config';
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  HStack,
  Heading,
  Input,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react';
import {
  Clapperboard,
  Clock,
  Copy,
  FileText,
  Film,
  Flame,
  FolderPlus,
  Sparkles,
  Trash2,
} from 'lucide-react';
import type React from 'react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RUBRIC_LABELS: Record<SmmRubricType, { label: string; color: string }> = {
  'last-sol-drama': { label: '🔴 Останній сол', color: 'red' },
  'tech-explain': { label: '⚙️ Як це працює', color: 'blue' },
  'dictionary-30s': { label: '🌌 Таємниці космосу', color: 'purple' },
  'crash-test': { label: '💥 Краш-тест', color: 'orange' },
  'build-in-public': { label: '🛠️ Build in Public', color: 'teal' },
  chronicles: { label: '🎬 Космічні Хроніки', color: 'yellow' },
};

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const accentColor = useSettingsStore((s) => s.settings.accentColor);
  const { data: artifacts = [] } = useArtifactsQuery();

  const projects = usePublicationStore((s) => s.projects);
  const createProject = usePublicationStore((s) => s.createProject);
  const openProject = usePublicationStore((s) => s.openProject);
  const deleteProject = usePublicationStore((s) => s.deleteProject);
  const duplicateProject = usePublicationStore((s) => s.duplicateProject);

  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // New Project Form State
  const [selectedArtifactId, setSelectedArtifactId] = useState(
    artifacts[0]?.id || 'opportunity-rover',
  );
  const [selectedRubric, setSelectedRubric] = useState<SmmRubricType>('last-sol-drama');
  const [selectionReason, setSelectionReason] = useState('');
  const [targetDuration, setTargetDuration] = useState(40);
  const [contentLanguage, setContentLanguage] = useState<'en' | 'uk' | 'dual'>('uk');
  const [selectedMagnetWord, setSelectedMagnetWord] = useState<string>('⚡ ШОК');
  const [isSeries, setIsSeries] = useState(false);
  const [seriesName, setSeriesName] = useState('Хроніки Загублених Апаратів');
  const [seriesPart, setSeriesPart] = useState(1);
  const [seriesTotalParts, setSeriesTotalParts] = useState(3);

  // Smart Next Topic Generator (REQ-FAC-13)
  const coveredArtifactIds = useMemo(() => new Set(projects.map((p) => p.artifactId)), [projects]);

  const smartSuggestion = useMemo(() => {
    const available = artifacts.find((a) => !coveredArtifactIds.has(a.id)) || artifacts[0];
    if (!available) {
      return {
        artifactId: 'perseverance-rover',
        artifactName: 'Perseverance Rover (Mars 2020)',
        hook: 'Цей марсохід знайшов на Марсі камінь, який спантеличив геологів NASA...',
        rubricId: 'tech-explain' as SmmRubricType,
        reason:
          'Унікальне відкриття органічних молекул та підготовка зразків для повернення на Землю.',
      };
    }
    return {
      artifactId: available.id,
      artifactName: available.name,
      hook: `Чому ${available.name} приховує одну з найбільш драматичних історій у дослідженні космосу?`,
      rubricId: 'last-sol-drama' as SmmRubricType,
      reason: `Свіжий контент про місію ${available.name}, що ще не висвітлювався у вашому каналі.`,
    };
  }, [artifacts, coveredArtifactIds]);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesStatus = filterStatus === 'ALL' || p.status === filterStatus;
      const matchesSearch =
        p.artifactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.selectionReason.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.seoCaption.line1Hook.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [projects, filterStatus, searchQuery]);

  const handleOpenProjectInEditor = (projectId: string) => {
    openProject(projectId);
    navigate(ROUTES.CONTENT_FACTORY);
  };

  const handleCreateAndOpen = () => {
    const art = artifacts.find((a) => a.id === selectedArtifactId);
    const created = createProject({
      artifactId: selectedArtifactId,
      artifactName: art ? art.name : 'NASA Space Artifact',
      rubricId: selectedRubric,
      selectionReason:
        selectionReason.trim() ||
        'Унікальне наукове відкриття та спадщина дослідження космосу NASA.',
      targetDurationSec: targetDuration,
      contentLanguage,
      magnetWord: selectedMagnetWord,
      seriesInfo:
        isSeries || selectedRubric === 'chronicles'
          ? {
              seriesName,
              partNumber: seriesPart,
              totalParts: seriesTotalParts,
            }
          : undefined,
    });
    setIsCreateOpen(false);
    openProject(created.id);
    navigate(ROUTES.CONTENT_FACTORY);
  };

  const handleApplySmartSuggestion = () => {
    const created = createProject({
      artifactId: smartSuggestion.artifactId,
      artifactName: smartSuggestion.artifactName,
      rubricId: smartSuggestion.rubricId,
      selectionReason: smartSuggestion.reason,
      targetDurationSec: 40,
      contentLanguage: 'uk',
      magnetWord: '⚡ ШОК',
      seriesInfo: {
        seriesName: 'Хроніки Загублених Апаратів',
        partNumber: 1,
        totalParts: 3,
      },
    });
    openProject(created.id);
    navigate(ROUTES.CONTENT_FACTORY);
  };

  return (
    <Box p="6">
      <VStack align="stretch" gap="6">
        {/* Header with Title and Primary New Project CTA */}
        <Flex justify="space-between" align="center" wrap="wrap" gap="4">
          <Box>
            <HStack gap="3" align="center" mb="1">
              <Heading size="2xl" color="fg">
                Студія Проєктів CosmoLost
              </Heading>
              <Badge
                colorPalette={accentColor}
                variant="solid"
                size="md"
                px="3"
                py="0.5"
                borderRadius="md"
              >
                Local-First Studio
              </Badge>
              <Badge
                colorPalette="purple"
                variant="subtle"
                size="md"
                px="3"
                py="0.5"
                borderRadius="md"
              >
                1080x1920 60FPS
              </Badge>
            </HStack>
            <Text color="fg.muted" fontSize="md">
              Створення та монтаж вірусних науково-популярних Shorts / Reels / TikTok за артефактами
              NASA.
            </Text>
          </Box>

          <HStack gap="3">
            <Button
              colorPalette={accentColor}
              size="lg"
              borderRadius="xl"
              onClick={() => setIsCreateOpen(true)}
              boxShadow="lg"
            >
              <FolderPlus size={18} />
              Створити новий проєкт
            </Button>
          </HStack>
        </Flex>

        {/* Smart Next Topic Banner (REQ-FAC-13 з бізнес-спеки FEAT-03) */}
        <Card.Root
          bg="bg.panel"
          borderWidth="1px"
          borderColor="yellow.500/40"
          borderRadius="xl"
          p="5"
          boxShadow="sm"
        >
          <Flex justify="space-between" align="center" wrap="wrap" gap="3">
            <HStack gap="3" align="flex-start" flex="1">
              <Box p="2.5" borderRadius="lg" bg="yellow.500/10" color="yellow.400">
                <Sparkles size={22} />
              </Box>
              <VStack align="stretch" gap="1">
                <HStack gap="2">
                  <Text fontSize="sm" fontWeight="bold" color="fg">
                    💡 Розумна тема наступного ролика (без повторів!):
                  </Text>
                  <Badge colorPalette="yellow" size="sm" px="2.5" py="0.5" borderRadius="md">
                    {smartSuggestion.artifactName}
                  </Badge>
                  <Badge
                    colorPalette="purple"
                    size="sm"
                    variant="subtle"
                    px="2.5"
                    py="0.5"
                    borderRadius="md"
                  >
                    ~40 сек
                  </Badge>
                </HStack>
                <Text fontSize="xs" color="fg.muted">
                  «{smartSuggestion.hook}»
                </Text>
                <Text fontSize="2xs" color="fg.subtle">
                  Причина вибору: {smartSuggestion.reason}
                </Text>
              </VStack>
            </HStack>

            <Button
              size="sm"
              colorPalette="yellow"
              variant="solid"
              onClick={handleApplySmartSuggestion}
            >
              <Sparkles size={14} />
              Створити ролик за цією темою
            </Button>
          </Flex>
        </Card.Root>

        {/* Filter and Search Bar */}
        <Flex justify="space-between" align="center" wrap="wrap" gap="3">
          <HStack gap="2" wrap="wrap">
            <Text fontSize="sm" fontWeight="semibold" color="fg.muted" mr="2">
              Фільтр:
            </Text>
            {[
              { id: 'ALL', label: 'Всі проєкти' },
              { id: 'DRAFT', label: 'Чернетки' },
              { id: 'READY', label: 'Готові до рендеру' },
              { id: 'PUBLISHED', label: 'Опубліковані' },
            ].map((tab) => (
              <Button
                key={tab.id}
                size="xs"
                variant={filterStatus === tab.id ? 'solid' : 'outline'}
                colorPalette={filterStatus === tab.id ? accentColor : 'gray'}
                onClick={() => setFilterStatus(tab.id)}
              >
                {tab.label}
              </Button>
            ))}
          </HStack>

          <HStack gap="2">
            <Input
              size="sm"
              width="240px"
              placeholder="Пошук проєкту..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </HStack>
        </Flex>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <Box p="10" textAlign="center" borderRadius="xl" bg="bg.panel" borderWidth="1px">
            <Text color="fg.muted" mb="3">
              Проєктів за обраним фільтром не знайдено.
            </Text>
            <Button
              size="sm"
              colorPalette={accentColor}
              onClick={() => {
                setFilterStatus('ALL');
                setSearchQuery('');
              }}
            >
              Показати всі
            </Button>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="5">
            {filteredProjects.map((project) => {
              const rubricInfo = RUBRIC_LABELS[project.rubricId] || RUBRIC_LABELS['last-sol-drama'];
              return (
                <Card.Root
                  key={project.id}
                  bg="bg.panel"
                  borderColor="border.subtle"
                  borderWidth="1px"
                  borderRadius="xl"
                  overflow="hidden"
                  boxShadow="md"
                  transition="all 0.2s ease"
                  _hover={{ borderColor: `${accentColor}.400`, transform: 'translateY(-2px)' }}
                >
                  <Card.Body p="4">
                    <VStack align="stretch" gap="3">
                      {/* Top Badges */}
                      <Flex justify="space-between" align="center">
                        <Badge
                          colorPalette={rubricInfo.color}
                          size="sm"
                          variant="subtle"
                          px="2.5"
                          py="0.5"
                          borderRadius="md"
                        >
                          {rubricInfo.label}
                        </Badge>
                        <HStack gap="1.5">
                          <Badge
                            colorPalette={
                              project.status === 'PUBLISHED'
                                ? 'green'
                                : project.status === 'READY'
                                  ? 'teal'
                                  : 'gray'
                            }
                            size="sm"
                            px="2.5"
                            py="0.5"
                            borderRadius="md"
                          >
                            {project.status}
                          </Badge>
                          <Badge
                            colorPalette="purple"
                            size="sm"
                            variant="outline"
                            px="2.5"
                            py="0.5"
                            borderRadius="md"
                          >
                            <Clock size={10} style={{ marginRight: '3px' }} />
                            {project.targetDurationSec}с
                          </Badge>
                        </HStack>
                      </Flex>

                      {/* Project Title & Artifact */}
                      <Box>
                        <Text fontWeight="bold" fontSize="md" color="fg" lineClamp={1}>
                          {project.artifactName}
                        </Text>
                        <HStack gap="1.5" mt="1" wrap="wrap">
                          {project.magnetWord && (
                            <Badge
                              size="xs"
                              colorPalette="yellow"
                              variant="solid"
                              px="2"
                              py="0.5"
                              borderRadius="md"
                            >
                              <Flame size={10} style={{ marginRight: '2px' }} />
                              {project.magnetWord}
                            </Badge>
                          )}
                          {project.seriesInfo && (
                            <Badge
                              size="xs"
                              colorPalette="purple"
                              variant="subtle"
                              px="2"
                              py="0.5"
                              borderRadius="md"
                            >
                              <Film size={10} style={{ marginRight: '2px' }} />
                              {project.seriesInfo.seriesName} • Ч.{project.seriesInfo.partNumber}/
                              {project.seriesInfo.totalParts}
                            </Badge>
                          )}
                        </HStack>
                        <Text fontSize="xs" color="fg.muted" mt="1" lineClamp={2}>
                          {project.seoCaption.line1Hook || project.selectionReason}
                        </Text>
                      </Box>

                      {/* Timeline & Slides Overview */}
                      <Box p="2.5" borderRadius="md" bg="bg.subtle" borderWidth="1px">
                        <HStack justify="space-between" mb="1">
                          <Text fontSize="2xs" color="fg.muted">
                            Слайди сценарію:
                          </Text>
                          <Text fontSize="2xs" fontWeight="bold" color="fg">
                            {project.slides?.length || 4} слайди (Хук + Наука + CTA)
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="2xs" color="fg.muted">
                            Мова озвучки:
                          </Text>
                          <Badge size="xs" colorPalette="blue" variant="subtle">
                            {project.contentLanguage?.toUpperCase() || 'UK'}
                          </Badge>
                        </HStack>
                      </Box>

                      {/* Action Buttons */}
                      <Flex justify="space-between" align="center" pt="2" gap="2">
                        <Button
                          size="sm"
                          colorPalette={accentColor}
                          flex="1"
                          onClick={() => handleOpenProjectInEditor(project.id)}
                        >
                          <Clapperboard size={14} />
                          Відкрити в Редакторі
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          colorPalette="teal"
                          onClick={() => downloadScriptMarkdownFile(project)}
                          title="Завантажити готовий .md файл сценарію"
                        >
                          <FileText size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          colorPalette="gray"
                          onClick={() => duplicateProject(project.id)}
                          title="Дублювати проєкт"
                        >
                          <Copy size={13} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          colorPalette="red"
                          onClick={() => deleteProject(project.id)}
                          title="Видалити"
                        >
                          <Trash2 size={13} />
                        </Button>
                      </Flex>
                    </VStack>
                  </Card.Body>
                </Card.Root>
              );
            })}
          </SimpleGrid>
        )}

        {/* Modal: Create New Project Wizard */}
        {isCreateOpen && (
          <Box
            position="fixed"
            top="0"
            left="0"
            right="0"
            bottom="0"
            bg="black/70"
            zIndex="1000"
            display="flex"
            alignItems="center"
            justifyContent="center"
            p="4"
          >
            <Card.Root
              bg="bg.panel"
              maxW="560px"
              w="100%"
              borderRadius="xl"
              borderWidth="1px"
              borderColor="border.subtle"
              boxShadow="2xl"
            >
              <Card.Header pb="2">
                <Flex justify="space-between" align="center">
                  <HStack gap="2">
                    <FolderPlus size={20} color="#38bdf8" />
                    <Heading size="md" color="fg">
                      Створити новий проєкт Shorts
                    </Heading>
                  </HStack>
                  <Button size="xs" variant="ghost" onClick={() => setIsCreateOpen(false)}>
                    ✕
                  </Button>
                </Flex>
                <Text color="fg.muted" fontSize="xs" mt="1">
                  Оберіть артефакт NASA, рубрику SMM та причину вибору для розумної генерації
                  сценарію.
                </Text>
              </Card.Header>

              <Card.Body pt="3">
                <VStack align="stretch" gap="4">
                  {/* Step 1: Select Artifact */}
                  <Box>
                    <Text fontSize="xs" fontWeight="semibold" color="fg.muted" mb="1">
                      1. Цільовий артефакт або місія NASA:
                    </Text>
                    <Flex wrap="wrap" gap="2">
                      {artifacts.map((art) => (
                        <Button
                          key={art.id}
                          size="xs"
                          variant={selectedArtifactId === art.id ? 'solid' : 'outline'}
                          colorPalette={selectedArtifactId === art.id ? accentColor : 'gray'}
                          onClick={() => setSelectedArtifactId(art.id)}
                        >
                          {art.name}
                        </Button>
                      ))}
                    </Flex>
                  </Box>

                  {/* Step 2: Select Rubric */}
                  <Box>
                    <Text fontSize="xs" fontWeight="semibold" color="fg.muted" mb="1">
                      2. SMM-рубрика (формат утримання уваги):
                    </Text>
                    <Flex wrap="wrap" gap="2">
                      {(Object.keys(RUBRIC_LABELS) as SmmRubricType[]).map((r) => {
                        const isSelected = selectedRubric === r;
                        return (
                          <Button
                            key={r}
                            size="xs"
                            variant={isSelected ? 'solid' : 'outline'}
                            colorPalette={isSelected ? RUBRIC_LABELS[r].color : 'gray'}
                            onClick={() => setSelectedRubric(r)}
                          >
                            {RUBRIC_LABELS[r].label}
                          </Button>
                        );
                      })}
                    </Flex>
                  </Box>

                  {/* Step 3: Selection Reason */}
                  <Box>
                    <Text fontSize="xs" fontWeight="semibold" color="fg.muted" mb="1">
                      3. Причина вибору даних (`selection_reason` з FEAT-03):
                    </Text>
                    <Input
                      size="sm"
                      placeholder="Наприклад: Річниця місії, фатальна пилова буря, паралель з Artemis..."
                      value={selectionReason}
                      onChange={(e) => setSelectionReason(e.target.value)}
                    />
                    <Text fontSize="2xs" color="fg.subtle" mt="1">
                      Використовується ШІ для побудови драматичного хука та уникнення повторів.
                    </Text>
                  </Box>

                  {/* Step 4: Word Magnet */}
                  <Box>
                    <HStack justify="space-between" mb="1">
                      <HStack gap="1.5">
                        <Flame size={14} color="#f59e0b" />
                        <Text fontSize="xs" fontWeight="semibold" color="fg.muted">
                          4. Слово-Магніт для 3-секундного Хука (ШІ-тригер):
                        </Text>
                      </HStack>
                      <Badge size="xs" colorPalette="yellow">
                        {selectedMagnetWord}
                      </Badge>
                    </HStack>
                    <Flex wrap="wrap" gap="1.5">
                      {POPULAR_MAGNET_WORDS.map((w) => (
                        <Button
                          key={w}
                          size="2xs"
                          variant={selectedMagnetWord === w ? 'solid' : 'outline'}
                          colorPalette={selectedMagnetWord === w ? 'yellow' : 'gray'}
                          onClick={() => setSelectedMagnetWord(w)}
                        >
                          {w}
                        </Button>
                      ))}
                    </Flex>
                  </Box>

                  {/* Step 5: Multi-part Series / Chronicles */}
                  <Box p="2.5" borderRadius="md" bg="bg.subtle" borderWidth="1px">
                    <Flex justify="space-between" align="center" mb="1.5">
                      <HStack gap="1.5">
                        <Film size={14} color="#a855f7" />
                        <Text fontSize="xs" fontWeight="semibold" color="fg">
                          Багаточастинні Хроніки (Серіал):
                        </Text>
                      </HStack>
                      <Button
                        size="2xs"
                        variant={isSeries || selectedRubric === 'chronicles' ? 'solid' : 'outline'}
                        colorPalette="purple"
                        onClick={() => setIsSeries(!isSeries)}
                      >
                        {isSeries || selectedRubric === 'chronicles'
                          ? '✓ Серіал'
                          : 'Окремий випуск'}
                      </Button>
                    </Flex>
                    {(isSeries || selectedRubric === 'chronicles') && (
                      <HStack gap="2" pt="1">
                        <Box flex="2">
                          <Input
                            size="xs"
                            placeholder="Назва серії (напр. Хроніки Марса)"
                            value={seriesName}
                            onChange={(e) => setSeriesName(e.target.value)}
                          />
                        </Box>
                        <Box flex="1">
                          <Input
                            size="xs"
                            type="number"
                            min={1}
                            max={seriesTotalParts}
                            value={seriesPart}
                            onChange={(e) => setSeriesPart(Number(e.target.value))}
                            placeholder="Частина"
                          />
                        </Box>
                        <Box flex="1">
                          <Input
                            size="xs"
                            type="number"
                            min={1}
                            value={seriesTotalParts}
                            onChange={(e) => setSeriesTotalParts(Number(e.target.value))}
                            placeholder="Всього"
                          />
                        </Box>
                      </HStack>
                    )}
                  </Box>

                  {/* Step 6: Language & Duration */}
                  <Flex gap="4">
                    <Box flex="1">
                      <Text fontSize="xs" fontWeight="semibold" color="fg.muted" mb="1">
                        Мова генерації:
                      </Text>
                      <HStack gap="2">
                        {[
                          { id: 'en', label: '🇬🇧 English' },
                          { id: 'uk', label: '🇺🇦 Українська' },
                          { id: 'dual', label: '🌐 Dual' },
                        ].map((l) => (
                          <Button
                            key={l.id}
                            size="xs"
                            variant={contentLanguage === l.id ? 'solid' : 'outline'}
                            colorPalette={contentLanguage === l.id ? 'blue' : 'gray'}
                            onClick={() => setContentLanguage(l.id as typeof contentLanguage)}
                          >
                            {l.label}
                          </Button>
                        ))}
                      </HStack>
                    </Box>

                    <Box flex="1">
                      <Text fontSize="xs" fontWeight="semibold" color="fg.muted" mb="1">
                        Хронометраж:
                      </Text>
                      <HStack gap="2">
                        {[30, 40, 50, 60].map((sec) => (
                          <Button
                            key={sec}
                            size="xs"
                            variant={targetDuration === sec ? 'solid' : 'outline'}
                            colorPalette={targetDuration === sec ? 'purple' : 'gray'}
                            onClick={() => setTargetDuration(sec)}
                          >
                            {sec}с {sec === 40 ? '★' : ''}
                          </Button>
                        ))}
                      </HStack>
                    </Box>
                  </Flex>

                  {/* Action Buttons */}
                  <Flex justify="flex-end" gap="3" pt="3">
                    <Button size="sm" variant="ghost" onClick={() => setIsCreateOpen(false)}>
                      Скасувати
                    </Button>
                    <Button size="sm" colorPalette={accentColor} onClick={handleCreateAndOpen}>
                      Створити та відкрити у Редакторі
                    </Button>
                  </Flex>
                </VStack>
              </Card.Body>
            </Card.Root>
          </Box>
        )}
      </VStack>
    </Box>
  );
};
