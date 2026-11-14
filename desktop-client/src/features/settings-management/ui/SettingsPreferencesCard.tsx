import type { AccentColor, DesktopSettings } from '@/entities/settings';
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
import { Palette, RefreshCw, RotateCcw, Sliders } from 'lucide-react';
import type React from 'react';

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
  onToggleAutoRefresh,
  onIntervalChange,
  onToggleCompact,
  onToggleSound,
  onToggleDevMode,
  onReset,
}) => {
  return (
    <Card.Root p="5" bg="bg.panel" borderWidth="1px" borderColor="border.subtle" borderRadius="xl">
      <Card.Header p="0" mb="4">
        <HStack justify="space-between" align="center">
          <HStack gap="2" align="center">
            <Palette size={18} color="#38bdf8" />
            <Heading size="sm" color="fg">
              Application & Theme Preferences
            </Heading>
          </HStack>
          <Button size="xs" variant="ghost" colorPalette="red" onClick={onReset}>
            <RotateCcw size={14} />
            Reset Defaults
          </Button>
        </HStack>
      </Card.Header>

      <Card.Body p="0">
        <VStack align="stretch" gap="4">
          {/* Accent Color Selection */}
          <Box>
            <Flex justify="space-between" align="center" mb="2">
              <Text fontSize="sm" fontWeight="medium" color="fg">
                Accent Theme Color
              </Text>
              <Badge colorPalette={settings.accentColor} variant="solid" size="sm">
                Active: {settings.accentColor}
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
                  System Metrics Auto-Refresh
                </Text>
              </HStack>
              <Button
                size="xs"
                variant={settings.autoRefreshMetrics ? 'solid' : 'subtle'}
                colorPalette={settings.autoRefreshMetrics ? 'green' : 'gray'}
                onClick={onToggleAutoRefresh}
              >
                {settings.autoRefreshMetrics ? 'Enabled' : 'Disabled'}
              </Button>
            </Flex>

            {settings.autoRefreshMetrics && (
              <HStack gap="2" mt="2">
                <Text fontSize="xs" color="fg.muted">
                  Interval:
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
                Desktop Display & Audio
              </Text>
            </HStack>

            <HStack gap="3" wrap="wrap">
              <Button
                size="sm"
                variant={settings.compactMode ? 'solid' : 'subtle'}
                colorPalette={settings.accentColor}
                onClick={onToggleCompact}
              >
                Compact Navigation: {settings.compactMode ? 'ON' : 'OFF'}
              </Button>
              <Button
                size="sm"
                variant={settings.soundEnabled ? 'solid' : 'subtle'}
                colorPalette={settings.accentColor}
                onClick={onToggleSound}
              >
                Audio Feedback: {settings.soundEnabled ? 'ON' : 'OFF'}
              </Button>
              <Button
                size="sm"
                variant={settings.developerMode ? 'solid' : 'subtle'}
                colorPalette={settings.accentColor}
                onClick={onToggleDevMode}
              >
                Dev IPC Logs: {settings.developerMode ? 'ON' : 'OFF'}
              </Button>
            </HStack>
          </Box>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
};
