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
  Copy,
  Download,
  FileUp,
  HardDrive,
  ShieldCheck,
  Upload,
  XCircle,
} from 'lucide-react';
import type React from 'react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface SettingsImportExportCardProps {
  importText: string;
  feedback: {
    type: 'success' | 'error' | null;
    message: string;
  };
  onImportTextChange: (text: string) => void;
  onExport: () => void;
  onImport: () => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SettingsImportExportCard: React.FC<SettingsImportExportCardProps> = ({
  importText,
  feedback,
  onImportTextChange,
  onExport,
  onImport,
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
              {t('settings.nativeStoreImportExport')}
            </Heading>
          </HStack>
          <HStack gap="1.5">
            <ShieldCheck size={16} color="#38bdf8" />
            <Badge colorPalette="cyan" variant="surface" size="xs">
              Zod Schema Validated
            </Badge>
          </HStack>
        </HStack>
      </Card.Header>

      <Card.Body p="0">
        <VStack align="stretch" gap="4">
          <Text fontSize="sm" color="fg.muted">
            {t('settings.importExportDesc')}
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
                JSON v1.0
              </Badge>
            </HStack>
            <HStack gap="3">
              <Button size="sm" variant="solid" colorPalette="green" onClick={onExport}>
                <Download size={14} />
                {t('settings.downloadJson')}
              </Button>
              <Button size="sm" variant="outline" colorPalette="gray" onClick={onExport}>
                <Copy size={14} />
                {t('settings.copyClipboard')}
              </Button>
            </HStack>
          </Box>

          <Separator borderColor="border.subtle" />

          {/* Import Actions */}
          <Box>
            <Flex justify="space-between" align="center" mb="2">
              <Text fontSize="sm" fontWeight="medium" color="fg">
                {t('settings.importRestore')}
              </Text>
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
            </Flex>

            <Textarea
              placeholder={t('settings.pastePlaceholder')}
              value={importText}
              onChange={(e) => onImportTextChange(e.target.value)}
              rows={3}
              fontSize="xs"
              fontFamily="mono"
              mb="3"
              borderColor="border.subtle"
            />

            <HStack justify="flex-end" gap="2">
              <Button
                size="sm"
                variant="solid"
                colorPalette="teal"
                onClick={onImport}
                disabled={!importText.trim()}
              >
                <Upload size={14} />
                {t('settings.validateApply')}
              </Button>
            </HStack>
          </Box>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
};
