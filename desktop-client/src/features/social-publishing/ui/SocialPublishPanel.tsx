import { ConnectorBadge, useConnectorStore } from '@/entities/social-connector';
import { ROUTES } from '@/shared/config';
import { Badge, Box, Button, Card, Flex, HStack, Text, VStack } from '@chakra-ui/react';
import { SlidersHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSocialPublishing } from '../model/use-social-publishing';

export function SocialPublishPanel() {
  const navigate = useNavigate();
  const {
    isPublishing,
    publishFeedback,
    publishToSelectedChannels,
    openLocalFolderDirectly,
    currentProject,
  } = useSocialPublishing();

  const { connectors, selectedConnectorIds, toggleSelection } = useConnectorStore();

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
            <Badge colorPalette="purple" variant="subtle">
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

          {currentProject?.seoCaption && (
            <Box
              p="3"
              borderRadius="lg"
              bg="bg.subtle"
              borderWidth="1px"
              borderColor="border.subtle"
            >
              <VStack align="stretch" gap="1" fontSize="xs">
                <Text fontWeight="semibold" color="fg">
                  Пакет SEO-метаданих (3 рядки):
                </Text>
                <Text color="fg.muted">Рядок 1 (Хук): {currentProject.seoCaption.line1Hook}</Text>
                <Text color="fg.muted">Рядок 2 (SEO): {currentProject.seoCaption.line2Seo}</Text>
                <Text color="fg.muted">Рядок 3 (Теги): {currentProject.seoCaption.line3Tags}</Text>
                <Text color="teal.300">Закріплений коментар: {currentProject.pinComment}</Text>
              </VStack>
            </Box>
          )}

          <HStack gap="3" pt="2">
            <Button
              colorPalette="purple"
              loading={isPublishing}
              onClick={publishToSelectedChannels}
            >
              Опублікувати у вибрані канали
            </Button>

            <Button variant="outline" onClick={openLocalFolderDirectly}>
              Відкрити папку з відео (OS Explorer)
            </Button>
          </HStack>

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
