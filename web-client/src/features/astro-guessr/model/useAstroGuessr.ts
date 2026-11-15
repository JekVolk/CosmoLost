import { useMatchStore } from '@/entities/game';
import { wsClient } from '@/shared/api/ws-client';
import { useCallback, useEffect, useState } from 'react';

export interface GeoCoordinates {
  lat: number;
  lon: number;
}

export interface AstroGuessrPayload {
  map_url?: string;
  media_url?: string;
  planet?: 'MARS' | 'MOON' | string;
  hint?: string;
}

export function useAstroGuessr() {
  const currentRound = useMatchStore((s) => s.current_round);
  const [pin, setPinState] = useState<GeoCoordinates | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const payload = (currentRound?.payload ?? {}) as AstroGuessrPayload;

  const roundIndex = currentRound?.round_index;

  // Reset local state when round changes
  useEffect(() => {
    if (roundIndex !== undefined) {
      setPinState(null);
      setIsSubmitted(false);
    }
  }, [roundIndex]);

  const setPin = useCallback(
    (coords: GeoCoordinates | null) => {
      if (isSubmitted) return;
      setPinState(coords);
    },
    [isSubmitted],
  );

  const submit = useCallback(() => {
    if (!pin || isSubmitted) return;
    setIsSubmitted(true);
    wsClient.send('submit_guess', {
      latitude: pin.lat,
      longitude: pin.lon,
    });
  }, [pin, isSubmitted]);

  return {
    pin,
    setPin,
    isSubmitted,
    submit,
    payload,
    timeLimitSec: currentRound?.time_limit_sec ?? 60,
  };
}
