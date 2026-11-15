import { editorApiClient } from '@/shared/api';
import type {
  ContentTemplate,
  EditorAssetBundle,
  NasaCatalogSyncRequest,
  NasaCatalogSyncResponse,
  RecommendNextTopicRequest,
  RecommendNextTopicResponse,
} from '../model/types';

export const contentTemplateApi = {
  async getTemplates(): Promise<ContentTemplate[]> {
    return editorApiClient.getTemplates();
  },

  async getTemplateById(id: string): Promise<ContentTemplate> {
    return editorApiClient.getTemplateById(id);
  },

  async getAssetBundle(artifactId: string): Promise<EditorAssetBundle> {
    return editorApiClient.getArtifactAssetBundle(artifactId);
  },

  async recommendNextTopic(
    request: RecommendNextTopicRequest,
  ): Promise<RecommendNextTopicResponse> {
    return editorApiClient.recommendNextTopic(request);
  },

  async syncNasaCatalog(options?: NasaCatalogSyncRequest): Promise<NasaCatalogSyncResponse> {
    return editorApiClient.syncNasaCatalog(options);
  },
};
