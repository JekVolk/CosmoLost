import type {
  EditorAssetBundle,
  PortalArtifactMediaDto,
  ScientificDiscoveryDto,
  TraverseWaypointDto,
} from '@/shared/api';

export type ArtifactType = 'ROVER' | 'LANDER' | 'DESCENT_STAGE' | 'INSTRUMENT' | 'RETRO_REFLECTOR';

export type OperationalStatus = 'DORMANT' | 'PASSIVE_ACTIVE' | 'DESTROYED_ON_IMPACT';

export interface ArtifactPhoto {
  nasaId: string;
  title: string;
  thumbUrl: string;
  fullResUrl: string;
  aspectRatio?: number;
}

export interface ArtifactDomainModel {
  id: string;
  name: string;
  missionName: string;
  celestialBody: 'moon' | 'mars';
  artifactType: ArtifactType;
  operationalStatus: OperationalStatus;
  lastContactSol?: number;
  landingDate?: string;
  deactivationReason?: string;
  previewImageUrl: string;
  photos: ArtifactPhoto[];
  model3dGlbUrl?: string;
  coordinates: {
    latitude: number;
    longitude: number;
    locationName: string;
  };
  telemetry?: {
    sol?: number;
    dustTau?: number;
    batteryLevelPct?: number;
  };
}

export interface IArtifactRepository {
  listFeaturedArtifacts(): Promise<ArtifactDomainModel[]>;
  getArtifactById(id: string): Promise<ArtifactDomainModel>;
  getAssetBundle(id: string): Promise<EditorAssetBundle>;
  getArtifactWaypoints(id: string): Promise<TraverseWaypointDto[]>;
  getArtifactDiscoveries(id: string): Promise<ScientificDiscoveryDto[]>;
  getArtifactMedia(id: string): Promise<PortalArtifactMediaDto[]>;
}

export type {
  EditorAssetBundle,
  PortalArtifactMediaDto,
  ScientificDiscoveryDto,
  TraverseWaypointDto,
};
