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
        title: "Opportunity's Final View (Perseverance Valley)",
        description:
          'Archival mosaic from the Panoramic Camera of NASA Mars Exploration Rover Opportunity in Perseverance Valley, Sol 5111.',
        mediaType: 'image',
        dateCreated: '2018-06-10',
        center: 'JPL',
        thumbUrl: 'https://images-assets.nasa.gov/image/PIA22521/PIA22521~thumb.jpg',
        fullResUrl: 'https://photojournal.jpl.nasa.gov/jpeg/PIA22521.jpg',
        aspectRatio: 1.33,
      },
      {
        nasaId: 'PIA05215',
        title: 'Opportunity at Endurance Crater',
        description:
          'View of the dramatic interior slopes of Endurance Crater taken by Opportunity.',
        mediaType: 'image',
        dateCreated: '2004-05-12',
        center: 'JPL',
        thumbUrl: 'https://images-assets.nasa.gov/image/PIA05215/PIA05215~thumb.jpg',
        fullResUrl: 'https://photojournal.jpl.nasa.gov/jpeg/PIA05215.jpg',
        aspectRatio: 1.5,
      },
    ],
    model3dGlbUrl:
      'https://raw.githubusercontent.com/nasa/NASA-3D-Resources/master/3D%20Models/Opportunity%20Rover/opportunity.glb',
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
        nasaId: 'PIA11200',
        title: 'Spirit Trapped in Soft Martian Sand at Troy',
        description:
          'True-color image showing the sand trap at the site named Troy where Spirit remained stationary.',
        mediaType: 'image',
        dateCreated: '2009-05-01',
        center: 'JPL',
        thumbUrl: 'https://images-assets.nasa.gov/image/PIA11200/PIA11200~thumb.jpg',
        fullResUrl: 'https://photojournal.jpl.nasa.gov/jpeg/PIA11200.jpg',
        aspectRatio: 1.33,
      },
    ],
    model3dGlbUrl:
      'https://raw.githubusercontent.com/nasa/NASA-3D-Resources/master/3D%20Models/Spirit%20Rover/spirit.glb',
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
        nasaId: 'AS11-40-5903',
        title: 'Lunar Module Eagle on the Moon Surface',
        description:
          'Astronaut Buzz Aldrin photographed near the leg of the Lunar Module Descent Stage at Tranquility Base.',
        mediaType: 'image',
        dateCreated: '1969-07-20',
        center: 'JSC',
        thumbUrl: 'https://images-assets.nasa.gov/image/AS11-40-5903/AS11-40-5903~thumb.jpg',
        fullResUrl: 'https://images-assets.nasa.gov/image/AS11-40-5903/AS11-40-5903~orig.jpg',
        aspectRatio: 1.0,
      },
    ],
    model3dGlbUrl:
      'https://raw.githubusercontent.com/nasa/NASA-3D-Resources/master/3D%20Models/Lunar%20Module/lunar_module.glb',
    telemetrySnapshot: {
      sol: 1,
      dustTau: 0.0,
      batteryLevelPct: 100,
      coordinates: {
        latitude: 0.67416,
        longitude: 23.47314,
        locationName: 'Statio Tranquillitatis (Tranquility Base), Moon',
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
      return items.map((raw) => {
        const d = raw.data?.[0];
        const thumb =
          raw.links?.find((l) => l.rel === 'preview')?.href ||
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
      });
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
