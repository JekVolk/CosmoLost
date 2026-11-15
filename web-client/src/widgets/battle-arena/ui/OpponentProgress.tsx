import { useMatchStore } from '@/entities/game';
import { Box, HStack, Text, VStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { Radio } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';

export interface OpponentProgressProps {
  hasOpponentSubmitted?: boolean;
}

export const OpponentProgress: React.FC<OpponentProgressProps> = ({
  hasOpponentSubmitted = false,
}) => {
  const opponent = useMatchStore((s) => s.opponent);
  const phase = useMatchStore((s) => s.phase);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    if (phase !== 'ROUND_ACTIVE') {
      setProgress(100);
      return;
    }

    if (hasOpponentSubmitted) {
      setProgress(100);
      return;
    }

    setProgress(20);
    const t1 = setTimeout(() => setProgress(55), 2500);
    const t2 = setTimeout(() => setProgress(85), 6000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [phase, hasOpponentSubmitted]);

  const opponentName = opponent?.callsign ?? 'Opponent';

  return (
    <Box
      w="100%"
      maxW="600px"
      mx="auto"
      px={4}
      py={2}
      bg="rgba(15, 23, 42, 0.6)"
      borderRadius="md"
      borderWidth="1px"
      borderColor="whiteAlpha.100"
    >
      <VStack gap={1} align="stretch">
        <HStack justify="space-between" align="center">
          <HStack gap={2} color="gray.400" fontSize="xs">
            <Radio size={13} className="animate-pulse" />
            <Text>{opponentName}&apos;s Telemetry Uplink</Text>
          </HStack>
          <Text
            fontSize="xs"
            fontFamily="mono"
            color={hasOpponentSubmitted ? 'green.400' : 'orange.300'}
          >
            {hasOpponentSubmitted ? 'LOCKED IN' : `${progress}% READY`}
          </Text>
        </HStack>

        <Box
          w="100%"
          h="4px"
          bg="whiteAlpha.200"
          borderRadius="full"
          overflow="hidden"
          position="relative"
        >
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              height: '100%',
              backgroundColor: hasOpponentSubmitted ? '#38A169' : '#ED8936',
              borderRadius: '9999px',
            }}
          />
        </Box>
      </VStack>
    </Box>
  );
};
