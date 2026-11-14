export type CoordinateSystemType = 'SELENOGRAPHIC' | 'PLANETOCENTRIC_360';

export type ArtifactType =
  | 'ROVER'
  | 'HELICOPTER'
  | 'LANDER'
  | 'DESCENT_STAGE'
  | 'IMPACT_STAGE'
  | 'INSTRUMENT'
  | 'RETRO_REFLECTOR'
  | 'SAMPLE_TUBE'
  | 'ENTRY_DEBRIS'
  | 'DEEP_SPACE_PROBE';

export type OperationalStatus =
  | 'DORMANT'
  | 'PASSIVE_ACTIVE'
  | 'DESTROYED_ON_IMPACT'
  | 'ACTIVE_TRANSMITTING';

export type MediaCategory =
  | 'SURFACE_FIRST_PERSON'
  | 'LAST_KNOWN_PHOTO'
  | 'ORBITAL_PROOF_LROC_HIRISE'
  | 'MODEL_3D'
  | 'AUDIO_RECORDING';

export type PlatformType = 'YOUTUBE' | 'TIKTOK' | 'REELS' | 'OTHER';

export interface CelestialBody {
  id: 'moon' | 'mars' | string;
  name: string;
  radius_km: number;
  gravity_ms2: number;
  coordinate_system_type: CoordinateSystemType;
  wmts_tile_url: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
  elevation_m?: number;
  coordinate_system: CoordinateSystemType;
  location_name: string;
}

export interface ClusterInfo {
  is_clustered: boolean;
  cluster_id?: string | null;
  cluster_count: number;
}

export interface ArtifactSummary {
  id: string;
  name: string;
  mission_name: string;
  celestial_body: string;
  is_nasa_hardware: boolean;
  artifact_type: ArtifactType;
  operational_status: OperationalStatus;
  coordinates: Coordinates;
  cluster_info: ClusterInfo;
  mass_kg?: number | null;
  is_featured: boolean;
  preview_image_url: string;
  cosmolost_url: string;
}

export interface ArtifactListResponse {
  total: number;
  limit: number;
  offset: number;
  results: ArtifactSummary[];
}

export interface TraverseWaypoint {
  id: string;
  sol_or_step: number;
  latitude: number;
  longitude: number;
  elevation_m: number;
  odometry_m: number;
  telemetry_snapshot: Record<string, any>;
  story_snippet?: string | null;
}

export interface ScientificDiscovery {
  id: string;
  instrument_acronym: string;
  instrument_full_name: string;
  title: string;
  kid_friendly_story: string;
  scientific_fact: string;
}

export interface ArtifactMedia {
  id: string;
  media_category: MediaCategory;
  media_url: string;
  nasa_id_or_pia?: string | null;
  caption: string;
  credit: string;
}

export interface ArtifactDetail {
  id: string;
  name: string;
  mission: {
    id: string;
    name: string;
    nssdca_id: string;
  };
  celestial_body: string;
  artifact_type: ArtifactType;
  operational_status: OperationalStatus;
  coordinates: Coordinates;
  mass_kg?: number | null;
  last_contact_sol?: number | null;
  cause_of_deactivation?: string | null;
  is_featured: boolean;
  is_nasa_hardware: boolean;
  first_person_monologue: string;
  model_3d_url?: string | null;
  updated_at?: string;
  media: ArtifactMedia[];
  discoveries: ScientificDiscovery[];
}

export interface MissionDetail {
  id: string;
  nssdca_id: string;
  name: string;
  agency: string;
  launch_date?: string | null;
  landing_date?: string | null;
  end_date?: string | null;
  summary: string;
}

export interface MissionListResponse {
  total: number;
  results: MissionDetail[];
}

export interface CommunityPublicationCreate {
  mission_id: string;
  artifact_id?: string | null;
  title: string;
  video_url: string;
  platform_type: PlatformType;
  source_references: string;
  author_name: string;
}

export interface CommunityPublicationSubmitResponse {
  id: string;
  status: string;
  is_approved: boolean;
  message: string;
}

export interface CommunityPublication {
  id: string;
  mission_id: string;
  artifact_id?: string | null;
  title: string;
  video_url: string;
  platform_type: PlatformType;
  source_references: string;
  author_name: string;
  is_approved: boolean;
  created_at: string;
}

export interface CommunityPublicationListResponse {
  total: number;
  results: CommunityPublication[];
}
