import type {
  ContentTemplate,
  EditorAssetBundle,
  NasaCatalogSyncRequest,
  NasaCatalogSyncResponse,
  RecommendNextTopicRequest,
  RecommendNextTopicResponse,
  SafeZonePreset,
  SlideStructureItem,
  SlideStructureType,
} from '@/shared/api';

export interface IContentTemplateRepository {
  listTemplates(): Promise<ContentTemplate[]>;
  getTemplateById(id: string): Promise<ContentTemplate>;
  getAssetBundle(artifactId: string): Promise<EditorAssetBundle>;
  recommendNextTopic(request: RecommendNextTopicRequest): Promise<RecommendNextTopicResponse>;
  syncNasaCatalog(options?: NasaCatalogSyncRequest): Promise<NasaCatalogSyncResponse>;
}

export type {
  ContentTemplate,
  EditorAssetBundle,
  NasaCatalogSyncRequest,
  NasaCatalogSyncResponse,
  RecommendNextTopicRequest,
  RecommendNextTopicResponse,
  SafeZonePreset,
  SlideStructureItem,
  SlideStructureType,
};
