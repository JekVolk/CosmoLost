import type { MissionDto } from '@/shared/api';

export interface MissionDomainModel {
  id: string;
  nssdcaId: string;
  name: string;
  agency: string;
  launchDate?: string;
  landingDate?: string;
  endDate?: string;
  summary?: string;
  artifactsCount: number;
}

export interface IMissionRepository {
  listMissions(agency?: string): Promise<MissionDomainModel[]>;
  getMissionById(id: string): Promise<MissionDomainModel>;
}

export type { MissionDto };
