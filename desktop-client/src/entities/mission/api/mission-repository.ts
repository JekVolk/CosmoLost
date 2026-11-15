import type { IMissionRepository, MissionDomainModel, MissionDto } from '../model/types';
import { missionApi } from './mission-api';

const FALLBACK_MISSIONS: MissionDomainModel[] = [
  {
    id: 'mer',
    nssdcaId: '2003-032A',
    name: 'Mars Exploration Rover',
    agency: 'NASA / JPL',
    launchDate: '2003-07-07',
    landingDate: '2004-01-25',
    endDate: '2018-06-10',
    summary: 'Twin robotic rovers Spirit and Opportunity exploring the Martian surface.',
    artifactsCount: 2,
  },
  {
    id: 'apollo-11',
    nssdcaId: '1969-059A',
    name: 'Apollo 11',
    agency: 'NASA',
    launchDate: '1969-07-16',
    landingDate: '1969-07-20',
    endDate: '1969-07-24',
    summary: 'First crewed mission to land on the Moon.',
    artifactsCount: 3,
  },
];

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
      if (dtos.length > 0) {
        return dtos.map(mapDtoToDomain);
      }
    } catch {
      // Fallback if backend is unavailable
    }
    return agency
      ? FALLBACK_MISSIONS.filter((m) => m.agency.toLowerCase().includes(agency.toLowerCase()))
      : FALLBACK_MISSIONS;
  }

  async getMissionById(id: string): Promise<MissionDomainModel> {
    try {
      const dto = await missionApi.getById(id);
      return mapDtoToDomain(dto);
    } catch {
      const fallback = FALLBACK_MISSIONS.find((m) => m.id === id);
      if (fallback) return fallback;
      return FALLBACK_MISSIONS[0] as MissionDomainModel;
    }
  }
}

export const missionRepository = new MissionRepository();
