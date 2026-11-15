import { portalApiClient } from '@/shared/api';
import type { MissionDto } from '../model/types';

export const missionApi = {
  async list(agency?: string): Promise<MissionDto[]> {
    const res = await portalApiClient.listMissions({ agency, limit: 50 });
    return res.results;
  },

  async getById(id: string): Promise<MissionDto> {
    return portalApiClient.getMissionById(id);
  },
};
