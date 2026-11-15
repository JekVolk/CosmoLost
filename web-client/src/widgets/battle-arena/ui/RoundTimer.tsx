import { useMatchStore } from '@/entities/game';
import { playSfx } from '@/shared/lib';
import { CountdownTimer } from '@/shared/ui';
import { Box, HStack, Text } from '@chakra-ui/react';
import { Clock } from 'lucide-react';
import type React from 'react';
import { useEffect } from 'react';

export interface RoundTimerProps {
  className?: string;
}

export const RoundTimer: React.FC<RoundTimerProps> = ({ className }) => {
  const roundTimerSec = useMatchStore((s) => s.round_timer_sec);

  useEffect(() => {
    const interval = setInterval(() => {
      useMatchStore.getState().tickTimer();
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (roundTimerSec <= 5 && roundTimerSec > 0) {
      playSfx('timer_tick', 0.5);
    }
  }, [roundTimerSec]);

  const isLowTime = roundTimerSec <= 10 && roundTimerSec > 0;

  return (
    <HStack
      gap={2}
      px={3}
      py={1}
      bg="rgba(15, 23, 42, 0.75)"
      borderWidth="1px"
      borderColor={isLowTime ? 'red.500' : 'blue.500'}
      borderRadius="full"
      color={isLowTime ? 'red.400' : 'cyan.300'}
      className={className}
      align="center"
    >
      <Clock size={16} />
      <Box>
        <CountdownTimer
          seconds={roundTimerSec}
          fontSize="md"
          color={isLowTime ? 'red.400' : 'cyan.300'}
        />
      </Box>
      {isLowTime && (
        <Text fontSize="xs" fontWeight="bold" color="red.400" textTransform="uppercase">
          Hurry!
        </Text>
      )}
    </HStack>
  );
};
