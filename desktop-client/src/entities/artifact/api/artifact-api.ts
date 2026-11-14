import { nasaApi } from '@/shared/api';
import type { NasaAssetPackage } from '@/shared/api';

export const artifactApi = {
  async getCatalog(): Promise<NasaAssetPackage[]> {
    return nasaApi.listCatalogArtifacts();
  },

  async getById(id: string): Promise<NasaAssetPackage> {
    return nasaApi.getArtifactAssets(id);
  },
};
