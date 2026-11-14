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
import { CheckCircle, Copy, Download, FileUp, HardDrive, Upload, XCircle } from 'lucide-react';
import type React from 'react';
import { useRef } from 'react';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <Card.Root p="5" bg="bg.panel" borderWidth="1px" borderColor="border.subtle" borderRadius="xl">
      <Card.Header p="0" mb="4">
        <HStack gap="2" align="center">
          <HardDrive size={18} color="#22c55e" />
          <Heading size="sm" color="fg">
            Native Store Import & Export
          </Heading>
        </HStack>
      </Card.Header>

      <Card.Body p="0">
        <VStack align="stretch" gap="4">
          <Text fontSize="sm" color="fg.muted">
            Export all client settings as portable JSON or restore your configuration from an
            existing backup file.
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
                Export Configuration
              </Text>
              <Badge variant="subtle" colorPalette="green" size="sm">
                JSON v1.0
              </Badge>
            </HStack>
            <HStack gap="3">
              <Button size="sm" variant="solid" colorPalette="green" onClick={onExport}>
                <Download size={14} />
                Download JSON File
              </Button>
              <Button size="sm" variant="outline" colorPalette="gray" onClick={onExport}>
                <Copy size={14} />
                Copy to Clipboard
              </Button>
            </HStack>
          </Box>

          <Separator borderColor="border.subtle" />

          {/* Import Actions */}
          <Box>
            <Flex justify="space-between" align="center" mb="2">
              <Text fontSize="sm" fontWeight="medium" color="fg">
                Import / Restore Configuration
              </Text>
              <Button
                size="xs"
                variant="outline"
                colorPalette="teal"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileUp size={14} />
                Upload .json file
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
              placeholder='Paste exported JSON here... e.g. {"settings": {"accentColor": "teal", ...}}'
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
                Validate & Apply Settings
              </Button>
            </HStack>
          </Box>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
};
