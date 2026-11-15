/**
 * CosmoLost Web Portal API DTOs (from openapi_portal.json)
 */

export interface CelestialBodyDto {
  id: string;
  name: string;
  radius_km: number;
  gravity_ms2: number;
  coordinate_system_type: string;
  wmts_tile_url: string;
  created_at?: string;
}

export interface TraverseWaypointDto {
  id: number | string;
  sol_or_step: number;
  latitude: number;
  longitude: number;
  elevation_m?: number;
  odometry_m?: number;
  telemetry_snapshot?: Record<string, unknown>;
  story_snippet?: string;
}

export interface ScientificDiscoveryDto {
  id: number | string;
  instrument_acronym: string;
  instrument_full_name: string;
  title: string;
  kid_friendly_story: string;
  scientific_fact: string;
}

export interface PortalArtifactMediaDto {
  id: string;
  media_category: string;
  media_url: string;
  nasa_id_or_pia?: string;
  caption?: string;
  credit?: string;
  title?: string;
  source?: string;
  is_primary?: boolean;
}

export interface PortalArtifactDto {
  id: string;
  name: string;
  mission_name: string;
  celestial_body: 'moon' | 'mars' | string;
  is_nasa_hardware: boolean;
  artifact_type: string;
  operational_status: string;
  coordinates: {
    latitude: number;
    longitude: number;
    elevation_m?: number;
    coordinate_system?: string;
    location_name: string;
  };
  cluster_info?: {
    is_clustered: boolean;
    cluster_id?: string;
    cluster_count?: number;
  };
  mass_kg?: number;
  is_featured?: boolean;
  preview_image_url: string;
  cosmolost_url?: string;
}

export interface PortalArtifactListResponse {
  total: number;
  limit: number;
  offset: number;
  results: PortalArtifactDto[];
}

export interface PortalArtifactDetailDto extends PortalArtifactDto {
  mission?: {
    id: string;
    nssdca_id: string;
    name: string;
    agency: string;
  };
  last_contact_sol?: number;
  landing_date?: string;
  cause_of_deactivation?: string;
  first_person_monologue?: string;
  model_3d_url?: string;
  updated_at?: string;
  media?: PortalArtifactMediaDto[];
  discoveries?: ScientificDiscoveryDto[];
}

export interface MissionDto {
  id: string;
  nssdca_id: string;
  name: string;
  agency: string;
  launch_date?: string;
  landing_date?: string;
  end_date?: string;
  summary?: string;
  artifacts?: PortalArtifactDto[];
}

export interface MissionListResponse {
  total: number;
  limit: number;
  offset: number;
  results: MissionDto[];
}

export interface CommunityPublicationDto {
  id: string;
  mission_id: string;
  artifact_id?: string | null;
  mission?: string;
  artifact?: string | null;
  title: string;
  video_url: string;
  platform_type: string;
  source_references?: string;
  author_name: string;
  is_approved: boolean;
  created_at: string;
}

export interface CommunityPublicationListResponse {
  total: number;
  limit: number;
  offset: number;
  results: CommunityPublicationDto[];
}

export interface CreateCommunityPublicationRequest {
  mission_id: string;
  artifact_id?: string | null;
  title: string;
  video_url: string;
  platform_type: string;
  author_name: string;
  source_references?: string;
}

export interface CreateCommunityPublicationResponse {
  id: string;
  status: string;
  is_approved: boolean;
  message: string;
}
