import { nasaApi } from '@/shared/api';
import type {
  EditorAssetBundle,
  NasaAssetPackage,
  PortalArtifactDetailDto,
  PortalArtifactDto,
  PortalArtifactMediaDto,
  ScientificDiscoveryDto,
  TraverseWaypointDto,
} from '@/shared/api';
import type {
  ArtifactDomainModel,
  ArtifactPhoto,
  ArtifactType,
  IArtifactRepository,
  OperationalStatus,
} from '../model/types';
import { artifactApi } from './artifact-api';

const OFFICIAL_NASA_IMAGE_FALLBACKS: Record<string, string> = {
  'apollo-11-lrr': 'https://images-assets.nasa.gov/image/6900957/6900957~medium.jpg',
  'apollo-11-descent-stage':
    'https://images-assets.nasa.gov/image/as11-40-5927/as11-40-5927~medium.jpg',
  'apollo-11-lm-eagle': 'https://images-assets.nasa.gov/image/as11-40-5927/as11-40-5927~medium.jpg',
  'insight-lander': 'https://images-assets.nasa.gov/image/PIA23014/PIA23014~thumb.jpg',
  'ingenuity-helicopter': 'https://images-assets.nasa.gov/image/PIA24836/PIA24836~medium.jpg',
  'opportunity-rover': 'https://images-assets.nasa.gov/image/PIA22074/PIA22074~medium.jpg',
  'sojourner-rover': 'https://images-assets.nasa.gov/image/PIA01120/PIA01120~medium.jpg',
  'spirit-rover': 'https://images-assets.nasa.gov/image/PIA03253/PIA03253~medium.jpg',
};

function mapPortalDtoToDomain(
  dto: PortalArtifactDto | PortalArtifactDetailDto,
): ArtifactDomainModel {
  const isMars = dto.celestial_body === 'mars';
  const photos: ArtifactPhoto[] = [];

  const officialFallback =
    OFFICIAL_NASA_IMAGE_FALLBACKS[dto.id] ||
    (isMars
      ? 'https://images-assets.nasa.gov/image/PIA22074/PIA22074~medium.jpg'
      : 'https://images-assets.nasa.gov/image/as11-40-5927/as11-40-5927~medium.jpg');

  if ('media' in dto && Array.isArray(dto.media) && dto.media.length > 0) {
    for (const m of dto.media) {
      photos.push({
        nasaId: m.id,
        title: m.title || dto.name,
        thumbUrl: m.media_url,
        fullResUrl: m.media_url,
      });
    }
  }

  // If preview_image_url is missing or contains the generic placeholder PIA22521 for non-Opportunity
  const rawPreview = dto.preview_image_url || '';
  const isGenericPlaceholder = rawPreview.includes('PIA22521') && dto.id !== 'opportunity-rover';
  const preview = !rawPreview || isGenericPlaceholder ? officialFallback : rawPreview;

  if (photos.length === 0) {
    photos.push({
      nasaId: dto.id,
      title: dto.name,
      thumbUrl: preview,
      fullResUrl: preview,
    });
  }

  const missionName =
    dto.mission_name ||
    ('mission' in dto && dto.mission?.name ? dto.mission.name : '') ||
    (isMars ? 'Mars Exploration Mission' : 'Apollo Lunar Mission');

  return {
    id: dto.id,
    name: dto.name,
    missionName,
    celestialBody: isMars ? 'mars' : 'moon',
    artifactType: (dto.artifact_type as ArtifactType) || 'ROVER',
    operationalStatus: (dto.operational_status as OperationalStatus) || 'DORMANT',
    lastContactSol: 'last_contact_sol' in dto ? dto.last_contact_sol : undefined,
    landingDate: 'landing_date' in dto ? dto.landing_date : undefined,
    deactivationReason: 'cause_of_deactivation' in dto ? dto.cause_of_deactivation : undefined,
    previewImageUrl: preview,
    photos,
    model3dGlbUrl: 'model_3d_url' in dto ? dto.model_3d_url : undefined,
    coordinates: {
      latitude: dto.coordinates?.latitude || 0,
      longitude: dto.coordinates?.longitude || 0,
      locationName:
        dto.coordinates?.location_name || (isMars ? 'Martian Surface' : 'Lunar Surface'),
    },
  };
}

function mapFallbackPackageToDomain(pkg: NasaAssetPackage): ArtifactDomainModel {
  const isMars =
    pkg.artifactId.includes('rover') ||
    pkg.artifactId.includes('mars') ||
    pkg.artifactId.includes('insight') ||
    pkg.artifactId.includes('ingenuity');
  const photos = pkg.photos.map((p) => ({
    nasaId: p.nasaId,
    title: p.title,
    thumbUrl: p.thumbUrl,
    fullResUrl: p.fullResUrl,
    aspectRatio: p.aspectRatio,
  }));

  const officialFallback =
    OFFICIAL_NASA_IMAGE_FALLBACKS[pkg.artifactId] ||
    (isMars
      ? 'https://images-assets.nasa.gov/image/PIA22074/PIA22074~medium.jpg'
      : 'https://images-assets.nasa.gov/image/as11-40-5927/as11-40-5927~medium.jpg');

  const firstPhoto = photos[0];
  const preview = firstPhoto?.thumbUrl || officialFallback;

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
    try {
      const dtos = await artifactApi.getCatalog();
      if (dtos.length > 0) {
        return dtos.map(mapPortalDtoToDomain);
      }
    } catch {
      // Fallback to offline NASA catalog if backend not reachable
    }

    const fallback = await nasaApi.listCatalogArtifacts();
    return fallback.map(mapFallbackPackageToDomain);
  }

  async getArtifactById(id: string): Promise<ArtifactDomainModel> {
    try {
      const dto = await artifactApi.getById(id);
      return mapPortalDtoToDomain(dto);
    } catch {
      const fallback = await nasaApi.getArtifactAssets(id);
      return mapFallbackPackageToDomain(fallback);
    }
  }

  async getAssetBundle(id: string): Promise<EditorAssetBundle> {
    return artifactApi.getAssetBundle(id);
  }

  async getArtifactWaypoints(id: string): Promise<TraverseWaypointDto[]> {
    try {
      return await artifactApi.getWaypoints(id);
    } catch {
      return [];
    }
  }

  async getArtifactDiscoveries(id: string): Promise<ScientificDiscoveryDto[]> {
    try {
      return await artifactApi.getDiscoveries(id);
    } catch {
      return [];
    }
  }

  async getArtifactMedia(id: string): Promise<PortalArtifactMediaDto[]> {
    try {
      return await artifactApi.getMedia(id);
    } catch {
      return [];
    }
  }
}

export const artifactRepository = new ArtifactRepository();
