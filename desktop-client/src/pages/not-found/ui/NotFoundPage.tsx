import { useSettingsStore } from '@/entities/settings';
import { ROUTES } from '@/shared/config';
import { Badge, Box, Button, HStack, Heading, Text, VStack } from '@/shared/ui';
import { AlertCircle, ArrowLeft, Home } from 'lucide-react';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const accentColor = useSettingsStore((s) => s.settings.accentColor);

  return (
    <Box display="flex" alignItems="center" justifyContent="center" height="100%" p="8">
      <VStack gap="4" textAlign="center" maxW="450px">
        <AlertCircle size={48} color="#ef4444" />
        <Badge colorPalette="red" variant="subtle" size="md">
          {t('notFound.badge')}
        </Badge>
        <Heading size="xl" color="fg">
          {t('notFound.title')}
        </Heading>
        <Text color="fg.muted" fontSize="sm">
          {t('notFound.desc')}
        </Text>
        <HStack gap="3" pt="2">
          <Button variant="outline" colorPalette="gray" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} />
            Назад
          </Button>
          <Button
            colorPalette={accentColor}
            variant="solid"
            size="sm"
            onClick={() => navigate(ROUTES.OVERVIEW)}
          >
            <Home size={16} />
            {t('notFound.backHome')}
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};
