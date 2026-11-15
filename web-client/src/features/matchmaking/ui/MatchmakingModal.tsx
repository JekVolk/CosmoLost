import { useMatchStore } from '@/entities/game';
import { wsClient } from '@/shared/api/ws-client';
import { Box, Button, Heading, Text, VStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import type React from 'react';
import { useEffect, useState } from 'react';

interface MatchmakingModalProps {
  isOpen?: boolean;
  onCancel?: () => void;
}

export const MatchmakingModal: React.FC<MatchmakingModalProps> = ({ isOpen, onCancel }) => {
  const phase = useMatchStore((s) => s.phase);
  const opponent = useMatchStore((s) => s.opponent);
  const reset = useMatchStore((s) => s.reset);
  const [seconds, setSeconds] = useState(0);

  const isVisible = isOpen !== undefined ? isOpen && phase === 'SEARCHING' : phase === 'SEARCHING';

  useEffect(() => {
    if (!isVisible) {
      setSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible]);

  const handleCancel = () => {
    try {
      wsClient.disconnect();
    } catch {}
    reset();
    if (onCancel) {
      onCancel();
    }
  };

  // Modal automatically closes when phase is no longer SEARCHING (e.g. IN_MATCH)
  if (!isVisible) {
    return null;
  }

  const isBotFallback = seconds >= 8 || opponent?.is_bot === true;

  return (
    <Box
      position="fixed"
      inset={0}
      zIndex={1400}
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="rgba(0, 0, 0, 0.75)"
      backdropFilter="blur(8px)"
      p={4}
    >
      <VStack
        gap={6}
        p={8}
        bg="gray.900"
        borderRadius="2xl"
        border="1px solid"
        borderColor="blue.500"
        boxShadow="0 0 32px rgba(66, 153, 225, 0.3)"
        maxW="400px"
        w="100%"
        textAlign="center"
      >
        <Heading size="lg" color="white">
          Finding Opponent
        </Heading>

        {/* Pulsating radar circle with Framer Motion */}
        <Box
          position="relative"
          w="140px"
          h="140px"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'easeInOut',
            }}
            style={{
              position: 'absolute',
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              border: '2px solid #3182CE',
              backgroundColor: 'rgba(49, 130, 206, 0.15)',
            }}
          />
          <motion.div
            animate={{
              scale: [1, 1.35, 1],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 2,
              delay: 0.3,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'easeInOut',
            }}
            style={{
              position: 'absolute',
              width: '140px',
              height: '140px',
              borderRadius: '50%',
              border: '1px dashed #63B3ED',
            }}
          />

          <Box zIndex={1} textAlign="center">
            <Text fontSize="2xl" fontWeight="bold" color="blue.300">
              {seconds}s
            </Text>
            <Text fontSize="2xs" color="gray.400" textTransform="uppercase" letterSpacing="wider">
              SEARCHING
            </Text>
          </Box>
        </Box>

        <VStack gap={1}>
          <Text color="gray.300" fontSize="sm">
            {isBotFallback
              ? 'Pairing autonomous drone opponent (Bot)...'
              : 'Scanning orbital telemetry for match...'}
          </Text>
          <Text color="gray.500" fontSize="xs">
            {seconds <= 8
              ? `Maximum wait time: 8s (${8 - Math.min(seconds, 8)}s remaining)`
              : 'Connecting to match session...'}
          </Text>
        </VStack>

        <Button
          size="sm"
          variant="outline"
          colorPalette="red"
          cursor="pointer"
          onClick={handleCancel}
          style={{
            borderColor: 'rgba(239, 68, 68, 0.5)',
            color: '#f87171',
            borderRadius: '10px',
            padding: '6px 16px',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          Cancel Search
        </Button>
      </VStack>
    </Box>
  );
};
