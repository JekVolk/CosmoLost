import { useMatchStore } from '@/entities/game';
import { wsClient } from '@/shared/api/ws-client';
import { useCallback, useEffect, useMemo, useState } from 'react';

export interface ReferenceObject {
  id: string;
  name: string;
  mass_kg: number;
  icon?: string;
}

export interface StatGuesserPayload {
  spacecraft_name?: string;
  spacecraft_image_url?: string;
  reference_objects?: ReferenceObject[];
}

export type StatGuesserFeedback = 'spacecraft_heavier' | 'objects_heavier' | 'balanced' | null;

const DEFAULT_REFERENCE_OBJECTS: ReferenceObject[] = [
  { id: 'car', name: 'Passenger car', mass_kg: 1500, icon: '🚗' },
  { id: 'elephant', name: 'African elephant', mass_kg: 5000, icon: '🐘' },
  { id: 'washing_machine', name: 'Washing machine', mass_kg: 70, icon: '🧺' },
  { id: 'refrigerator', name: 'Refrigerator', mass_kg: 85, icon: '🧊' },
  { id: 'piano', name: 'Piano', mass_kg: 400, icon: '🎹' },
  { id: 'bus', name: 'City bus', mass_kg: 12000, icon: '🚌' },
  { id: 'school_bus', name: 'School bus', mass_kg: 9000, icon: '🚍' },
  { id: 'bicycle', name: 'Bicycle', mass_kg: 15, icon: '🚲' },
];

export function useStatGuesser() {
  const currentRound = useMatchStore((s) => s.current_round);
  const [selectedObjectIds, setSelectedObjectIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<StatGuesserFeedback>(null);
  const [attempts, setAttempts] = useState<number>(0);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [canEdit, setCanEdit] = useState<boolean>(true);
  const [isRoundOver, setIsRoundOver] = useState<boolean>(false);

  const payload = (currentRound?.payload ?? {}) as StatGuesserPayload;
  const referenceObjects =
    payload.reference_objects && payload.reference_objects.length > 0
      ? payload.reference_objects
      : DEFAULT_REFERENCE_OBJECTS;

  const objectMap = useMemo(
    () => new Map(referenceObjects.map((obj) => [obj.id, obj])),
    [referenceObjects],
  );

  const roundIndex = currentRound?.round_index;

  // Reset state on round change
  useEffect(() => {
    if (roundIndex !== undefined) {
      setSelectedObjectIds([]);
      setFeedback(null);
      setAttempts(0);
      setIsChecking(false);
      setCanEdit(true);
      setIsRoundOver(false);
    }
  }, [roundIndex]);

  // Subscribe to WS feedback and ready events
  useEffect(() => {
    const unsubFeedback = wsClient.on('stat_guesser.feedback', (data: unknown) => {
      const msg = data as { feedback?: StatGuesserFeedback };
      if (msg?.feedback) {
        setFeedback(msg.feedback);
        setIsChecking(false);
        if (msg.feedback === 'balanced') {
          setIsRoundOver(true);
          setCanEdit(false);
        }
      }
    });

    const unsubReady = wsClient.on('stat_guesser.ready', () => {
      setFeedback(null);
      setCanEdit(true);
      setIsChecking(false);
    });

    return () => {
      unsubFeedback();
      unsubReady();
    };
  }, []);

  const currentTotalMassKg = useMemo(() => {
    return selectedObjectIds.reduce((sum, id) => {
      const obj = objectMap.get(id);
      return sum + (obj?.mass_kg ?? 0);
    }, 0);
  }, [selectedObjectIds, objectMap]);

  const toggleObject = useCallback(
    (id: string) => {
      if (!canEdit || isChecking || isRoundOver) return;
      setSelectedObjectIds((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
      );
    },
    [canEdit, isChecking, isRoundOver],
  );

  const addObject = useCallback(
    (id: string) => {
      if (!canEdit || isChecking || isRoundOver) return;
      setSelectedObjectIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    },
    [canEdit, isChecking, isRoundOver],
  );

  const removeObject = useCallback(
    (id: string) => {
      if (!canEdit || isChecking || isRoundOver) return;
      setSelectedObjectIds((prev) => prev.filter((item) => item !== id));
    },
    [canEdit, isChecking, isRoundOver],
  );

  const check = useCallback(() => {
    if (!canEdit || isChecking || isRoundOver || selectedObjectIds.length === 0) return;
    setIsChecking(true);
    setCanEdit(false);
    setAttempts((prev) => prev + 1);

    // CRITICAL: client only sends object_ids, never mass or comparison operator!
    wsClient.send('stat_guesser_check', {
      object_ids: selectedObjectIds,
    });
  }, [canEdit, isChecking, isRoundOver, selectedObjectIds]);

  const continueAttempt = useCallback(() => {
    if (isRoundOver) return;
    setIsChecking(true);
    wsClient.send('stat_guesser_continue', {});
  }, [isRoundOver]);

  const stopAttempt = useCallback(() => {
    setIsRoundOver(true);
    setCanEdit(false);
    wsClient.send('stat_guesser_stop', {});
  }, []);

  // For testing purposes or manual feedback simulation
  const applyFeedback = useCallback((fb: StatGuesserFeedback) => {
    setFeedback(fb);
    setIsChecking(false);
    if (fb === 'balanced') {
      setIsRoundOver(true);
      setCanEdit(false);
    }
  }, []);

  const readyNextAttempt = useCallback(() => {
    setFeedback(null);
    setCanEdit(true);
    setIsChecking(false);
  }, []);

  return {
    selectedObjectIds,
    referenceObjects,
    currentTotalMassKg,
    feedback,
    attempts,
    isChecking,
    canEdit,
    isRoundOver,
    spacecraftName: payload.spacecraft_name || 'Perseverance rover',
    spacecraftImageUrl: payload.spacecraft_image_url,
    toggleObject,
    addObject,
    removeObject,
    check,
    continueAttempt,
    stopAttempt,
    applyFeedback,
    readyNextAttempt,
  };
}
