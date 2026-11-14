import type { SmmRubricType } from '@/shared/api';
import { Badge, Box, Button, Card, Flex, HStack, Text, VStack } from '@chakra-ui/react';
import { useScriptGenerator } from '../model/use-script-generator';

const RUBRICS: Array<{ id: SmmRubricType; title: string; desc: string }> = [
  {
    id: 'last-sol-drama',
    title: 'Останній сол (Драма)',
    desc: 'Загибель марсохода чи зонда, пилова буря, останні кадри',
  },
  {
    id: 'tech-explain',
    title: 'Як це працює (Інженерія)',
    desc: 'Розбір унікального приладу, ядерного джерела чи лазера',
  },
  {
    id: 'dictionary-30s',
    title: 'Словник за 30с (Edutainment)',
    desc: 'Пояснення складного наукового терміну на простих аналогіях',
  },
  {
    id: 'crash-test',
    title: 'Краш-тест (Аварії)',
    desc: 'Невдачі місій, застрягання у пісках, помилки коду',
  },
  {
    id: 'build-in-public',
    title: 'Бекстейдж (Build in Public)',
    desc: 'Розробка та архітектура проекту CosmoLost',
  },
];

export function ScriptGeneratorPanel() {
  const {
    isGenerating,
    selectedRubric,
    setSelectedRubric,
    generateScript,
    suggestNextTopic,
    nextTopicSuggestion,
  } = useScriptGenerator();

  return (
    <Card.Root bg="bg.panel" borderColor="border.subtle">
      <Card.Header>
        <Flex justify="space-between" align="center">
          <Text fontWeight="semibold" fontSize="lg" color="fg">
            Генератор SMM-Сценаріїв (~40 сек)
          </Text>
          <Badge colorPalette="teal" variant="subtle">
            AI + SMM Engine
          </Badge>
        </Flex>
      </Card.Header>

      <Card.Body>
        <VStack align="stretch" gap="4">
          <Text fontSize="sm" color="fg.muted">
            Оберіть контент-рубрику для формування вірусного 3-фазного сценарію (Хук 0–3с → М’ясо
            3–32с → Loop CTA 32–40с):
          </Text>

          <Flex wrap="wrap" gap="2">
            {RUBRICS.map((rubric) => {
              const isSelected = selectedRubric === rubric.id;
              return (
                <Button
                  key={rubric.id}
                  size="sm"
                  variant={isSelected ? 'solid' : 'outline'}
                  colorPalette={isSelected ? 'teal' : 'gray'}
                  onClick={() => setSelectedRubric(rubric.id)}
                >
                  {rubric.title}
                </Button>
              );
            })}
          </Flex>

          <HStack gap="3" pt="2">
            <Button colorPalette="teal" loading={isGenerating} onClick={generateScript}>
              Згенерувати 40с Сценарій
            </Button>

            <Button variant="outline" onClick={suggestNextTopic}>
              Придумати тему наступного ролика
            </Button>
          </HStack>

          {nextTopicSuggestion && (
            <Box p="3" borderRadius="lg" bg="teal.950" borderWidth="1px" borderColor="teal.700">
              <VStack align="stretch" gap="1">
                <HStack justify="space-between">
                  <Text fontWeight="semibold" fontSize="xs" color="teal.200">
                    Рекомендований серійний міст (Narrative Bridge):
                  </Text>
                  <Badge size="xs" colorPalette="teal">
                    {nextTopicSuggestion.suggestedArtifactName}
                  </Badge>
                </HStack>
                <Text fontSize="xs" color="fg">
                  "{nextTopicSuggestion.narrativeBridge}"
                </Text>
                <Text fontSize="xs" color="fg.muted">
                  Хук: {nextTopicSuggestion.suggestedHook}
                </Text>
              </VStack>
            </Box>
          )}
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
