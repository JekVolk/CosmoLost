import { editorApiClient } from '@/shared/api';
import type { NasaCatalogSyncRequest, NasaCatalogSyncResponse } from '../model/types';

export const nasaLoaderApi = {
  async syncCatalog(options?: NasaCatalogSyncRequest): Promise<NasaCatalogSyncResponse> {
    return editorApiClient.syncNasaCatalog(options);
  },
};
