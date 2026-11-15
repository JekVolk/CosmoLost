import { useMutation, useQuery } from '@tanstack/react-query';
import { communityPublicationRepository } from '../api/community-publication-repository';
import type {
  CommunityPublicationDomainModel,
  CreateCommunityPublicationRequest,
  CreateCommunityPublicationResponse,
} from './types';

export const COMMUNITY_PUBLICATION_QUERY_KEYS = {
  all: ['community-publications'] as const,
  list: (params?: { missionId?: string; artifactId?: string; platformType?: string }) =>
    [
      ...COMMUNITY_PUBLICATION_QUERY_KEYS.all,
      'list',
      params?.missionId ?? 'all',
      params?.artifactId ?? 'all',
      params?.platformType ?? 'all',
    ] as const,
};

export function useCommunityPublicationsQuery(params?: {
  missionId?: string;
  artifactId?: string;
  platformType?: string;
}) {
  return useQuery<CommunityPublicationDomainModel[]>({
    queryKey: COMMUNITY_PUBLICATION_QUERY_KEYS.list(params),
    queryFn: () => communityPublicationRepository.listApprovedPublications(params),
    staleTime: 1000 * 60 * 15,
  });
}

export function useSubmitCommunityPublicationMutation() {
  return useMutation<CreateCommunityPublicationResponse, Error, CreateCommunityPublicationRequest>({
    mutationFn: (data) => communityPublicationRepository.submitPublication(data),
  });
}
