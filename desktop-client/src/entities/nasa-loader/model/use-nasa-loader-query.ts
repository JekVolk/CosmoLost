import { useMutation } from '@tanstack/react-query';
import { nasaLoaderRepository } from '../api/nasa-loader-repository';
import type { NasaCatalogSyncRequest, NasaCatalogSyncResponse } from './types';

export function useSyncNasaCatalogMutation() {
  return useMutation<NasaCatalogSyncResponse, Error, NasaCatalogSyncRequest | undefined>({
    mutationFn: (options) => nasaLoaderRepository.syncCatalog(options),
  });
}
