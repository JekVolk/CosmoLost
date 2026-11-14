import type { AccentColor, DesktopSettings, Language, ThemeMode } from '@/entities/settings';
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  HStack,
  Heading,
  Separator,
  Text,
  VStack,
} from '@/shared/ui';
import {
  Globe,
  Languages,
  Moon,
  Palette,
  RefreshCw,
  RotateCcw,
  Sliders,
  Sun,
  SunMoon,
} from 'lucide-react';
import type React from 'react';
import { useTranslation } from 'react-i18next';

const ACCENT_OPTIONS: { id: AccentColor; label: string; hex: string }[] = [
  { id: 'blue', label: 'Blue', hex: '#3b82f6' },
  { id: 'purple', label: 'Purple', hex: '#a855f7' },
  { id: 'teal', label: 'Teal', hex: '#14b8a6' },
  { id: 'green', label: 'Green', hex: '#22c55e' },
  { id: 'orange', label: 'Orange', hex: '#f97316' },
  { id: 'cyan', label: 'Cyan', hex: '#06b6d4' },
];

const INTERVAL_OPTIONS = [3, 5, 10, 30];

interface SettingsPreferencesCardProps {
  settings: DesktopSettings;
  onAccentChange: (accent: AccentColor) => void;
  onThemeModeChange: (mode: ThemeMode) => void;
  onLanguageChange: (lang: Language) => void;
  onToggleAutoRefresh: () => void;
  onIntervalChange: (seconds: number) => void;
  onToggleCompact: () => void;
  onToggleSound: () => void;
  onToggleDevMode: () => void;
  onReset: () => void;
}

