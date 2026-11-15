import type { CelestialBodyDto } from '@/shared/api';

export interface CelestialBodyDomainModel {
  id: string;
  name: string;
  radiusKm: number;
  gravityMs2: number;
  coordinateSystemType: string;
  wmtsTileUrl: string;
  createdAt?: string;
}

export interface ICelestialBodyRepository {
  listCelestialBodies(): Promise<CelestialBodyDomainModel[]>;
  getCelestialBodyById(id: string): Promise<CelestialBodyDomainModel>;
}

export type { CelestialBodyDto };
