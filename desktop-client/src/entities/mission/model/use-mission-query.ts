import { useQuery } from '@tanstack/react-query';
import { missionRepository } from '../api/mission-repository';
import type { MissionDomainModel } from './types';

export const MISSION_QUERY_KEYS = {
  all: ['missions'] as const,
  list: (agency?: string) => [...MISSION_QUERY_KEYS.all, 'list', agency ?? 'all'] as const,
  detail: (id: string) => [...MISSION_QUERY_KEYS.all, 'detail', id] as const,
};

export function useMissionsQuery(agency?: string) {
  return useQuery<MissionDomainModel[]>({
    queryKey: MISSION_QUERY_KEYS.list(agency),
    queryFn: () => missionRepository.listMissions(agency),
    staleTime: 1000 * 60 * 30,
  });
}

export function useMissionDetailQuery(id: string) {
  return useQuery<MissionDomainModel>({
    queryKey: MISSION_QUERY_KEYS.detail(id),
    queryFn: () => missionRepository.getMissionById(id),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 30,
  });
}
