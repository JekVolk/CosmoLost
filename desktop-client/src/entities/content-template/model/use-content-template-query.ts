import { useMutation, useQuery } from '@tanstack/react-query';
import { contentTemplateRepository } from '../api/content-template-repository';
import type {
  ContentTemplate,
  EditorAssetBundle,
  NasaCatalogSyncRequest,
  NasaCatalogSyncResponse,
  RecommendNextTopicRequest,
  RecommendNextTopicResponse,
} from './types';

export const CONTENT_TEMPLATE_QUERY_KEYS = {
  all: ['content-templates'] as const,
  lists: () => [...CONTENT_TEMPLATE_QUERY_KEYS.all, 'list'] as const,
  detail: (id: string) => [...CONTENT_TEMPLATE_QUERY_KEYS.all, 'detail', id] as const,
  assetBundle: (artifactId: string) => ['editor', 'asset-bundle', artifactId] as const,
};

export function useContentTemplatesQuery() {
  return useQuery<ContentTemplate[]>({
    queryKey: CONTENT_TEMPLATE_QUERY_KEYS.lists(),
    queryFn: () => contentTemplateRepository.listTemplates(),
    staleTime: 1000 * 60 * 30, // 30 minutes cache
  });
}

export function useContentTemplateDetailQuery(id: string) {
  return useQuery<ContentTemplate>({
    queryKey: CONTENT_TEMPLATE_QUERY_KEYS.detail(id),
    queryFn: () => contentTemplateRepository.getTemplateById(id),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 30,
  });
}

export function useEditorAssetBundleQuery(artifactId: string) {
  return useQuery<EditorAssetBundle>({
    queryKey: CONTENT_TEMPLATE_QUERY_KEYS.assetBundle(artifactId),
    queryFn: () => contentTemplateRepository.getAssetBundle(artifactId),
    enabled: Boolean(artifactId),
    staleTime: 1000 * 60 * 15,
  });
}

export function useRecommendNextTopicMutation() {
  return useMutation<RecommendNextTopicResponse, Error, RecommendNextTopicRequest>({
    mutationFn: (request) => contentTemplateRepository.recommendNextTopic(request),
  });
}

export function useSyncNasaCatalogMutation() {
  return useMutation<NasaCatalogSyncResponse, Error, NasaCatalogSyncRequest | undefined>({
    mutationFn: (options) => contentTemplateRepository.syncNasaCatalog(options),
  });
}
