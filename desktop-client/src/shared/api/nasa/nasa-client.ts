import { httpClient } from '../http';
import type { NasaAssetPackage, NasaImageItem, PlanetTilesConfig } from './types';

const NASA_IMAGES_API_BASE = 'https://images-api.nasa.gov';

const MOCK_NASA_CATALOG: Record<string, NasaAssetPackage> = {
  'opportunity-rover': {
    artifactId: 'opportunity-rover',
    name: 'Opportunity Rover (MER-B)',
    photos: [
      {
        nasaId: 'PIA22521',
        title: 'Opportunity Panoramic View of Perseverance Valley',
        description:
          'Archival mosaic from the Panoramic Camera of NASA Mars Exploration Rover Opportunity in Perseverance Valley, Sol 5111.',
        mediaType: 'image',
        dateCreated: '2018-06-10',
        center: 'JPL',
        thumbUrl: 'https://images-assets.nasa.gov/image/PIA22074/PIA22074~medium.jpg',
        fullResUrl: 'https://photojournal.jpl.nasa.gov/jpeg/PIA22521.jpg',
        aspectRatio: 1.33,
      },
    ],
    model3dGlbUrl:
      'https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/model/mars-exploration-rover---opportunity-(mer-b)/Mars%20Exploration%20Rover%20-%20Opportunity%20(MER-B).glb',
    telemetrySnapshot: {
      sol: 5111,
      dustTau: 10.8,
      batteryLevelPct: 8.5,
      coordinates: {
        latitude: -1.9462,
        longitude: 354.4734,
        locationName: 'Perseverance Valley, Endeavour Crater, Mars',
      },
    },
  },
  'spirit-rover': {
    artifactId: 'spirit-rover',
    name: 'Spirit Rover (MER-A)',
    photos: [
      {
        nasaId: 'PIA03253',
        title: 'Spirit Rover on Summit of Husband Hill',
        description:
          'True-color view showing the Columbia Hills terrain explored by NASA Spirit rover.',
        mediaType: 'image',
        dateCreated: '2005-09-01',
        center: 'JPL',
        thumbUrl: 'https://images-assets.nasa.gov/image/PIA03253/PIA03253~medium.jpg',
        fullResUrl: 'https://images-assets.nasa.gov/image/PIA03253/PIA03253~medium.jpg',
        aspectRatio: 1.33,
      },
    ],
    model3dGlbUrl:
      'https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/model/mars-exploration-rover---opportunity-(mer-b)/Mars%20Exploration%20Rover%20-%20Opportunity%20(MER-B).glb',
    telemetrySnapshot: {
      sol: 2210,
      dustTau: 6.2,
      batteryLevelPct: 12.0,
      coordinates: {
        latitude: -14.5684,
        longitude: 175.4726,
        locationName: 'Troy, Gusev Crater, Mars',
      },
    },
  },
  'apollo-11-lm-eagle': {
    artifactId: 'apollo-11-lm-eagle',
    name: 'Apollo 11 Lunar Module Eagle (Descent Stage)',
    photos: [
      {
        nasaId: 'as11-40-5927',
        title: 'Apollo 11 Lunar Module Eagle standing on Mare Tranquillitatis',
        description:
          'Official NASA photograph of the Lunar Module Descent Stage at Tranquility Base.',
        mediaType: 'image',
        dateCreated: '1969-07-20',
        center: 'JSC',
        thumbUrl: 'https://images-assets.nasa.gov/image/as11-40-5927/as11-40-5927~medium.jpg',
        fullResUrl: 'https://images-assets.nasa.gov/image/as11-40-5927/as11-40-5927~medium.jpg',
        aspectRatio: 1.0,
      },
    ],
    model3dGlbUrl:
      'https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/model/apollo-lunar-module/Apollo%20Lunar%20Module.glb',
    telemetrySnapshot: {
      sol: 1,
      dustTau: 0.0,
      batteryLevelPct: 100,
      coordinates: {
        latitude: 0.67408,
        longitude: 23.47297,
        locationName: 'Statio Tranquillitatis (Tranquility Base), Moon',
      },
    },
  },
  'apollo-11-descent-stage': {
    artifactId: 'apollo-11-descent-stage',
    name: 'Apollo 11 Lunar Module Descent Stage (Eagle)',
    photos: [
      {
        nasaId: 'as11-40-5927',
        title: 'Apollo 11 Lunar Module Eagle standing on Mare Tranquillitatis',
        description:
          'Official NASA photograph of the Lunar Module Descent Stage at Tranquility Base.',
        mediaType: 'image',
        dateCreated: '1969-07-20',
        center: 'JSC',
        thumbUrl: 'https://images-assets.nasa.gov/image/as11-40-5927/as11-40-5927~medium.jpg',
        fullResUrl: 'https://images-assets.nasa.gov/image/as11-40-5927/as11-40-5927~medium.jpg',
        aspectRatio: 1.0,
      },
    ],
    model3dGlbUrl:
      'https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/model/apollo-lunar-module/Apollo%20Lunar%20Module.glb',
    telemetrySnapshot: {
      sol: 1,
      dustTau: 0.0,
      batteryLevelPct: 100,
      coordinates: {
        latitude: 0.67408,
        longitude: 23.47297,
        locationName: 'Tranquility Base (Mare Tranquillitatis), Moon',
      },
    },
  },
  'apollo-11-lrr': {
    artifactId: 'apollo-11-lrr',
    name: 'Apollo 11 Lunar Laser Ranging Retroreflector (LRRR)',
    photos: [
      {
        nasaId: '6900957',
        title: 'Apollo 11 Laser Ranging Retroreflector Experiment',
        description:
          'The 100-corner-cube quartz reflector deployed on the lunar surface, still operational.',
        mediaType: 'image',
        dateCreated: '1969-07-20',
        center: 'JSC',
        thumbUrl: 'https://images-assets.nasa.gov/image/6900957/6900957~medium.jpg',
        fullResUrl: 'https://images-assets.nasa.gov/image/6900957/6900957~medium.jpg',
        aspectRatio: 1.0,
      },
    ],
    telemetrySnapshot: {
      sol: 1,
      dustTau: 0.0,
      batteryLevelPct: 100,
      coordinates: {
        latitude: 0.67337,
        longitude: 23.47309,
        locationName: 'Tranquility Base, Moon',
      },
    },
  },
  'insight-lander': {
    artifactId: 'insight-lander',
    name: 'InSight Mars Lander',
    photos: [
      {
        nasaId: 'PIA23014',
        title: 'InSight Lander Selfie on Elysium Planitia',
        description:
          'Mosaic of images from the Instrument Deployment Camera showing solar panels and SEIS dome.',
        mediaType: 'image',
        dateCreated: '2018-12-06',
        center: 'JPL',
        thumbUrl: 'https://images-assets.nasa.gov/image/PIA23014/PIA23014~thumb.jpg',
        fullResUrl: 'https://images-assets.nasa.gov/image/PIA23014/PIA23014~thumb.jpg',
        aspectRatio: 1.33,
      },
    ],
    model3dGlbUrl:
      'https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/model/insight-cruise-lander/InSight%20Cruise%20Lander%20(panels%20deployed).glb',
    telemetrySnapshot: {
      sol: 1445,
      dustTau: 3.5,
      batteryLevelPct: 14.0,
      coordinates: {
        latitude: 4.5024,
        longitude: 135.6234,
        locationName: 'Elysium Planitia, Mars',
      },
    },
  },
  'ingenuity-helicopter': {
    artifactId: 'ingenuity-helicopter',
    name: 'Ingenuity Mars Helicopter (Ginny)',
    photos: [
      {
        nasaId: 'PIA24836',
        title: 'Ingenuity Mars Helicopter Standing in Jezero Crater',
        description: 'Close-up photograph of Ingenuity taken by Mastcam-Z on Perseverance rover.',
        mediaType: 'image',
        dateCreated: '2021-04-05',
        center: 'JPL',
        thumbUrl: 'https://images-assets.nasa.gov/image/PIA24836/PIA24836~medium.jpg',
        fullResUrl: 'https://images-assets.nasa.gov/image/PIA24836/PIA24836~medium.jpg',
        aspectRatio: 1.33,
      },
    ],
    model3dGlbUrl:
      'https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/model/ingenuity-mars-helicopter/Ingenuity%20Mars%20Helicopter.glb',
    telemetrySnapshot: {
      sol: 1042,
      dustTau: 0.6,
      batteryLevelPct: 80.0,
      coordinates: {
        latitude: 18.4447,
        longitude: 77.4508,
        locationName: 'Valinor Hills, Jezero Crater, Mars',
      },
    },
  },
  'sojourner-rover': {
    artifactId: 'sojourner-rover',
    name: 'Sojourner Rover (Mars Pathfinder)',
    photos: [
      {
        nasaId: 'PIA01120',
        title: 'Sojourner Rover and Yogi Rock at Ares Vallis',
        description:
          'First robotic rover on Mars examining rocks near Carl Sagan Memorial Station.',
        mediaType: 'image',
        dateCreated: '1997-07-06',
        center: 'JPL',
        thumbUrl: 'https://images-assets.nasa.gov/image/PIA01120/PIA01120~medium.jpg',
        fullResUrl: 'https://images-assets.nasa.gov/image/PIA01120/PIA01120~medium.jpg',
        aspectRatio: 1.33,
      },
    ],
    telemetrySnapshot: {
      sol: 83,
      dustTau: 0.5,
      batteryLevelPct: 20.0,
      coordinates: {
        latitude: 19.33,
        longitude: 326.45,
        locationName: 'Ares Vallis, Mars',
      },
    },
  },
};

