import type { NasaAssetPackage } from '@/shared/api';
import type { ArtifactDomainModel, IArtifactRepository } from '../model/types';
import { artifactApi } from './artifact-api';

function mapPackageToDomain(pkg: NasaAssetPackage): ArtifactDomainModel {
  const isMars = pkg.artifactId.includes('rover') || pkg.artifactId.includes('mars');
  const photos = pkg.photos.map((p) => ({
    nasaId: p.nasaId,
    title: p.title,
    thumbUrl: p.thumbUrl,
    fullResUrl: p.fullResUrl,
    aspectRatio: p.aspectRatio,
  }));

  const firstPhoto = photos[0];
  const preview =
    firstPhoto?.thumbUrl || 'https://images-assets.nasa.gov/image/PIA22521/PIA22521~thumb.jpg';

  return {
    id: pkg.artifactId,
    name: pkg.name,
    missionName: isMars ? 'Mars Exploration Mission' : 'Apollo Lunar Mission',
    celestialBody: isMars ? 'mars' : 'moon',
    artifactType: pkg.artifactId.includes('rover') ? 'ROVER' : 'LANDER',
    operationalStatus: 'DORMANT',
    lastContactSol: pkg.telemetrySnapshot?.sol,
    previewImageUrl: preview,
    photos,
    model3dGlbUrl: pkg.model3dGlbUrl,
    coordinates: pkg.telemetrySnapshot?.coordinates || {
      latitude: 0,
      longitude: 0,
      locationName: isMars ? 'Martian Surface' : 'Lunar Surface',
    },
    telemetry: pkg.telemetrySnapshot,
  };
}

export class ArtifactRepository implements IArtifactRepository {
  async listFeaturedArtifacts(): Promise<ArtifactDomainModel[]> {
    const rawList = await artifactApi.getCatalog();
    return rawList.map(mapPackageToDomain);
  }

  async getArtifactById(id: string): Promise<ArtifactDomainModel> {
    const raw = await artifactApi.getById(id);
    return mapPackageToDomain(raw);
  }
}

export const artifactRepository = new ArtifactRepository();
