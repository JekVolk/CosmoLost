import {
  PREDEFINED_TAG_GROUPS,
  downloadScriptMarkdownFile,
  usePublicationStore,
} from '@/entities/publication';
import { ConnectorBadge, useConnectorStore } from '@/entities/social-connector';
import { ROUTES } from '@/shared/config';
import { Badge, Box, Button, Card, Flex, HStack, Text, VStack } from '@chakra-ui/react';
import {
  Check,
  Copy,
  Download,
  FileText,
  Hash,
  Rocket,
  Send,
  SlidersHorizontal,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocialPublishing } from '../model/use-social-publishing';

export function SocialPublishPanel() {
  const navigate = useNavigate();
  const {
    isPublishing,
    publishFeedback,
    publishToSelectedChannels,
    autoPublishAll,
    openLocalFolderDirectly,
    currentProject,
  } = useSocialPublishing();

  const toggleTagGroup = usePublicationStore((s) => s.toggleTagGroup);
  const { connectors, selectedConnectorIds, toggleSelection } = useConnectorStore();
  const [copiedSeo, setCopiedSeo] = useState(false);

  const activeTagGroups = currentProject?.tagGroups || ['viral', 'space', 'nasa'];

  const handleCopySeoPackage = async () => {
    if (!currentProject) return;
    const pkg = `${currentProject.seoCaption.line1Hook}\n\n${currentProject.seoCaption.line2Seo}\n\n${currentProject.seoCaption.line3Tags}\n\n📌 Закріплений коментар:\n${currentProject.pinComment}`;
    await navigator.clipboard.writeText(pkg);
    setCopiedSeo(true);
    setTimeout(() => setCopiedSeo(false), 3000);
  };

  const defaultConnectors =
    connectors.length > 0
      ? connectors
      : [
          {
            id: 'youtube-shorts',
            platformType: 'YOUTUBE_SHORTS' as const,
            displayName: 'YouTube Shorts (OAuth)',
            authType: 'OAUTH_PKCE',
            status: 'CONNECTED' as const,
            isActive: true,
            lastConnectedAt: null,
          },
          {
            id: 'telegram-channel',
            platformType: 'TELEGRAM_CHANNEL' as const,
            displayName: 'Telegram Channel (@cosmolost_hq)',
            authType: 'BOT_TOKEN',
            status: 'CONNECTED' as const,
            isActive: true,
            lastConnectedAt: null,
          },
          {
            id: 'local-folder-export',
            platformType: 'LOCAL_FOLDER' as const,
            displayName: 'Відкрити папку з відео (OS Explorer)',
            authType: 'NONE',
            status: 'CONNECTED' as const,
            isActive: true,
            lastConnectedAt: null,
          },
        ];

  return (
    <Card.Root bg="bg.panel" borderColor="border.subtle">
      <Card.Header>
        <Flex justify="space-between" align="center" wrap="wrap" gap="2">
          <Text fontWeight="semibold" fontSize="lg" color="fg">
            Дистрибуція та Мультипостинг
          </Text>
          <HStack gap="2">
            <Badge
              colorPalette="purple"
              variant="subtle"
              size="xs"
              px="2.5"
              py="0.5"
              borderRadius="md"
            >
              Social Connectors
            </Badge>
            <Button
              size="xs"
              variant="outline"
              colorPalette="purple"
              onClick={() => navigate(ROUTES.SETTINGS)}
              title="Налаштувати OAuth та токени в Налаштуваннях"
            >
              <SlidersHorizontal size={12} />
              Налаштувати канали
            </Button>
          </HStack>
        </Flex>
      </Card.Header>

      <Card.Body>
        <VStack align="stretch" gap="4">
          <Text fontSize="sm" color="fg.muted">
            Оберіть канали для публікації ролика або використайте миттєвий експорт у папку з
            автоматичним копіюванням SEO-опису в буфер обміну:
          </Text>

          <Flex wrap="wrap" gap="2">
            {defaultConnectors.map((c) => (
              <ConnectorBadge
                key={c.id}
                connector={c}
                isSelected={selectedConnectorIds.includes(c.id)}
                onToggle={toggleSelection}
              />
            ))}
          </Flex>

          {/* Categorized Tag Groups */}
          <Box p="3" borderRadius="lg" bg="bg.subtle" borderWidth="1px" borderColor="border.subtle">
            <VStack align="stretch" gap="2">
              <HStack justify="space-between">
                <HStack gap="2">
                  <Hash size={15} color="#c084fc" />
                  <Text fontSize="xs" fontWeight="bold" color="fg">
                    Згруповані Хештеги для Алгоритмів (Теги):
                  </Text>
                </HStack>
                <Badge colorPalette="purple" size="xs" px="2" py="0.5" borderRadius="md">
                  {currentProject?.tagGroups?.length || 3} активні групи
                </Badge>
              </HStack>
              <Text fontSize="2xs" color="fg.muted">
                Оберіть категорії для автоматичного формування SEO-пакету Shorts/Reels/TikTok:
              </Text>
              <Flex wrap="wrap" gap="1.5">
                {PREDEFINED_TAG_GROUPS.map((group) => {
                  const isActive = activeTagGroups.includes(group.id);
                  return (
                    <Button
                      key={group.id}
                      size="xs"
                      variant={isActive ? 'solid' : 'outline'}
                      colorPalette={isActive ? 'purple' : 'gray'}
                      onClick={() => toggleTagGroup(group.id)}
                      title={`Теги: ${group.tags.join(' ')}`}
                    >
                      <span>{group.icon}</span>
                      {group.name}
                      <Badge
                        size="xs"
                        ml="1.5"
                        px="2"
                        py="0.5"
                        borderRadius="md"
                        colorPalette={isActive ? 'white' : 'purple'}
                      >
                        {group.tags.length}
                      </Badge>
                    </Button>
                  );
                })}
              </Flex>
            </VStack>
          </Box>

          {currentProject?.seoCaption && (
            <Box
              p="3"
              borderRadius="lg"
              bg="bg.subtle"
              borderWidth="1px"
              borderColor="border.subtle"
            >
              <VStack align="stretch" gap="1.5" fontSize="xs">
                <Flex justify="space-between" align="center">
                  <HStack gap="2">
                    <Text fontWeight="semibold" color="fg">
                      Пакет SEO-метаданих (3 рядки):
                    </Text>
                    {currentProject.magnetWord && (
                      <Badge
                        size="xs"
                        colorPalette="yellow"
                        variant="solid"
                        px="2.5"
                        py="0.5"
                        borderRadius="md"
                      >
                        {currentProject.magnetWord}
                      </Badge>
                    )}
                  </HStack>
                  <Button
                    size="2xs"
                    variant="ghost"
                    colorPalette="teal"
                    onClick={handleCopySeoPackage}
                  >
                    {copiedSeo ? <Check size={12} /> : <Copy size={12} />}
                    {copiedSeo ? 'Скопійовано!' : 'Копіювати SEO'}
                  </Button>
                </Flex>
                <Text color="fg.muted">Рядок 1 (Хук): {currentProject.seoCaption.line1Hook}</Text>
                <Text color="fg.muted">Рядок 2 (SEO): {currentProject.seoCaption.line2Seo}</Text>
                <Text color="fg.muted" fontFamily="monospace" fontSize="2xs">
                  Рядок 3 (Теги): {currentProject.seoCaption.line3Tags}
                </Text>
                <Text color="teal.300">Закріплений коментар: {currentProject.pinComment}</Text>
              </VStack>
            </Box>
          )}

          <Flex wrap="wrap" gap="2.5" pt="1">
            <Button
              colorPalette="purple"
              variant="solid"
              loading={isPublishing}
              onClick={autoPublishAll}
              title="Автоматично опублікувати у всі підключені канали та зберегти ролик на диск"
            >
              <Rocket size={15} />
              Авто-публікація у всі канали
            </Button>

            <Button
              colorPalette="purple"
              variant="subtle"
              loading={isPublishing}
              onClick={publishToSelectedChannels}
            >
              <Send size={14} />
              Опублікувати у вибрані
            </Button>

            {currentProject && (
              <Button
                variant="outline"
                colorPalette="teal"
                onClick={() => downloadScriptMarkdownFile(currentProject)}
                title="Завантажити повний файл сценарію (.md)"
              >
                <FileText size={14} />
                Завантажити сценарій (.md)
              </Button>
            )}

            <Button variant="outline" onClick={openLocalFolderDirectly}>
              <Download size={14} />
              OS Explorer
            </Button>
          </Flex>

          {publishFeedback && (
            <Box p="2" borderRadius="md" bg="purple.950" borderWidth="1px" borderColor="purple.700">
              <Text fontSize="xs" color="purple.200">
                {publishFeedback}
              </Text>
            </Box>
          )}
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
