import { Box, HStack, Text } from '@chakra-ui/react';
import { CheckCircle2, ChevronRight, Layers, Mic, Rocket, Sparkles, Terminal } from 'lucide-react';
import type React from 'react';

interface StudioStepperProps {
  currentStage: number;
  onSelectStage: (stage: number) => void;
}

export const StudioStepper: React.FC<StudioStepperProps> = ({ currentStage, onSelectStage }) => {
  const steps = [
    {
      num: 1,
      label: 'Artifact Source',
      desc: 'NASA Data & 3D GLB',
      icon: Terminal,
      color: 'cyan.500',
    },
    {
      num: 2,
      label: 'Script & Cues',
      desc: 'SMM Rubric & Hook',
      icon: Sparkles,
      color: 'green.500',
    },
    { num: 3, label: 'Audio & Sync', desc: 'Cosmo TTS & Phonemes', icon: Mic, color: 'yellow.500' },
    {
      num: 4,
      label: 'Visual Composite',
      desc: '9:16 & Safe Zones',
      icon: Layers,
      color: 'purple.500',
    },
    {
      num: 5,
      label: 'Export & Publish',
      desc: 'Shorts, TG, TikTok',
      icon: Rocket,
      color: 'orange.500',
    },
  ];

  return (
    <Box
      bg="bg.panel"
      px="4"
      py="2.5"
      borderRadius="xl"
      borderWidth="1px"
      borderColor="border.subtle"
    >
      <HStack justify="space-between" align="center" wrap="wrap" gap="2">
        {steps.map((step, idx) => {
          const isCurrent = currentStage === step.num;
          const isDone = currentStage > step.num;

          return (
            <HStack key={step.num} gap="2" align="center">
              <Box
                px="3"
                py="1.5"
                borderRadius="lg"
                bg={isCurrent ? 'bg.subtle' : 'transparent'}
                borderWidth="1px"
                borderColor={isCurrent ? step.color : 'transparent'}
                cursor="pointer"
                tabIndex={0}
                aria-label={`Етап ${step.num}: ${step.label} (${step.desc})`}
                aria-current={isCurrent ? 'step' : undefined}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectStage(step.num);
                  }
                }}
                onClick={() => onSelectStage(step.num)}
                transition="all 0.15s ease"
                _hover={{ bg: 'bg.subtle' }}
              >
                <HStack gap="2">
                  <Box
                    w="20px"
                    h="20px"
                    borderRadius="full"
                    bg={isDone ? 'green.500' : isCurrent ? step.color : 'bg.surface'}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontSize="3xs"
                    fontWeight="bold"
                    color={isCurrent || isDone ? 'white' : 'fg.muted'}
                  >
                    {isDone ? <CheckCircle2 size={12} color="white" /> : step.num}
                  </Box>
                  <Box>
                    <Text
                      fontSize="xs"
                      fontWeight={isCurrent ? 'bold' : 'medium'}
                      color={isCurrent ? 'fg' : 'fg.muted'}
                      lineClamp={1}
                    >
                      {step.label}
                    </Text>
                    <Text fontSize="3xs" color="fg.muted" lineClamp={1}>
                      {step.desc}
                    </Text>
                  </Box>
                </HStack>
              </Box>

              {idx < steps.length - 1 && (
                <ChevronRight size={14} color="var(--chakra-colors-border-default)" />
              )}
            </HStack>
          );
        })}
      </HStack>
    </Box>
  );
};