const PLANET_TILES: Record<string, PlanetTilesConfig> = {
  mars: {
    planetId: 'mars',
    name: 'Марс',
    radiusKm: 3396.2,
    gravityMs2: 3.72,
    wmtsTileUrl:
      'https://trek.nasa.gov/tiles/Mars/EQ/Mars_Viking_MDIM21_ClrMosaic_global_232m/1.0.0/default/default028mm/{TileMatrix}/{TileRow}/{TileCol}.jpg',
  },
  moon: {
    planetId: 'moon',
    name: 'Місяць',
    radiusKm: 1737.4,
    gravityMs2: 1.62,
    wmtsTileUrl:
      'https://trek.nasa.gov/tiles/Moon/EQ/LRO_WAC_Mosaic_Global_303ppd_v02/1.0.0/default/default028mm/{TileMatrix}/{TileRow}/{TileCol}.jpg',
  },
};

export class NasaApiClient {
  /**
   * Search NASA open media archive
   */
  async searchOpenImages(query: string, limit = 10): Promise<NasaImageItem[]> {
    try {
      const response = await httpClient.get<{
        collection?: {
          items?: Array<{
            data?: Array<{
              nasa_id: string;
              title: string;
              description?: string;
              media_type: string;
              date_created: string;
              center?: string;
            }>;
            links?: Array<{ href: string; rel: string }>;
          }>;
        };
      }>(`${NASA_IMAGES_API_BASE}/search`, {
        params: {
          q: query,
          media_type: 'image',
          page_size: limit,
        },
      });

      const items = response.data?.collection?.items || [];
      return items.map(
        (raw: {
          data?: Array<{
            nasa_id: string;
            title: string;
            description?: string;
            media_type: string;
            date_created: string;
            center?: string;
          }>;
          links?: Array<{ href: string; rel: string }>;
        }) => {
          const d = raw.data?.[0];
          const thumb =
            raw.links?.find((l: { rel: string; href: string }) => l.rel === 'preview')?.href ||
            'https://images-assets.nasa.gov/image/PIA22521/PIA22521~thumb.jpg';
          return {
            nasaId: d?.nasa_id || 'unknown',
            title: d?.title || query,
            description: d?.description || '',
            mediaType: 'image',
            dateCreated: d?.date_created || new Date().toISOString(),
            center: d?.center,
            thumbUrl: thumb,
            fullResUrl: thumb.replace('~thumb.', '~orig.'),
          };
        },
      );
    } catch (e) {
      console.warn('NASA images API call failed, falling back to local catalog:', e);
      return MOCK_NASA_CATALOG['opportunity-rover']?.photos ?? [];
    }
  }

