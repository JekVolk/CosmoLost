import { useArtifactStore, useArtifactsQuery } from '@/entities/artifact';
import { usePublicationStore } from '@/entities/publication';
import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Heading,
  Portal,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react';
import { Check, Flame, MessageSquare, Network, Sparkles, X } from 'lucide-react';
import type React from 'react';
import { useEffect } from 'react';
import { useSelectedTopic, useSmartNextTopicStore } from '../model/use-smart-next-topic-store';

export const SmartNextTopicDialog: React.FC = () => {
  const { isOpen, closeModal, candidates, selectedTopicId, selectTopic } = useSmartNextTopicStore();
  const selectedTopic = useSelectedTopic();

  const { data: artifacts = [] } = useArtifactsQuery();
  const selectArtifact = useArtifactStore((s) => s.selectArtifact);
  const currentProject = usePublicationStore((s) => s.currentProject);
  const setCurrentProject = usePublicationStore((s) => s.setCurrentProject);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeModal]);

  if (!isOpen) return null;

  const currentPartNumber = currentProject?.seriesInfo?.partNumber || 1;
  const nextPartNumber = currentPartNumber + 1;
  const totalParts = Math.max(currentProject?.seriesInfo?.totalParts || 3, nextPartNumber);
  const seriesName =
    currentProject?.seriesInfo?.seriesName ||
    `Хроніки ${currentProject?.artifactName || 'Артефактів'}`;

  const handleApply = () => {
    // Attempt matching artifact in artifacts store
    const matchedArtifact = artifacts.find(
      (a) =>
        a.name.toLowerCase().includes(selectedTopic.name.toLowerCase()) ||
        selectedTopic.name.toLowerCase().includes(a.name.toLowerCase()),
    );

    if (matchedArtifact) {
      selectArtifact(matchedArtifact);
    }

    if (currentProject) {
      setCurrentProject({
        ...currentProject,
        artifactName: selectedTopic.name,
        pinComment: selectedTopic.pinQuestion,
        seriesInfo: {
          seriesName,
          partNumber: nextPartNumber,
          totalParts,
          cliffhanger: selectedTopic.threeSecHook,
        },
        selectionReason: `Серійне продовження теми (${seriesName}, Ч.${nextPartNumber}): ${selectedTopic.narrativeBridge}`,
        seoCaption: {
          ...currentProject.seoCaption,
          line1Hook: selectedTopic.threeSecHook,
          line2Seo: selectedTopic.narrativeBridge,
        },
      });
    }

    closeModal();
  };

  return (
    <Portal>
      <Box
        position="fixed"
        inset="0"
        bg="blackAlpha.800"
        backdropFilter="blur(12px)"
        zIndex="1500"
        display="flex"
        alignItems="center"
        justifyContent="center"
        p="4"
        overflowY="auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) closeModal();
        }}
      >
        <Box
          aria-modal="true"
          aria-labelledby="smart-next-topic-title"
          bg="bg.panel"
          borderRadius="2xl"
          borderWidth="1px"
          borderColor="border.default"
          width="100%"
          maxWidth="920px"
          maxHeight="92vh"
          overflowY="auto"
          boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.7)"
          display="flex"
          flexDirection="column"
        >
          {/* Header */}
          <Box
            p="5"
            borderBottomWidth="1px"
            borderColor="border.subtle"
            bg="bg.surface"
            position="sticky"
            top="0"
            zIndex="10"
          >
            <Flex justify="space-between" align="center" wrap="wrap" gap="2">
              <VStack align="flex-start" gap="1">
                <HStack gap="2">
                  <Badge
                    size="xs"
                    colorPalette="cyan"
                    variant="solid"
                    px="2"
                    py="0.5"
                    borderRadius="md"
                  >
                    CONTINUITY ENGINE
                  </Badge>
                  <Text fontSize="3xs" color="fg.muted" letterSpacing="wider">
                    SMART NEXT TOPIC V2
                  </Text>
                </HStack>
                <Heading id="smart-next-topic-title" size="md" color="fg">
                  Smart Next Topic & Narrative Bridge
                </Heading>
                <Text fontSize="xs" color="fg.muted">
                  Генерація наступної теми для короткого відео з сюжетним містком до попереднього
                  артефакту.
                </Text>
              </VStack>

              <Button
                size="xs"
                variant="ghost"
                colorPalette="gray"
                onClick={closeModal}
                title="Закрити діалог"
                aria-label="Закрити діалог"
              >
                <X size={16} />
              </Button>
            </Flex>
          </Box>

          {/* Body */}
          <Box p="6" display="flex" flexDirection="column" gap="5">
            {/* Section 1: Artifact Selection */}
            <Box>
              <Text fontWeight="bold" fontSize="sm" color="fg" mb="2.5">
                1. Оберіть цільовий артефакт для наступного випуску:
              </Text>
              <SimpleGrid columns={{ base: 1, md: 3 }} gap="3">
                {candidates.map((cand) => {
                  const isSelected = cand.id === selectedTopicId;
                  const isMoon = cand.celestialBody === 'moon';
                  return (
                    <Box
                      key={cand.id}
                      tabIndex={0}
                      aria-label={`Обрати тему: ${cand.name} (${cand.site})`}
                      aria-pressed={isSelected}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          selectTopic(cand.id);
                        }
                      }}
                      bg="bg.surface"
                      borderRadius="xl"
                      borderWidth={isSelected ? '2px' : '1px'}
                      borderColor={
                        isSelected ? (isMoon ? 'cyan.400' : 'orange.400') : 'border.subtle'
                      }
                      p="3.5"
                      cursor="pointer"
                      onClick={() => selectTopic(cand.id)}
                      transition="all 0.15s ease"
                      _hover={{ borderColor: isMoon ? 'cyan.400' : 'orange.400' }}
                    >
                      <HStack justify="space-between" align="center" mb="1.5">
                        <Badge
                          size="xs"
                          variant="surface"
                          colorPalette={isMoon ? 'cyan' : 'orange'}
                        >
                          {isMoon ? 'Місяць 🌙' : 'Марс 🔴'}
                        </Badge>
                        {cand.isRecommended && (
                          <Badge size="xs" variant="solid" colorPalette="green">
                            RECOMMENDED
                          </Badge>
                        )}
                      </HStack>

                      <Text fontWeight="bold" fontSize="sm" color="fg">
                        {cand.name}
                      </Text>

                      <Text fontSize="3xs" color="fg.muted" mt="1">
                        Локація: {cand.site}
                      </Text>
                      <Text fontSize="3xs" color="fg.muted">
                        Статус: {cand.status}
                      </Text>

                      <Box mt="2.5" pt="2" borderTopWidth="1px" borderColor="border.subtle">
                        <Text fontSize="3xs" fontWeight="semibold" color="fg">
                          Зв'язок: {cand.connectionType}
                        </Text>
                      </Box>
                    </Box>
                  );
                })}
              </SimpleGrid>
            </Box>

            {/* Section 2: Narrative Bridge */}
            <Box
              bg="bg.surface"
              p="4"
              borderRadius="xl"
              borderWidth="1px"
              borderColor="border.subtle"
            >
              <HStack gap="2" mb="2">
                <Network size={16} color="var(--chakra-colors-cyan-400)" />
                <Text fontWeight="bold" fontSize="sm" color="fg">
                  2. Сюжетний місток (Narrative Bridge) між серіями:
                </Text>
              </HStack>
              <Box
                p="3"
                borderRadius="lg"
                bg="bg.panel"
                borderWidth="1px"
                borderColor="border.subtle"
              >
                <Text fontSize="xs" color="fg" fontStyle="italic" lineHeight="relaxed">
                  "{selectedTopic.narrativeBridge}"
                </Text>
              </Box>
            </Box>

            {/* Section 3: 3-Second Viral Hook */}
            <Box
              bg="bg.surface"
              p="4"
              borderRadius="xl"
              borderWidth="1px"
              borderColor="border.subtle"
            >
              <Flex justify="space-between" align="center" mb="2">
                <HStack gap="2">
                  <Flame size={16} color="var(--chakra-colors-yellow-500)" />
                  <Text fontWeight="bold" fontSize="sm" color="fg">
                    3. Вірусний 3-секундний хук (Viral Hook):
                  </Text>
                </HStack>
                <Badge colorPalette="yellow" size="xs" variant="solid">
                  Retention Score: {selectedTopic.retentionScore}%
                </Badge>
              </Flex>
              <Box
                p="3"
                borderRadius="lg"
                bg="bg.panel"
                borderWidth="1px"
                borderColor="border.subtle"
              >
                <Text fontSize="xs" color="fg" fontWeight="medium" lineHeight="relaxed">
                  "{selectedTopic.threeSecHook}"
                </Text>
              </Box>
            </Box>

            {/* Section 4: Pin-Comment Community Question */}
            <Box
              bg="bg.surface"
              p="4"
              borderRadius="xl"
              borderWidth="1px"
              borderColor="border.subtle"
            >
              <HStack gap="2" mb="2">
                <MessageSquare size={16} color="var(--chakra-colors-green-500)" />
                <Text fontWeight="bold" fontSize="sm" color="fg">
                  4. Закріплений коментар для дискусії спільноти:
                </Text>
              </HStack>
              <Box
                p="3"
                borderRadius="lg"
                bg="bg.panel"
                borderWidth="1px"
                borderColor="border.subtle"
              >
                <Text fontSize="xs" color="fg" lineHeight="relaxed">
                  {selectedTopic.pinQuestion}
                </Text>
              </Box>
            </Box>

            {/* Section 5: Serialization Best-Practice Continuity Card */}
            <Box
              p="3.5"
              borderRadius="xl"
              bg="purple.500/10"
              borderWidth="1px"
              borderColor="purple.500"
            >
              <Flex justify="space-between" align="center" wrap="wrap" gap="2" mb="2">
                <HStack gap="2">
                  <Sparkles size={16} color="var(--chakra-colors-purple-400)" />
                  <Text fontSize="xs" fontWeight="bold" color="fg">
                    Автоуспадкування серіалізації (Best-Practice Continuity):
                  </Text>
                </HStack>
                <Badge size="xs" colorPalette="purple" variant="solid">
                  Частина {nextPartNumber} з {totalParts}
                </Badge>
              </Flex>
              <HStack gap="2" wrap="wrap">
                <Badge size="xs" variant="surface" colorPalette="teal">
                  Персонаж: Luna / Neil (Auto-inherited)
                </Badge>
                <Badge size="xs" variant="surface" colorPalette="cyan">
                  Голос: Edge-TTS uk-UA (1.1x)
                </Badge>
                <Badge size="xs" variant="surface" colorPalette="orange">
                  Тон: Драматичний клифхенгер
                </Badge>
              </HStack>
              <Text fontSize="3xs" color="fg.muted" mt="2">
                💡 <strong>Рекомендація залучення:</strong> Збереження єдиного візуального стилю та
                аватара підвищує утримання глядачів у серіях роликів на 40%+. Усі параметри
                успадковуються автоматично, але за бажанням ви можете змінити їх у будь-який момент.
              </Text>
            </Box>
          </Box>

          {/* Footer */}
          <Box
            p="4"
            borderTopWidth="1px"
            borderColor="border.subtle"
            bg="bg.surface"
            position="sticky"
            bottom="0"
          >
            <Flex justify="space-between" align="center" wrap="wrap" gap="3">
              <Button
                size="sm"
                variant="outline"
                colorPalette="gray"
                onClick={closeModal}
                title="Скасувати вибір теми"
                aria-label="Скасувати"
              >
                Скасувати
              </Button>
              <HStack gap="2">
                <Button
                  size="sm"
                  variant="outline"
                  colorPalette="teal"
                  onClick={closeModal}
                  title="Зберегти тему в чергу для подальшого монтажу"
                  aria-label="Зберегти в чергу"
                >
                  Зберегти в чергу
                </Button>
                <Button
                  size="sm"
                  variant="solid"
                  colorPalette="teal"
                  onClick={handleApply}
                  title="Застосувати обрану тему та створити новий ролик"
                  aria-label="Застосувати та створити ролик"
                >
                  <Check size={14} />
                  Застосувати та створити ролик
                </Button>
              </HStack>
            </Flex>
          </Box>
        </Box>
      </Box>
    </Portal>
  );
};
