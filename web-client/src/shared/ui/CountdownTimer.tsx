import { Text, type TextProps } from '@chakra-ui/react';

export function formatSecondsToMMSS(seconds: number): string {
  const clamped = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(clamped / 60);
  const remainingSeconds = clamped % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export interface CountdownTimerProps extends TextProps {
  seconds: number;
}

export function CountdownTimer({ seconds, ...props }: CountdownTimerProps) {
  return (
    <Text fontFamily="mono" fontWeight="semibold" {...props}>
      {formatSecondsToMMSS(seconds)}
    </Text>
  );
}
