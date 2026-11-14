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
}
