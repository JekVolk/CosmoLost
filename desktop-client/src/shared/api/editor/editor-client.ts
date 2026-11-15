import { axiosClient } from '../http';
import type {
  ContentTemplate,
  EditorAssetBundle,
  NasaCatalogSyncRequest,
  NasaCatalogSyncResponse,
  RecommendNextTopicRequest,
  RecommendNextTopicResponse,
} from './types';

export const editorApiClient = {
  /**
   * GET /api/v1/editor/templates/
   * Fetches list of SMM rubric configurations & timeline structures
   */
  async getTemplates(): Promise<ContentTemplate[]> {
    return axiosClient.get<ContentTemplate[]>('/api/v1/editor/templates/');
  },

  /**
   * GET /api/v1/editor/templates/{id}/
   * Fetches details of a specific rubric template
   */
  async getTemplateById(id: string): Promise<ContentTemplate> {
    return axiosClient.get<ContentTemplate>(`/api/v1/editor/templates/${id}/`);
  },

  /**
   * GET /api/v1/editor/artifacts/{id}/assets/
   * Assembles production media & text asset bundle for desktop editor
   */
  async getArtifactAssetBundle(id: string): Promise<EditorAssetBundle> {
    return axiosClient.get<EditorAssetBundle>(`/api/v1/editor/artifacts/${id}/assets/`);
  },

  /**
   * POST /api/v1/editor/recommend-next-topic/
   * Smart Next Topic Engine for serialized content creation
   */
  async recommendNextTopic(
    request: RecommendNextTopicRequest,
  ): Promise<RecommendNextTopicResponse> {
    return axiosClient.post<RecommendNextTopicResponse>(
      '/api/v1/editor/recommend-next-topic/',
      request,
    );
  },

  /**
   * POST /api/v1/loader/sync-nasa-catalog/
   * Background administrative ingestion sync
   */
  async syncNasaCatalog(options?: NasaCatalogSyncRequest): Promise<NasaCatalogSyncResponse> {
    return axiosClient.post<NasaCatalogSyncResponse>(
      '/api/v1/loader/sync-nasa-catalog/',
      options ?? {},
    );
  },
};
