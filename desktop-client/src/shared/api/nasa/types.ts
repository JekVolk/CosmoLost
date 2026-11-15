export interface NasaImageItem {
  nasaId: string;
  title: string;
  description: string;
  mediaType: 'image' | 'video';
  dateCreated: string;
  center?: string;
  thumbUrl: string;
  fullResUrl: string;
  aspectRatio?: number;
}

export interface NasaAssetPackage {
  artifactId: string;
  name: string;
  photos: NasaImageItem[];
  model3dGlbUrl?: string;
  telemetrySnapshot?: {
    sol?: number;
    dustTau?: number;
    batteryLevelPct?: number;
    coordinates?: {
      latitude: number;
      longitude: number;
      locationName: string;
    };
  };
}

export interface PlanetTilesConfig {
  planetId: 'moon' | 'mars';
  name: string;
  radiusKm: number;
  gravityMs2: number;
  wmtsTileUrl: string;
  demElevationLayerUrl?: string;
}
