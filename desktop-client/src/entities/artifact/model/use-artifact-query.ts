import { useQuery } from '@tanstack/react-query';
import { artifactRepository } from '../api/artifact-repository';
import type { ArtifactDomainModel } from './types';

export function useArtifactsQuery() {
  return useQuery<ArtifactDomainModel[]>({
    queryKey: ['artifacts', 'featured'],
    queryFn: () => artifactRepository.listFeaturedArtifacts(),
    staleTime: 1000 * 60 * 10,
  });
}

export function useArtifactDetailsQuery(id: string) {
  return useQuery<ArtifactDomainModel>({
    queryKey: ['artifact', id],
    queryFn: () => artifactRepository.getArtifactById(id),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 10,
  });
}
