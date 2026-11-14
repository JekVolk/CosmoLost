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
  Textarea,
  VStack,
} from '@/shared/ui';
import {
  CheckCircle,
  Download,
  FileUp,
  FolderArchive,
  HardDrive,
  Layers,
  RotateCw,
  ShieldCheck,
  Upload,
  XCircle,
} from 'lucide-react';
import type React from 'react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { ValidateBundleResult } from '../api/workspace-bundle-service';
import type { ImportMode } from '../model/use-settings-actions';
import { ImportValidationFeedbackCard } from './ImportValidationFeedbackCard';

interface SettingsImportExportCardProps {
  importText: string;
  importMode: ImportMode;
  validationResult: ValidateBundleResult | null;
  feedback: {
    type: 'success' | 'error' | null;
    message: string;
  };
  onImportModeChange: (mode: ImportMode) => void;
  onImportTextChange: (text: string) => void;
  onExportWorkspace: () => void;
  onExportSettingsOnly: () => void;
  onApplyImport: () => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SettingsImportExportCard: React.FC<SettingsImportExportCardProps> = ({
  importText,
  importMode,
  validationResult,
  feedback,
  onImportModeChange,
  onImportTextChange,
  onExportWorkspace,
  onExportSettingsOnly,
  onApplyImport,
  onFileUpload,
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <Card.Root p="5" bg="bg.panel" borderWidth="1px" borderColor="border.subtle" borderRadius="xl">
      <Card.Header p="0" mb="4">
        <HStack justify="space-between" align="center">
          <HStack gap="2" align="center">
            <HardDrive size={18} color="#22c55e" />
            <Heading size="sm" color="fg">
              {t('settings.nativeStoreImportExport')} & Projects
            </Heading>
          </HStack>
          <HStack gap="1.5">
            <ShieldCheck size={16} color="#38bdf8" />
            <Badge colorPalette="cyan" variant="surface" size="xs">
              Zod Strict Schema Validation
            </Badge>
          </HStack>
        </HStack>
      </Card.Header>

      <Card.Body p="0">
        <VStack align="stretch" gap="4">
          <Text fontSize="sm" color="fg.muted">
            Export complete workspace bundles (settings + project profiles + task scheduler
            routines) or import backup configurations with overwrite/merge modes.
          </Text>

          {/* Feedback message banner */}
          {feedback.type && (
            <Flex
              p="3"
              borderRadius="lg"
              bg={feedback.type === 'success' ? 'green.950' : 'red.950'}
              borderWidth="1px"
              borderColor={feedback.type === 'success' ? 'green.800' : 'red.800'}
              align="center"
              gap="2"
            >
              {feedback.type === 'success' ? (
                <CheckCircle size={16} color="#22c55e" />
              ) : (
                <XCircle size={16} color="#ef4444" />
              )}
              <Text fontSize="sm" color={feedback.type === 'success' ? 'green.200' : 'red.200'}>
                {feedback.message}
              </Text>
            </Flex>
          )}

          {/* Export Actions */}
          <Box>
            <HStack justify="space-between" align="center" mb="2">
              <Text fontSize="sm" fontWeight="medium" color="fg">
                {t('settings.exportConfig')}
              </Text>
              <Badge variant="subtle" colorPalette="green" size="sm">
                JSON Bundle v1.0
              </Badge>
            </HStack>
            <HStack gap="2" wrap="wrap">
              <Button
                size="sm"
                variant="solid"
                colorPalette="green"
                onClick={onExportWorkspace}
                title="Export full workspace with settings, projects, and scheduled routines"
              >
                <FolderArchive size={14} />
                Export Full Workspace Bundle (.json)
              </Button>
              <Button
                size="sm"
                variant="subtle"
                colorPalette="gray"
                onClick={onExportSettingsOnly}
                title="Export settings preferences only"
              >
                <Download size={14} />
                Settings Only (.json)
              </Button>
            </HStack>
          </Box>

          <Separator borderColor="border.subtle" />

          {/* Import Actions & Mode Switcher */}
          <Box>
            <Flex
              justify="space-between"
              align={{ base: 'flex-start', sm: 'center' }}
              direction={{ base: 'column', sm: 'row' }}
              gap="2"
              mb="3"
            >
              <VStack align="flex-start" gap="0.5">
                <Text fontSize="sm" fontWeight="medium" color="fg">
                  {t('settings.importRestore')} & Projects
                </Text>
                <Text fontSize="2xs" color="fg.muted">
                  Select whether to completely overwrite or merge into existing configurations
                </Text>
              </VStack>

              <HStack gap="2">
                <HStack
                  p="1"
                  bg="bg.canvas"
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor="border.subtle"
                >
                  <Button
                    size="xs"
                    variant={importMode === 'overwrite' ? 'solid' : 'ghost'}
                    colorPalette={importMode === 'overwrite' ? 'red' : 'gray'}
                    onClick={() => onImportModeChange('overwrite')}
                    title="Overwrite all settings and tasks"
                  >
                    <RotateCw size={12} />
                    Overwrite (Перезапис)
                  </Button>
                  <Button
                    size="xs"
                    variant={importMode === 'merge' ? 'solid' : 'ghost'}
                    colorPalette={importMode === 'merge' ? 'teal' : 'gray'}
                    onClick={() => onImportModeChange('merge')}
                    title="Merge with existing settings and tasks"
                  >
                    <Layers size={12} />
                    Merge (Об'єднання)
                  </Button>
                </HStack>

                <Button
                  size="xs"
                  variant="outline"
                  colorPalette="teal"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FileUp size={14} />
                  {t('settings.uploadJson')}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  style={{ display: 'none' }}
                  onChange={onFileUpload}
                />
              </HStack>
            </Flex>

            <Textarea
              placeholder={t('settings.pastePlaceholder')}
              value={importText}
              onChange={(e) => onImportTextChange(e.target.value)}
              rows={4}
              fontSize="xs"
              fontFamily="mono"
              mb="3"
              borderColor="border.subtle"
            />

            {/* Live Schema Validation Card */}
            <ImportValidationFeedbackCard result={validationResult} />

            <HStack justify="flex-end" gap="2" mt="3">
              <Button
                size="sm"
                variant="solid"
                colorPalette="teal"
                onClick={onApplyImport}
                disabled={!importText.trim()}
              >
                <Upload size={14} />
                Apply Import ({importMode.toUpperCase()})
              </Button>
            </HStack>
          </Box>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
};
