import type { TaskType } from '@/entities/scheduler';
import { useSettingsStore } from '@/entities/settings';
import { Box, Button, Card, HStack, Heading, Input, Text, VStack } from '@/shared/ui';
import { PlusCircle } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

interface CreateTaskModalProps {
  onCreateTask: (name: string, type: TaskType, intervalSec: number) => void;
}

const TASK_TYPE_OPTIONS: { id: TaskType; label: string }[] = [
  { id: 'ping', label: 'Rust IPC Ping / Echo' },
  { id: 'system-info', label: 'Hardware & OS Metrics' },
  { id: 'cache-clean', label: 'Memory / Cache GC' },
  { id: 'custom', label: 'Custom Diagnostic Routine' },
];

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ onCreateTask }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<TaskType>('ping');
  const [intervalSec, setIntervalSec] = useState(10);
  const accentColor = useSettingsStore((state) => state.settings.accentColor);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreateTask(name.trim(), type, Math.max(2, intervalSec));
    setName('');
    setType('ping');
    setIntervalSec(10);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <Button size="sm" variant="solid" colorPalette={accentColor} onClick={() => setIsOpen(true)}>
        <PlusCircle size={16} />
        Add Scheduled Routine
      </Button>
    );
  }

  return (
    <Card.Root p="5" bg="bg.panel" borderWidth="1px" borderColor="border.subtle" borderRadius="xl">
      <Card.Header p="0" mb="3">
        <Heading size="sm" color="fg">
          Configure New Scheduled Routine
        </Heading>
      </Card.Header>
      <Card.Body p="0">
        <form onSubmit={handleSubmit}>
          <VStack align="stretch" gap="3">
            <Box>
              <Text fontSize="xs" color="fg.muted" mb="1">
                Routine Name
              </Text>
              <Input
                size="sm"
                placeholder="e.g. Periodic Network Ping"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Box>

            <Box>
              <Text fontSize="xs" color="fg.muted" mb="1">
                Routine Type
              </Text>
              <HStack gap="2" wrap="wrap">
                {TASK_TYPE_OPTIONS.map((opt) => (
                  <Button
                    key={opt.id}
                    type="button"
                    size="xs"
                    variant={type === opt.id ? 'solid' : 'outline'}
                    colorPalette={accentColor}
                    onClick={() => setType(opt.id)}
                  >
                    {opt.label}
                  </Button>
                ))}
              </HStack>
            </Box>

            <Box>
              <Text fontSize="xs" color="fg.muted" mb="1">
                Interval (Seconds, min: 2s)
              </Text>
              <HStack gap="2">
                {[5, 10, 15, 30, 60].map((sec) => (
                  <Button
                    key={sec}
                    type="button"
                    size="xs"
                    variant={intervalSec === sec ? 'solid' : 'subtle'}
                    colorPalette={accentColor}
                    onClick={() => setIntervalSec(sec)}
                  >
                    {sec}s
                  </Button>
                ))}
                <Input
                  type="number"
                  size="xs"
                  width="80px"
                  min={2}
                  max={86400}
                  value={intervalSec}
                  onChange={(e) => setIntervalSec(Number(e.target.value))}
                />
              </HStack>
            </Box>

            <HStack justify="flex-end" gap="2" mt="2">
              <Button type="button" size="xs" variant="ghost" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                size="xs"
                variant="solid"
                colorPalette={accentColor}
                disabled={!name.trim()}
              >
                Save & Start Routine
              </Button>
            </HStack>
          </VStack>
        </form>
      </Card.Body>
    </Card.Root>
  );
};