  /**
   * Fetch complete artifact asset bundle
   */
  async getArtifactAssets(artifactId: string): Promise<NasaAssetPackage> {
    if (MOCK_NASA_CATALOG[artifactId]) {
      return MOCK_NASA_CATALOG[artifactId];
    }

    const fallbackImages = await this.searchOpenImages(artifactId, 4);
    return {
      artifactId,
      name: artifactId.replace(/-/g, ' ').toUpperCase(),
      photos: fallbackImages,
      telemetrySnapshot: {
        sol: 100,
        batteryLevelPct: 80,
      },
    };
  }

  /**
   * Get planetary tile configuration
   */
  getPlanetConfig(planet: 'moon' | 'mars'): PlanetTilesConfig {
    const config = PLANET_TILES[planet];
    if (config) {
      return config;
    }
    return {
      planetId: 'mars',
      name: 'Марс',
      radiusKm: 3396.2,
      gravityMs2: 3.72,
      wmtsTileUrl:
        'https://trek.nasa.gov/tiles/Mars/EQ/Mars_Viking_MDIM21_ClrMosaic_global_232m/1.0.0/default/default028mm/{TileMatrix}/{TileRow}/{TileCol}.jpg',
    };
  }

  /**
   * List all available local artifacts
   */
  listCatalogArtifacts(): NasaAssetPackage[] {
    return Object.values(MOCK_NASA_CATALOG);
  }
}

export const nasaApi = new NasaApiClient();
