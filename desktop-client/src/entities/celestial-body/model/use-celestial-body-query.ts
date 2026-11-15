import { useQuery } from '@tanstack/react-query';
import { celestialBodyRepository } from '../api/celestial-body-repository';
import type { CelestialBodyDomainModel } from './types';

export const CELESTIAL_BODY_QUERY_KEYS = {
  all: ['celestial-bodies'] as const,
  list: () => [...CELESTIAL_BODY_QUERY_KEYS.all, 'list'] as const,
  detail: (id: string) => [...CELESTIAL_BODY_QUERY_KEYS.all, 'detail', id] as const,
};

export function useCelestialBodiesQuery() {
  return useQuery<CelestialBodyDomainModel[]>({
    queryKey: CELESTIAL_BODY_QUERY_KEYS.list(),
    queryFn: () => celestialBodyRepository.listCelestialBodies(),
    staleTime: 1000 * 60 * 60, // 1 hour cache
  });
}

export function useCelestialBodyDetailQuery(id: string) {
  return useQuery<CelestialBodyDomainModel>({
    queryKey: CELESTIAL_BODY_QUERY_KEYS.detail(id),
    queryFn: () => celestialBodyRepository.getCelestialBodyById(id),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 60,
  });
}