export const SettingsPreferencesCard: React.FC<SettingsPreferencesCardProps> = ({
  settings,
  onAccentChange,
  onThemeModeChange,
  onLanguageChange,
  onToggleAutoRefresh,
  onIntervalChange,
  onToggleCompact,
  onToggleSound,
  onToggleDevMode,
  onReset,
}) => {
  const { t } = useTranslation();

  return (
    <Card.Root p="5" bg="bg.panel" borderWidth="1px" borderColor="border.subtle" borderRadius="xl">
      <Card.Header p="0" mb="4">
        <HStack justify="space-between" align="center">
          <HStack gap="2" align="center">
            <Palette size={18} color="#38bdf8" />
            <Heading size="sm" color="fg">
              {t('settings.themePreferences')}
            </Heading>
          </HStack>
          <Button size="xs" variant="ghost" colorPalette="red" onClick={onReset}>
            <RotateCcw size={14} />
            {t('common.resetDefaults')}
          </Button>
        </HStack>
      </Card.Header>

      <Card.Body p="0">
        <VStack align="stretch" gap="4">
          {/* Theme Appearance Mode */}
          <Box>
            <Flex justify="space-between" align="center" mb="2">
              <HStack gap="2">
                <SunMoon size={16} />
                <Text fontSize="sm" fontWeight="medium" color="fg">
                  {t('settings.themeMode')}
                </Text>
              </HStack>
              <Badge colorPalette={settings.accentColor} variant="subtle" size="sm">
                {settings.themeMode.toUpperCase()}
              </Badge>
            </Flex>
            <HStack gap="2">
              <Button
                size="sm"
                variant={settings.themeMode === 'dark' ? 'solid' : 'outline'}
                colorPalette={settings.accentColor}
                onClick={() => onThemeModeChange('dark')}
              >
                <Moon size={14} />
                {t('settings.themeDark')}
              </Button>
              <Button
                size="sm"
                variant={settings.themeMode === 'light' ? 'solid' : 'outline'}
                colorPalette={settings.accentColor}
                onClick={() => onThemeModeChange('light')}
              >
                <Sun size={14} />
                {t('settings.themeLight')}
              </Button>
              <Button
                size="sm"
                variant={settings.themeMode === 'system' ? 'solid' : 'outline'}
                colorPalette={settings.accentColor}
                onClick={() => onThemeModeChange('system')}
              >
                <Globe size={14} />
                {t('settings.themeSystem')}
              </Button>
            </HStack>
          </Box>

          <Separator borderColor="border.subtle" />

          {/* Language Selection */}
          <Box>
            <Flex justify="space-between" align="center" mb="2">
              <HStack gap="2">
                <Languages size={16} />
                <Text fontSize="sm" fontWeight="medium" color="fg">
                  {t('settings.language')}
                </Text>
              </HStack>
              <Badge variant="surface" size="sm">
                {settings.language === 'uk' ? 'UA' : 'EN'}
              </Badge>
            </Flex>
            <HStack gap="2">
              <Button
                size="sm"
                variant={settings.language === 'en' ? 'solid' : 'outline'}
                colorPalette={settings.accentColor}
                onClick={() => onLanguageChange('en')}
              >
                🇺🇸 {t('settings.langEn')}
              </Button>
              <Button
                size="sm"
                variant={settings.language === 'uk' ? 'solid' : 'outline'}
                colorPalette={settings.accentColor}
                onClick={() => onLanguageChange('uk')}
              >
                🇺🇦 {t('settings.langUk')}
              </Button>
            </HStack>
          </Box>

          <Separator borderColor="border.subtle" />

          {/* Accent Color Selection */}
          <Box>
            <Flex justify="space-between" align="center" mb="2">
              <Text fontSize="sm" fontWeight="medium" color="fg">
                {t('settings.accentColor')}
              </Text>
              <Badge colorPalette={settings.accentColor} variant="solid" size="sm">
                {settings.accentColor}
              </Badge>
            </Flex>
            <HStack gap="2" wrap="wrap">
              {ACCENT_OPTIONS.map((opt) => {
                const isSelected = settings.accentColor === opt.id;
                return (
                  <Button
                    key={opt.id}
                    size="sm"
                    variant={isSelected ? 'solid' : 'outline'}
                    colorPalette={opt.id}
                    onClick={() => onAccentChange(opt.id)}
                  >
                    <Box
                      w="3"
                      h="3"
                      borderRadius="full"
                      bg={opt.hex}
                      borderWidth="1px"
                      borderColor="border.subtle"
                    />
                    {opt.label}
                  </Button>
                );
              })}
            </HStack>
          </Box>

          <Separator borderColor="border.subtle" />

          {/* Auto Refresh & Intervals */}
          <Box>
            <Flex justify="space-between" align="center" mb="2">
              <HStack gap="2">
                <RefreshCw size={16} />
                <Text fontSize="sm" fontWeight="medium" color="fg">
                  {t('settings.autoRefresh')}
                </Text>
              </HStack>
              <Button
                size="xs"
                variant={settings.autoRefreshMetrics ? 'solid' : 'subtle'}
                colorPalette={settings.autoRefreshMetrics ? 'green' : 'gray'}
                onClick={onToggleAutoRefresh}
              >
                {settings.autoRefreshMetrics ? t('common.enabled') : t('common.disabled')}
              </Button>
            </Flex>

            {settings.autoRefreshMetrics && (
              <HStack gap="2" mt="2">
                <Text fontSize="xs" color="fg.muted">
                  {t('settings.interval')}:
                </Text>
                {INTERVAL_OPTIONS.map((sec) => (
                  <Button
                    key={sec}
                    size="xs"
                    variant={settings.refreshIntervalSec === sec ? 'solid' : 'subtle'}
                    colorPalette={settings.accentColor}
                    onClick={() => onIntervalChange(sec)}
                  >
                    {sec}s
                  </Button>
                ))}
              </HStack>
            )}
          </Box>

          <Separator borderColor="border.subtle" />

          {/* Additional toggles */}
          <Box>
            <HStack gap="2" mb="3">
              <Sliders size={16} />
              <Text fontSize="sm" fontWeight="medium" color="fg">
                {t('settings.displayAudio')}
              </Text>
            </HStack>

            <HStack gap="3" wrap="wrap">
              <Button
                size="sm"
                variant={settings.compactMode ? 'solid' : 'subtle'}
                colorPalette={settings.accentColor}
                onClick={onToggleCompact}
              >
                {t('settings.compactMode')}:{' '}
                {settings.compactMode ? t('common.on') : t('common.off')}
              </Button>
              <Button
                size="sm"
                variant={settings.soundEnabled ? 'solid' : 'subtle'}
                colorPalette={settings.accentColor}
                onClick={onToggleSound}
              >
                {t('settings.audioFeedback')}:{' '}
                {settings.soundEnabled ? t('common.on') : t('common.off')}
              </Button>
              <Button
                size="sm"
                variant={settings.developerMode ? 'solid' : 'subtle'}
                colorPalette={settings.accentColor}
                onClick={onToggleDevMode}
              >
                {t('settings.devLogs')}: {settings.developerMode ? t('common.on') : t('common.off')}
              </Button>
            </HStack>
          </Box>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
};
