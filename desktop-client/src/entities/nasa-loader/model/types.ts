import type { NasaCatalogSyncRequest, NasaCatalogSyncResponse } from '@/shared/api';

export interface INasaLoaderRepository {
  syncCatalog(options?: NasaCatalogSyncRequest): Promise<NasaCatalogSyncResponse>;
}

export type { NasaCatalogSyncRequest, NasaCatalogSyncResponse };
