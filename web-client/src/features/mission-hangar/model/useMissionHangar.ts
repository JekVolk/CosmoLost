import { useMatchStore } from '@/entities/game';
import { wsClient } from '@/shared/api/ws-client';
import { useCallback, useEffect, useState } from 'react';

export interface MissionComponent {
  id: string;
  name: string;
  icon?: string;
  description?: string;
}

export interface MissionHangarPayload {
  components?: MissionComponent[];
  categories?: string[];
}

const DEFAULT_CATEGORIES = ['Science', 'Propulsion', 'Communication', 'Power'];
const DEFAULT_COMPONENTS: MissionComponent[] = [
  { id: 'rtg', name: 'Radioisotope Thermoelectric Generator (RTG)', icon: '⚛️' },
  { id: 'mast_cam', name: 'MastCam (Mast Camera)', icon: '📷' },
  { id: 'sky_crane', name: 'Sky Crane', icon: '🚀' },
  { id: 'hga_antenna', name: 'High-Gain Antenna (HGA)', icon: '📡' },
  { id: 'spectrometer', name: 'APXS Spectrometer', icon: '🔬' },
  { id: 'solar_array', name: 'UltraFlex Solar Arrays', icon: '☀️' },
];

export function useMissionHangar() {
  const currentRound = useMatchStore((s) => s.current_round);
  const [grouping, setGrouping] = useState<Record<string, string[]>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const payload = (currentRound?.payload ?? {}) as MissionHangarPayload;
  const categories =
    payload.categories && payload.categories.length > 0 ? payload.categories : DEFAULT_CATEGORIES;
  const components =
    payload.components && payload.components.length > 0 ? payload.components : DEFAULT_COMPONENTS;

  const roundIndex = currentRound?.round_index;

  // Initialize grouping empty for categories
  useEffect(() => {
    if (roundIndex !== undefined || categories.length > 0) {
      const initial: Record<string, string[]> = {};
      for (const cat of categories) {
        initial[cat] = [];
      }
      setGrouping(initial);
      setIsSubmitted(false);
    }
  }, [categories, roundIndex]);

  // Compute unassigned component IDs
  const assignedIds = new Set(Object.values(grouping).flat());
  const unassignedComponents = components.filter((c) => !assignedIds.has(c.id));

  const moveComponent = useCallback(
    (componentId: string, targetCategory: string) => {
      if (isSubmitted) return;

      setGrouping((prev) => {
        const next: Record<string, string[]> = {};
        for (const cat of categories) {
          next[cat] = (prev[cat] || []).filter((id) => id !== componentId);
        }

        if (categories.includes(targetCategory)) {
          next[targetCategory] = [...(next[targetCategory] || []), componentId];
        }

        return next;
      });
    },
    [categories, isSubmitted],
  );

  const removeFromCategory = useCallback(
    (componentId: string) => {
      if (isSubmitted) return;
      setGrouping((prev) => {
        const next: Record<string, string[]> = {};
        for (const cat of categories) {
          next[cat] = (prev[cat] || []).filter((id) => id !== componentId);
        }
        return next;
      });
    },
    [categories, isSubmitted],
  );

  const submit = useCallback(() => {
    if (isSubmitted) return;
    setIsSubmitted(true);
    wsClient.send('drag_drop', { grouping });
  }, [grouping, isSubmitted]);

  return {
    grouping,
    categories,
    components,
    unassignedComponents,
    moveComponent,
    removeFromCategory,
    isSubmitted,
    submit,
    timeLimitSec: currentRound?.time_limit_sec ?? 60,
  };
}
