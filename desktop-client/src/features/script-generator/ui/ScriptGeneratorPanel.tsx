import {
  POPULAR_MAGNET_WORDS,
  copyScriptToClipboard,
  downloadScriptMarkdownFile,
} from '@/entities/publication';
import { Badge, Box, Button, Card, Flex, HStack, Input, Text, VStack } from '@chakra-ui/react';
import {
  Check,
  Copy,
  Database,
  Download,
  FileText,
  Film,
  Flame,
  Globe,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import { useScriptGenerator } from '../model/use-script-generator';

export function ScriptGeneratorPanel() {
  const {
    isGenerating,
    selectedRubric,
    setSelectedRubric,
    contentLanguage,
    setContentLanguage,
    serverTemplates,
    generateScript,
    loadAssetBundle,
    suggestNextTopic,
    nextTopicSuggestion,
    isSyncingCatalog,
    syncStatus,
    triggerCatalogSync,
    magnetWord,
    setMagnetWord,
    isSeries,
    setIsSeries,
    seriesName,
    setSeriesName,
    seriesPart,
    setSeriesPart,
    seriesTotalParts,
    setSeriesTotalParts,
    currentProject,
  } = useScriptGenerator();

  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const handleCopyScript = async () => {
    if (!currentProject) return;
    const ok = await copyScriptToClipboard(currentProject);
    if (ok) {
      setCopyFeedback('Сценарій скопійовано в буфер!');
      setTimeout(() => setCopyFeedback(null), 3000);
    }
  };

  const handleDownloadScript = () => {
    if (!currentProject) return;
    downloadScriptMarkdownFile(currentProject);
  };

  return (
    <Card.Root bg="bg.panel" borderColor="border.subtle">
      <Card.Header>
        <Flex justify="space-between" align="center" wrap="wrap" gap="2">
          <HStack gap="2">
            <Sparkles size={18} color="var(--chakra-colors-teal-400)" />
            <Text fontWeight="semibold" fontSize="lg" color="fg">
              Генератор SMM-Сценаріїв (~40 сек)
            </Text>
          </HStack>
          <HStack gap="2">
            <Badge
              colorPalette="teal"
              variant="solid"
              size="xs"
              px="2.5"
              py="0.5"
              borderRadius="md"
            >
              API Connected
            </Badge>
            <Badge
              colorPalette="purple"
              variant="subtle"
              size="xs"
              px="2.5"
              py="0.5"
              borderRadius="md"
            >
              Axios + React Query
            </Badge>
          </HStack>
        </Flex>
      </Card.Header>

      <Card.Body>
        <VStack align="stretch" gap="4">
          {/* Target Content Language Toggle */}
          <Box p="3" borderRadius="lg" bg="bg.subtle" borderWidth="1px" borderColor="border.subtle">
            <Flex justify="space-between" align="center" wrap="wrap" gap="2">
              <HStack gap="2">
                <Globe size={15} color="#2dd4bf" />
                <Text fontSize="xs" fontWeight="semibold" color="fg">
                  Мова генерації відео (Пріоритет):
                </Text>
              </HStack>
              <HStack gap="1.5">
                <Button
                  size="xs"
                  variant={contentLanguage === 'en' ? 'solid' : 'outline'}
                  colorPalette={contentLanguage === 'en' ? 'teal' : 'gray'}
                  onClick={() => setContentLanguage('en')}
                >
                  🇬🇧 English (Global Shorts)
                </Button>
                <Button
                  size="xs"
                  variant={contentLanguage === 'uk' ? 'solid' : 'outline'}
                  colorPalette={contentLanguage === 'uk' ? 'teal' : 'gray'}
                  onClick={() => setContentLanguage('uk')}
                >
                  🇺🇦 Українська
                </Button>
                <Button
                  size="xs"
                  variant={contentLanguage === 'dual' ? 'solid' : 'outline'}
                  colorPalette={contentLanguage === 'dual' ? 'teal' : 'gray'}
                  onClick={() => setContentLanguage('dual')}
                >
                  🌐 Dual (EN + UK)
                </Button>
              </HStack>
            </Flex>
          </Box>

          <Text fontSize="sm" color="fg.muted">
            Оберіть контент-рубрику для формування вірусного 3-фазного сценарію (Хук 0–3с → М’ясо
            3–32с → Loop CTA 32–40с):
          </Text>

          {/* SMM Templates from Backend / Fallbacks */}
          <Flex wrap="wrap" gap="2">
            {serverTemplates.map((template) => {
              const isSelected = selectedRubric === template.id;
              return (
                <Button
                  key={template.id}
                  size="sm"
                  variant={isSelected ? 'solid' : 'outline'}
                  colorPalette={isSelected ? 'teal' : 'gray'}
                  onClick={() => setSelectedRubric(template.id)}
                >
                  {template.rubric_name}
                  <Badge
                    size="xs"
                    ml="1.5"
                    px="2"
                    py="0.5"
                    borderRadius="md"
                    colorPalette={isSelected ? 'white' : 'teal'}
                  >
                    {template.target_duration_sec}с
                  </Badge>
                </Button>
              );
            })}
            <Button
              size="sm"
              variant={selectedRubric === 'chronicles' ? 'solid' : 'outline'}
              colorPalette={selectedRubric === 'chronicles' ? 'yellow' : 'gray'}
              onClick={() => {
                setSelectedRubric('chronicles');
                setIsSeries(true);
              }}
            >
              <Film size={14} />
              Космічні Хроніки (Серіал)
              <Badge
                size="xs"
                ml="1.5"
                px="2"
                py="0.5"
                borderRadius="md"
                colorPalette={selectedRubric === 'chronicles' ? 'white' : 'yellow'}
              >
                Хроніки
              </Badge>
            </Button>
          </Flex>

          {/* Magnetic Power Words (0-3s Viral Hook Trigger) */}
          <Box p="3" borderRadius="lg" bg="bg.subtle" borderWidth="1px" borderColor="border.subtle">
            <VStack align="stretch" gap="2">
              <HStack justify="space-between">
                <HStack gap="2">
                  <Flame size={15} color="#f59e0b" />
                  <Text fontSize="xs" fontWeight="bold" color="fg">
                    Слово-Магніт для Хука (ШІ-Тригер уваги 0–3с):
                  </Text>
                </HStack>
                <Badge
                  colorPalette="yellow"
                  size="xs"
                  variant="surface"
                  px="2.5"
                  py="0.5"
                  borderRadius="md"
                >
                  Ретеншн &gt; 65%
                </Badge>
              </HStack>
              <Flex wrap="wrap" gap="1.5">
                {POPULAR_MAGNET_WORDS.map((word) => {
                  const isWordSelected = magnetWord === word;
                  return (
                    <Button
                      key={word}
                      size="xs"
                      variant={isWordSelected ? 'solid' : 'outline'}
                      colorPalette={isWordSelected ? 'yellow' : 'gray'}
                      onClick={() => setMagnetWord(word)}
                    >
                      {word}
                    </Button>
                  );
                })}
              </Flex>
            </VStack>
          </Box>

          {/* Episodic / Chronicles Multi-part Series Setup */}
          <Box p="3" borderRadius="lg" bg="bg.subtle" borderWidth="1px" borderColor="border.subtle">
            <VStack align="stretch" gap="2.5">
              <Flex justify="space-between" align="center">
                <HStack gap="2">
                  <Film size={15} color="#a855f7" />
                  <Text fontSize="xs" fontWeight="bold" color="fg">
                    Багатосерійні Хроніки (Multi-part Series):
                  </Text>
                </HStack>
                <Button
                  size="xs"
                  variant={isSeries ? 'solid' : 'outline'}
                  colorPalette={isSeries ? 'purple' : 'gray'}
                  onClick={() => setIsSeries(!isSeries)}
                >
                  {isSeries ? '✓ Серіал увімкнено' : 'Окремий випуск'}
                </Button>
              </Flex>

              {isSeries && (
                <VStack align="stretch" gap="2" pt="1">
                  <HStack gap="2">
                    <Box flex="2">
                      <Text fontSize="2xs" color="fg.muted" mb="1">
                        Назва серії (Хроніки):
                      </Text>
                      <Input
                        size="xs"
                        value={seriesName}
                        onChange={(e) => setSeriesName(e.target.value)}
                        placeholder="Наприклад: Марсіанські Хроніки"
                      />
                    </Box>
                    <Box flex="1">
                      <Text fontSize="2xs" color="fg.muted" mb="1">
                        Частина:
                      </Text>
                      <Input
                        size="xs"
                        type="number"
                        value={seriesPart}
                        min={1}
                        max={seriesTotalParts}
                        onChange={(e) => setSeriesPart(Number(e.target.value))}
                      />
                    </Box>
                    <Box flex="1">
                      <Text fontSize="2xs" color="fg.muted" mb="1">
                        Всього частин:
                      </Text>
                      <Input
                        size="xs"
                        type="number"
                        value={seriesTotalParts}
                        min={1}
                        onChange={(e) => setSeriesTotalParts(Number(e.target.value))}
                      />
                    </Box>
                  </HStack>
                  <Text fontSize="2xs" color="purple.300">
                    💡 При генерації сценарію ШІ автоматично сформує кліфхенгер (інтригу для
                    переходу до наступної частини) на 4-му слайді!
                  </Text>
                </VStack>
              )}
            </VStack>
          </Box>

          {/* Action Buttons */}
          <Flex wrap="wrap" gap="3" pt="2">
            <Button colorPalette="teal" loading={isGenerating} onClick={generateScript}>
              <Sparkles size={15} />
              Згенерувати ШІ-Сценарій
            </Button>

            <Button
              colorPalette="purple"
              variant="subtle"
              loading={isGenerating}
              onClick={loadAssetBundle}
            >
              <Download size={15} />
              Завантажити медіапакет (API)
            </Button>

            <Button variant="outline" onClick={suggestNextTopic}>
              Розумний підбір наступної теми
            </Button>

            <Button
              size="sm"
              variant="ghost"
              colorPalette="gray"
              loading={isSyncingCatalog}
              onClick={triggerCatalogSync}
            >
              <RefreshCw size={14} />
              Синхронізація NASA
            </Button>
          </Flex>

          {/* Script File Export & Clipboard Tools */}
          <Box p="3" borderRadius="lg" bg="teal.950/40" borderWidth="1px" borderColor="teal.800">
            <Flex justify="space-between" align="center" wrap="wrap" gap="2">
              <HStack gap="2">
                <FileText size={16} color="#2dd4bf" />
                <Text fontSize="xs" fontWeight="semibold" color="teal.200">
                  Експорт готового сценарію та контент-плану:
                </Text>
              </HStack>
              <HStack gap="2">
                <Button
                  size="xs"
                  variant="outline"
                  colorPalette="teal"
                  onClick={handleDownloadScript}
                  title="Зберегти .md файл сценарію з таймкодами та SEO на диск"
                >
                  <Download size={13} />
                  Завантажити файл (.md)
                </Button>
                <Button
                  size="xs"
                  variant="solid"
                  colorPalette="teal"
                  onClick={handleCopyScript}
                  title="Скопіювати сценарій в буфер обміну"
                >
                  <Copy size={13} />
                  Скопіювати план
                </Button>
              </HStack>
            </Flex>
            {copyFeedback && (
              <HStack mt="2" gap="1" color="teal.300" fontSize="2xs">
                <Check size={12} />
                <Text>{copyFeedback}</Text>
              </HStack>
            )}
          </Box>

          {syncStatus && (
            <HStack px="3" py="2" borderRadius="md" bg="bg.muted" gap="2">
              <Database size={14} />
              <Text fontSize="xs" color="fg.muted">
                {syncStatus}
              </Text>
            </HStack>
          )}

          {/* Serial Content / Smart Recommendation Card */}
          {nextTopicSuggestion && (
            <Box p="4" borderRadius="lg" bg="teal.950" borderWidth="1px" borderColor="teal.700">
              <VStack align="stretch" gap="2">
                <HStack justify="space-between">
                  <Text fontWeight="semibold" fontSize="xs" color="teal.200">
                    Рекомендований серійний міст (Smart Next Topic Engine):
                  </Text>
                  <Badge size="xs" colorPalette="teal" px="2.5" py="0.5" borderRadius="md">
                    {nextTopicSuggestion.suggested_artifact_name}
                  </Badge>
                </HStack>
                <Text fontSize="xs" color="fg" fontStyle="italic">
                  &ldquo;{nextTopicSuggestion.narrative_bridge}&rdquo;
                </Text>
                <Text fontSize="xs" color="teal.100">
                  <Text as="span" fontWeight="bold">
                    Хук:
                  </Text>{' '}
                  {nextTopicSuggestion.suggested_hook}
                </Text>
                <Text fontSize="xs" color="fg.muted">
                  <Text as="span" fontWeight="bold">
                    Pin Comment:
                  </Text>{' '}
                  {nextTopicSuggestion.recommended_pin_comment}
                </Text>
              </VStack>
            </Box>
          )}
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
