import type { IMissionRepository, MissionDomainModel, MissionDto } from '../model/types';
import { missionApi } from './mission-api';

function mapDtoToDomain(dto: MissionDto): MissionDomainModel {
  return {
    id: dto.id,
    nssdcaId: dto.nssdca_id,
    name: dto.name,
    agency: dto.agency,
    launchDate: dto.launch_date,
    landingDate: dto.landing_date,
    endDate: dto.end_date,
    summary: dto.summary,
    artifactsCount: Array.isArray(dto.artifacts) ? dto.artifacts.length : 0,
  };
}

export class MissionRepository implements IMissionRepository {
  async listMissions(agency?: string): Promise<MissionDomainModel[]> {
    try {
      const dtos = await missionApi.list(agency);
      return dtos.map(mapDtoToDomain);
    } catch {
      return [];
    }
  }

  async getMissionById(id: string): Promise<MissionDomainModel> {
    const dto = await missionApi.getById(id);
    return mapDtoToDomain(dto);
  }
}

export const missionRepository = new MissionRepository();
