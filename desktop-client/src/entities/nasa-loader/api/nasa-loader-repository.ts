import type {
  INasaLoaderRepository,
  NasaCatalogSyncRequest,
  NasaCatalogSyncResponse,
} from '../model/types';
import { nasaLoaderApi } from './nasa-loader-api';

export class NasaLoaderRepository implements INasaLoaderRepository {
  async syncCatalog(options?: NasaCatalogSyncRequest): Promise<NasaCatalogSyncResponse> {
    return nasaLoaderApi.syncCatalog(options);
  }
}

export const nasaLoaderRepository = new NasaLoaderRepository();
