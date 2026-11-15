import { portalApiClient } from '@/shared/api';
import type { CelestialBodyDto } from '../model/types';

export const celestialBodyApi = {
  async getAll(): Promise<CelestialBodyDto[]> {
    return portalApiClient.getCelestialBodies();
  },

  async getById(id: string): Promise<CelestialBodyDto> {
    return portalApiClient.getCelestialBodyById(id);
  },
};
