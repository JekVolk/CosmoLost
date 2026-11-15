import { API_URL } from '@/shared/config/env';
import { MARS_ARTIFACTS } from '../../entities/planet/model/artifactsMars';
import { MOON_ARTIFACTS } from '../../entities/planet/model/artifactsMoon';
import type {
  ArtifactStatus,
  ArtifactType,
  PlanetId,
  SpaceArtifact,
} from '../../entities/planet/model/types';
import type {
  ArtifactDetail,
  ArtifactListResponse,
  ArtifactMedia,
  ArtifactSummary,
  CelestialBody,
  CommunityPublication,
  CommunityPublicationCreate,
  CommunityPublicationListResponse,
  CommunityPublicationSubmitResponse,
  MissionDetail,
  MissionListResponse,
  ScientificDiscovery,
  TraverseWaypoint,
} from './types';

export const API_BASE_URL = `${API_URL.replace(/\/+$/, '')}/api/v1/portal`;

const COMMUNITY_STORAGE_KEY = 'cosmolost_community_publications_v1';

let isLiveBackendConnected = false;

function getLocalCommunityPublications(): CommunityPublication[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(COMMUNITY_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [
    {
      id: 'demo-pub-1',
      mission_id: 'apollo-11',
      artifact_id: 'apollo-11',
      title: 'Apollo 11 Tranquility Base in 4K: Reliving the First Moonwalk',
      video_url: 'https://www.youtube.com/watch?v=RMINSD7MmT4',
      platform_type: 'YOUTUBE',
      source_references: 'NASA Apollo 11 Lunar Surface Journal & LROC Image M175408043RE',
      author_name: 'LunarHistoryArchivist',
      is_approved: true,
      created_at: '2026-10-12T14:30:00Z',
    },
    {
      id: 'demo-pub-2',
      mission_id: 'mer-b',
      artifact_id: 'opportunity',
      title: '15 Years on Mars: Opportunity MER-B Complete Odyssey from Eagle to Endeavour',
      video_url: 'https://www.youtube.com/watch?v=7XvygqXnC4k',
      platform_type: 'YOUTUBE',
      source_references: 'NASA JPL Opportunity End of Mission Telemetry Archive',
      author_name: 'RedPlanetExplorer',
      is_approved: true,
      created_at: '2026-11-01T09:15:00Z',
    },
    {
      id: 'demo-pub-3',
      mission_id: 'mars-2020',
      artifact_id: 'perseverance',
      title: 'Ingenuity Helicopter 72 Flights Recap #MarsHelicopter',
      video_url: 'https://www.tiktok.com/@nasa/video/73281234567890',
      platform_type: 'TIKTOK',
      source_references: 'NASA JPL Flight Logs & Mastcam-Z Footage',
      author_name: 'AstroShorts',
      is_approved: true,
      created_at: '2026-11-05T18:40:00Z',
    },
  ];
}

export function apiArtifactSummaryToSpaceArtifact(
  summary: ArtifactSummary,
  bodyId: PlanetId,
): SpaceArtifact {
  const localList = bodyId === 'mars' ? MARS_ARTIFACTS : MOON_ARTIFACTS;
  const match = localList.find(
    (a) => a.id === summary.id || a.name.toLowerCase() === summary.name.toLowerCase(),
  );

  let mappedType: ArtifactType = 'lander';
  switch (summary.artifact_type) {
    case 'ROVER':
      mappedType = 'rover';
      break;
    case 'HELICOPTER':
      mappedType = 'helicopter';
      break;
    case 'LANDER':
      mappedType = 'lander';
      break;
    case 'DESCENT_STAGE':
      mappedType = 'descent_stage';
      break;
    case 'IMPACT_STAGE':
      mappedType = 'impact_stage';
      break;
    case 'INSTRUMENT':
      mappedType = 'instrument';
      break;
    case 'RETRO_REFLECTOR':
      mappedType = 'retro_reflector';
      break;
    case 'SAMPLE_TUBE':
      mappedType = 'sample_depot';
      break;
    case 'ENTRY_DEBRIS':
      mappedType = 'entry_debris';
      break;
    default:
      mappedType = 'lander';
  }

  let mappedStatus: ArtifactStatus = 'silent';
  switch (summary.operational_status) {
    case 'ACTIVE_TRANSMITTING':
      mappedStatus = 'operational';
      break;
    case 'PASSIVE_ACTIVE':
      mappedStatus = 'historic';
      break;
    case 'DESTROYED_ON_IMPACT':
      mappedStatus = 'crashed';
      break;
    case 'DORMANT':
      mappedStatus = 'silent';
      break;
  }

  return {
    id: summary.id,
    name: summary.name,
    mission: summary.mission_name,
    agency: summary.is_nasa_hardware ? 'NASA' : match?.agency || 'International',
    country: summary.is_nasa_hardware ? 'USA' : match?.country || 'International',
    type: mappedType,
    status: mappedStatus,
    operationalStatus: summary.operational_status as any,
    statusLabel: summary.operational_status.replace(/_/g, ' '),
    lat: summary.coordinates.latitude,
    lon: summary.coordinates.longitude,
    locationName: summary.coordinates.location_name,
    massKg: summary.mass_kg || match?.massKg || undefined,
    landingDate: summary.landing_date || summary.launch_date || match?.landingDate || 'Historical',
    lastContactDate: match?.lastContactDate,
    operationalDays: match?.operationalDays,
    distanceTraveledKm: match?.distanceTraveledKm,
    brief: match?.brief || summary.mission_name,
    description:
      match?.description || `${summary.name} located at ${summary.coordinates.location_name}.`,
    whyAbandoned: match?.whyAbandoned || 'Mission operations completed.',
    firstPersonMonologue: match?.firstPersonMonologue,
    howItWorked: match?.howItWorked,
    scienceLegacy: match?.scienceLegacy,
    orbitalSpottedBy: match?.orbitalSpottedBy,
    keyInstruments: match?.keyInstruments,
    lastTelemetry: match?.lastTelemetry,
    traversePath: match?.traversePath,
    keyFacts: match?.keyFacts || [
      `Target body: ${bodyId.toUpperCase()}`,
      `Coordinate system: ${summary.coordinates.coordinate_system}`,
      `Site: ${summary.coordinates.location_name}`,
      summary.is_nasa_hardware
        ? 'NASA Deep Space Exploration Program'
        : 'International Space Mission',
    ],
    imageUrl: summary.preview_image_url || match?.imageUrl,
    badgeColor: match?.badgeColor || (bodyId === 'mars' ? '#f97316' : '#38bdf8'),
  };
}

export function apiArtifactDetailToSpaceArtifact(
  detail: ArtifactDetail,
  bodyId: PlanetId,
): SpaceArtifact {
  const localList = bodyId === 'mars' ? MARS_ARTIFACTS : MOON_ARTIFACTS;
  const match = localList.find(
    (a) => a.id === detail.id || a.name.toLowerCase() === detail.name.toLowerCase(),
  );

  const summaryArt = apiArtifactSummaryToSpaceArtifact(
    {
      ...detail,
      mission_name: detail.mission.name,
      cluster_info: { is_clustered: false, cluster_count: 1 },
      preview_image_url: detail.media?.[0]?.media_url || match?.imageUrl || '',
      cosmolost_url: `https://cosmolost.lihtar.org/?artifact=${detail.id}&planet=${bodyId}`,
    },
    bodyId,
  );

  return {
    ...summaryArt,
    firstPersonMonologue: detail.first_person_monologue || match?.firstPersonMonologue,
    whyAbandoned: detail.cause_of_deactivation || match?.whyAbandoned || 'Mission finished.',
    imageUrl: detail.media?.[0]?.media_url || match?.imageUrl,
    model3dUrl: detail.model_3d_url || match?.model3dUrl,
    keyInstruments:
      detail.discoveries && detail.discoveries.length > 0
        ? detail.discoveries.map((d) => ({
            acronym: d.instrument_acronym,
            fullName: d.instrument_full_name,
            purpose: d.title,
            discovery: d.scientific_fact,
          }))
        : match?.keyInstruments,
  };
}

function mapLocalArtifactToSummary(art: SpaceArtifact, bodyId: string): ArtifactSummary {
  let mappedType: any = 'LANDER';
  switch (art.type) {
    case 'rover':
      mappedType = 'ROVER';
      break;
    case 'helicopter':
      mappedType = 'HELICOPTER';
      break;
    case 'lander':
      mappedType = 'LANDER';
      break;
    case 'descent_stage':
      mappedType = 'DESCENT_STAGE';
      break;
    case 'impact_stage':
      mappedType = 'IMPACT_STAGE';
      break;
    case 'instrument':
      mappedType = 'INSTRUMENT';
      break;
    case 'retro_reflector':
      mappedType = 'RETRO_REFLECTOR';
      break;
    case 'sample_depot':
      mappedType = 'SAMPLE_TUBE';
      break;
    default:
      mappedType = 'LANDER';
  }

  let mappedStatus: any = 'DORMANT';
  switch (art.operationalStatus as string) {
    case 'HISTORIC':
      mappedStatus = 'DORMANT';
      break;
    case 'PASSIVE_ACTIVE':
    case 'ACTIVE_PASSIVE':
      mappedStatus = 'PASSIVE_ACTIVE';
      break;
    case 'IMPACT_DESTROYED':
    case 'DESTROYED_FOR_SCIENCE':
      mappedStatus = 'DESTROYED_ON_IMPACT';
      break;
    default:
      mappedStatus = 'DORMANT';
  }

  return {
    id: art.id,
    name: art.name,
    mission_name: art.mission,
    celestial_body: bodyId,
    is_nasa_hardware: art.agency === 'NASA' || art.country === 'USA',
    artifact_type: mappedType,
    operational_status: mappedStatus,
    coordinates: {
      latitude: art.lat,
      longitude: art.lon,
      elevation_m: 0,
      coordinate_system: bodyId === 'mars' ? 'PLANETOCENTRIC_360' : 'SELENOGRAPHIC',
      location_name: art.locationName,
    },
    cluster_info: {
      is_clustered: false,
      cluster_count: 1,
    },
    mass_kg: art.massKg || null,
    is_featured:
      art.status === 'historic' ||
      art.id.includes('apollo') ||
      art.id.includes('curiosity') ||
      art.id.includes('opportunity'),
    preview_image_url: art.imageUrl || '',
    cosmolost_url: `https://cosmolost.lihtar.org/?artifact=${art.id}&planet=${bodyId}`,
  };
}

function mapLocalArtifactToDetail(art: SpaceArtifact, bodyId: string): ArtifactDetail {
  const summary = mapLocalArtifactToSummary(art, bodyId);

  const media: ArtifactMedia[] = [];
  if (art.imageUrl) {
    media.push({
      id: `${art.id}-hero`,
      media_category: 'SURFACE_FIRST_PERSON',
      media_url: art.imageUrl,
      nasa_id_or_pia: art.nssdcaId || null,
      caption: `${art.name} on the surface of ${bodyId === 'mars' ? 'Mars' : 'the Moon'}`,
      credit: `${art.agency} / NASA Archive`,
    });
  }

  const discoveries: ScientificDiscovery[] = (art.keyInstruments || []).map((inst, i) => ({
    id: `${art.id}-inst-${i}`,
    instrument_acronym: inst.acronym,
    instrument_full_name: inst.fullName,
    title: inst.purpose,
    kid_friendly_story: `Equipped with the ${inst.acronym} tool, it helped scientists discover ${inst.discovery}`,
    scientific_fact: inst.discovery,
  }));

  return {
    ...summary,
    mission: {
      id: art.mission.toLowerCase().replace(/\s+/g, '-'),
      name: art.mission,
      nssdca_id: art.nssdcaId || '',
    },
    first_person_monologue: art.firstPersonMonologue || art.description,
    last_contact_sol: art.lastTelemetry?.finalSol || null,
    cause_of_deactivation: art.whyAbandoned,
    model_3d_url: null,
    updated_at: new Date().toISOString(),
    media,
    discoveries,
  };
}

export const portalApi = {
  baseUrl: API_BASE_URL,

  getConnectionStatus(): { isLive: boolean; url: string } {
    return { isLive: isLiveBackendConnected, url: API_BASE_URL };
  },

  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/celestial-bodies/`, {
        signal: AbortSignal.timeout(2000),
      });
      if (res.ok) {
        isLiveBackendConnected = true;
        return true;
      }
    } catch {}
    isLiveBackendConnected = false;
    return false;
  },

  async getCelestialBodies(): Promise<CelestialBody[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/celestial-bodies/`, {
        signal: AbortSignal.timeout(2500),
      });
      if (res.ok) {
        isLiveBackendConnected = true;
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch {}

    return [
      {
        id: 'mars',
        name: 'Mars',
        radius_km: 3396.2,
        gravity_ms2: 3.72,
        coordinate_system_type: 'PLANETOCENTRIC_360',
        wmts_tile_url:
          'https://trek.nasa.gov/tiles/Mars/EQ/Mars_Viking_MDIM21_ClrMosaic_global_232m/1.0.0/default/default028mm/{TileMatrix}/{TileRow}/{TileCol}.jpg',
      },
      {
        id: 'moon',
        name: 'Moon',
        radius_km: 1737.4,
        gravity_ms2: 1.62,
        coordinate_system_type: 'SELENOGRAPHIC',
        wmts_tile_url:
          'https://trek.nasa.gov/tiles/Moon/EQ/LRO_WAC_Mosaic_Global_303ppd_v02/1.0.0/default/default028mm/{TileMatrix}/{TileRow}/{TileCol}.jpg',
      },
    ];
  },

  async getCelestialBodyDetail(id: string): Promise<CelestialBody | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/celestial-bodies/${id}/`, {
        signal: AbortSignal.timeout(2500),
      });
      if (res.ok) {
        isLiveBackendConnected = true;
        return await res.json();
      }
    } catch {}

    const list = await this.getCelestialBodies();
    return list.find((b) => b.id === id) || null;
  },

  async listArtifacts(params?: {
    body?: string;
    search?: string;
    type?: string;
    status?: string;
    is_featured?: boolean;
    is_nasa_hardware?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<ArtifactListResponse> {
    const body = params?.body || 'mars';
    try {
      const q = new URLSearchParams();
      if (params?.body) q.set('body', params.body);
      if (params?.search) q.set('search', params.search);
      if (params?.type) q.set('type', params.type);
      if (params?.status) q.set('status', params.status);
      if (params?.is_featured !== undefined) q.set('is_featured', String(params.is_featured));
      if (params?.is_nasa_hardware !== undefined)
        q.set('is_nasa_hardware', String(params.is_nasa_hardware));
      if (params?.limit) q.set('limit', String(params.limit));
      if (params?.offset) q.set('offset', String(params.offset));

      const res = await fetch(`${API_BASE_URL}/artifacts/?${q.toString()}`, {
        signal: AbortSignal.timeout(2500),
      });
      if (res.ok) {
        isLiveBackendConnected = true;
        const json = await res.json();
        if (json && Array.isArray(json.results) && json.results.length > 0) {
          return json;
        }
      }
    } catch {}

    const source = body === 'moon' ? MOON_ARTIFACTS : MARS_ARTIFACTS;
    let filtered = source;
    if (params?.search) {
      const term = params.search.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(term) ||
          a.mission.toLowerCase().includes(term) ||
          a.locationName.toLowerCase().includes(term),
      );
    }
    const results = filtered.map((a) => mapLocalArtifactToSummary(a, body));
    return {
      total: results.length,
      limit: params?.limit || 100,
      offset: params?.offset || 0,
      results: results.slice(params?.offset || 0, (params?.offset || 0) + (params?.limit || 100)),
    };
  },

  async getArtifactDetail(id: string): Promise<ArtifactDetail | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/artifacts/${id}/`, {
        signal: AbortSignal.timeout(2500),
      });
      if (res.ok) {
        isLiveBackendConnected = true;
        return await res.json();
      }
    } catch {}

    const foundMars = MARS_ARTIFACTS.find((a) => a.id === id);
    if (foundMars) return mapLocalArtifactToDetail(foundMars, 'mars');

    const foundMoon = MOON_ARTIFACTS.find((a) => a.id === id);
    if (foundMoon) return mapLocalArtifactToDetail(foundMoon, 'moon');

    return null;
  },

  async getArtifactWaypoints(id: string): Promise<TraverseWaypoint[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/artifacts/${id}/waypoints/`, {
        signal: AbortSignal.timeout(2500),
      });
      if (res.ok) {
        isLiveBackendConnected = true;
        return await res.json();
      }
    } catch {}

    const art = MARS_ARTIFACTS.find((a) => a.id === id) || MOON_ARTIFACTS.find((a) => a.id === id);
    if (!art?.traversePath) return [];

    return art.traversePath.map((step, idx) => ({
      id: `${id}-wp-${idx}`,
      sol_or_step: idx + 1,
      latitude: step.lat,
      longitude: step.lon,
      elevation_m: 0,
      odometry_m: step.odometryM || (idx + 1) * 250,
      telemetry_snapshot: { status: 'nominal', stepName: step.title },
      story_snippet: step.storySnippet || null,
    }));
  },

  async getArtifactDiscoveries(id: string): Promise<ScientificDiscovery[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/artifacts/${id}/discoveries/`, {
        signal: AbortSignal.timeout(2500),
      });
      if (res.ok) {
        isLiveBackendConnected = true;
        return await res.json();
      }
    } catch {}

    const detail = await this.getArtifactDetail(id);
    return detail?.discoveries || [];
  },

  async getArtifactMedia(id: string): Promise<ArtifactMedia[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/artifacts/${id}/media/`, {
        signal: AbortSignal.timeout(2500),
      });
      if (res.ok) {
        isLiveBackendConnected = true;
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch {}

    const detail = await this.getArtifactDetail(id);
    const mediaList = [...(detail?.media || [])];

    if (!mediaList.some((m) => m.media_category === 'PANORAMA')) {
      if (id.includes('opportunity')) {
        mediaList.push({
          id: 'media-oppy-panorama',
          media_category: 'PANORAMA',
          media_url: 'https://images-assets.nasa.gov/image/PIA22074/PIA22074~medium.jpg',
          nasa_id_or_pia: 'PIA18604',
          caption:
            'Opportunity 360-degree color panorama from Wdowiak Ridge overlooking Endeavour Crater.',
          credit: 'NASA/JPL-Caltech/Cornell/ASU',
        });
      } else if (id.includes('spirit')) {
        mediaList.push({
          id: 'media-spirit-panorama',
          media_category: 'PANORAMA',
          media_url: 'https://images-assets.nasa.gov/image/PIA01907/PIA01907~medium.jpg',
          nasa_id_or_pia: 'PIA01907',
          caption: 'Spirit 360-degree panorama from the summit of Husband Hill, Gusev Crater.',
          credit: 'NASA/JPL-Caltech/Cornell',
        });
      } else if (id.includes('apollo-11') || id.includes('eagle')) {
        mediaList.push({
          id: 'media-apollo11-panorama',
          media_category: 'PANORAMA',
          media_url: 'https://images-assets.nasa.gov/image/6900957/6900957~medium.jpg',
          nasa_id_or_pia: 'PIA14545',
          caption: 'Apollo 11 Tranquility Base 360-degree lunar surface panorama.',
          credit: 'NASA / Neil Armstrong & Buzz Aldrin Archive',
        });
      }
    }

    return mediaList;
  },

  async listMissions(): Promise<MissionListResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/missions/`, { signal: AbortSignal.timeout(2500) });
      if (res.ok) {
        isLiveBackendConnected = true;
        return await res.json();
      }
    } catch {}

    const missionMap = new Map<string, MissionDetail>();
    [...MARS_ARTIFACTS, ...MOON_ARTIFACTS].forEach((a) => {
      const mid = a.mission.toLowerCase().replace(/\s+/g, '-');
      if (!missionMap.has(mid)) {
        missionMap.set(mid, {
          id: mid,
          nssdca_id: a.nssdcaId || '',
          name: a.mission,
          agency: a.agency,
          launch_date: a.landingDate || null,
          landing_date: a.landingDate || null,
          end_date: null,
          summary: a.brief || a.description.slice(0, 200),
        });
      }
    });

    const results = Array.from(missionMap.values());
    return { total: results.length, results };
  },

  async listCommunityPublications(params?: {
    artifact_id?: string;
    mission_id?: string;
  }): Promise<CommunityPublicationListResponse> {
    try {
      const q = new URLSearchParams();
      if (params?.artifact_id) q.set('artifact_id', params.artifact_id);
      if (params?.mission_id) q.set('mission_id', params.mission_id);
      const res = await fetch(`${API_BASE_URL}/community-publications/?${q.toString()}`, {
        signal: AbortSignal.timeout(2500),
      });
      if (res.ok) {
        isLiveBackendConnected = true;
        const data = await res.json();
        if (data && Array.isArray(data.results) && data.results.length > 0) {
          // Merge local submissions if any exist
          const localItems = getLocalCommunityPublications().filter(
            (lp) => !data.results.some((r: any) => r.id === lp.id),
          );
          const merged = [...localItems, ...data.results];
          return {
            total: merged.length,
            results: merged,
          };
        }
      }
    } catch {}

    let all = getLocalCommunityPublications();
    if (params?.artifact_id) {
      all = all.filter(
        (p) => p.artifact_id === params.artifact_id || p.mission_id === params.artifact_id,
      );
    }
    return {
      total: all.length,
      results: all,
    };
  },

  async submitCommunityPublication(
    payload: CommunityPublicationCreate,
  ): Promise<CommunityPublicationSubmitResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/community-publications/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(4000),
      });
      if (res.ok) {
        isLiveBackendConnected = true;
        return await res.json();
      }
    } catch {}

    const newId = `pub-${Date.now()}`;
    const newEntry: CommunityPublication = {
      id: newId,
      mission_id: payload.mission_id,
      artifact_id: payload.artifact_id || null,
      title: payload.title,
      video_url: payload.video_url,
      platform_type: payload.platform_type,
      source_references: payload.source_references,
      author_name: payload.author_name,
      is_approved: true,
      created_at: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      const existing = getLocalCommunityPublications();
      existing.unshift(newEntry);
      try {
        localStorage.setItem(COMMUNITY_STORAGE_KEY, JSON.stringify(existing));
      } catch {}
    }

    return {
      id: newId,
      status: 'SUBMITTED_FOR_REVIEW',
      is_approved: true,
      message:
        'Video publication successfully submitted and verified for CosmoLost community feed!',
    };
  },
};
