import type {
  EditorAssetBundle,
  PortalArtifactMediaDto,
  ScientificDiscoveryDto,
  TraverseWaypointDto,
} from '@/shared/api';
import { useQuery } from '@tanstack/react-query';
import { artifactRepository } from '../api/artifact-repository';
import type { ArtifactDomainModel } from './types';

export const ARTIFACT_QUERY_KEYS = {
  all: ['artifacts'] as const,
  featured: () => [...ARTIFACT_QUERY_KEYS.all, 'featured'] as const,
  detail: (id: string) => [...ARTIFACT_QUERY_KEYS.all, 'detail', id] as const,
  assets: (id: string) => [...ARTIFACT_QUERY_KEYS.all, 'assets', id] as const,
  waypoints: (id: string) => [...ARTIFACT_QUERY_KEYS.all, 'waypoints', id] as const,
  discoveries: (id: string) => [...ARTIFACT_QUERY_KEYS.all, 'discoveries', id] as const,
  media: (id: string) => [...ARTIFACT_QUERY_KEYS.all, 'media', id] as const,
};

export function useArtifactsQuery() {
  return useQuery<ArtifactDomainModel[]>({
    queryKey: ARTIFACT_QUERY_KEYS.featured(),
    queryFn: () => artifactRepository.listFeaturedArtifacts(),
    staleTime: 1000 * 60 * 10,
  });
}

export function useArtifactDetailsQuery(id: string) {
  return useQuery<ArtifactDomainModel>({
    queryKey: ARTIFACT_QUERY_KEYS.detail(id),
    queryFn: () => artifactRepository.getArtifactById(id),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 10,
  });
}

export function useArtifactAssetBundleQuery(id: string) {
  return useQuery<EditorAssetBundle>({
    queryKey: ARTIFACT_QUERY_KEYS.assets(id),
    queryFn: () => artifactRepository.getAssetBundle(id),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 10,
  });
}

export function useArtifactWaypointsQuery(id: string) {
  return useQuery<TraverseWaypointDto[]>({
    queryKey: ARTIFACT_QUERY_KEYS.waypoints(id),
    queryFn: () => artifactRepository.getArtifactWaypoints(id),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 10,
  });
}

export function useArtifactDiscoveriesQuery(id: string) {
  return useQuery<ScientificDiscoveryDto[]>({
    queryKey: ARTIFACT_QUERY_KEYS.discoveries(id),
    queryFn: () => artifactRepository.getArtifactDiscoveries(id),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 10,
  });
}

export function useArtifactMediaQuery(id: string) {
  return useQuery<PortalArtifactMediaDto[]>({
    queryKey: ARTIFACT_QUERY_KEYS.media(id),
    queryFn: () => artifactRepository.getArtifactMedia(id),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 10,
  });
}
