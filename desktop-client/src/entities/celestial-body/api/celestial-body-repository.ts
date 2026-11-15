import type {
  CelestialBodyDomainModel,
  CelestialBodyDto,
  ICelestialBodyRepository,
} from '../model/types';
import { celestialBodyApi } from './celestial-body-api';

const FALLBACK_BODIES: CelestialBodyDomainModel[] = [
  {
    id: 'mars',
    name: 'Mars',
    radiusKm: 3396.2,
    gravityMs2: 3.72,
    coordinateSystemType: 'PLANETOCENTRIC_360',
    wmtsTileUrl: 'https://trek.nasa.gov/tiles/Mars/{TileMatrix}/{TileRow}/{TileCol}.jpg',
  },
  {
    id: 'moon',
    name: 'Moon',
    radiusKm: 1737.4,
    gravityMs2: 1.62,
    coordinateSystemType: 'SELENOGRAPHIC',
    wmtsTileUrl: 'https://trek.nasa.gov/tiles/Moon/{TileMatrix}/{TileRow}/{TileCol}.jpg',
  },
];

function mapDtoToDomain(dto: CelestialBodyDto): CelestialBodyDomainModel {
  return {
    id: dto.id,
    name: dto.name,
    radiusKm: dto.radius_km,
    gravityMs2: dto.gravity_ms2,
    coordinateSystemType: dto.coordinate_system_type,
    wmtsTileUrl: dto.wmts_tile_url,
    createdAt: dto.created_at,
  };
}

export class CelestialBodyRepository implements ICelestialBodyRepository {
  async listCelestialBodies(): Promise<CelestialBodyDomainModel[]> {
    try {
      const dtos = await celestialBodyApi.getAll();
      if (dtos.length > 0) {
        return dtos.map(mapDtoToDomain);
      }
    } catch {
      // Fallback if backend is unavailable
    }
    return FALLBACK_BODIES;
  }

  async getCelestialBodyById(id: string): Promise<CelestialBodyDomainModel> {
    try {
      const dto = await celestialBodyApi.getById(id);
      return mapDtoToDomain(dto);
    } catch {
      const fallback = FALLBACK_BODIES.find((b) => b.id === id);
      if (fallback) return fallback;
      return FALLBACK_BODIES[0] as CelestialBodyDomainModel;
    }
  }
}

export const celestialBodyRepository = new CelestialBodyRepository();
