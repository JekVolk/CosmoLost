import { useMatchStore } from '@/entities/game';
import { wsClient } from '@/shared/api/ws-client';
import { useCallback, useEffect, useState } from 'react';

export interface TelemetryPoint {
  sol: number;
  power_wh: number;
  dust_tau: number;
  tilt_deg: number;
}

export interface ForensicSolPayload {
  question?: string;
  telemetry?: TelemetryPoint[];
  options?: string[];
}

export function useForensicSol() {
  const currentRound = useMatchStore((s) => s.current_round);
  const [selected, setSelectedState] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const payload = (currentRound?.payload ?? {}) as ForensicSolPayload;

  const roundIndex = currentRound?.round_index;

  // Reset local state when round changes
  useEffect(() => {
    if (roundIndex !== undefined) {
      setSelectedState(null);
      setIsSubmitted(false);
    }
  }, [roundIndex]);

  const select = useCallback(
    (option: string) => {
      if (isSubmitted) return;
      setSelectedState(option);
    },
    [isSubmitted],
  );

  const submit = useCallback(() => {
    if (!selected || isSubmitted) return;
    setIsSubmitted(true);
    wsClient.send('buzzer_click', {
      selected_id: selected,
      answer: selected,
    });
  }, [selected, isSubmitted]);

  return {
    selected,
    select,
    isSubmitted,
    submit,
    payload,
    timeLimitSec: currentRound?.time_limit_sec ?? 45,
  };
}
