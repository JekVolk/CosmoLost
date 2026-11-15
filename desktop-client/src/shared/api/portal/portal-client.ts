import { axiosClient } from '../http';
import type {
  CelestialBodyDto,
  CommunityPublicationListResponse,
  CreateCommunityPublicationRequest,
  CreateCommunityPublicationResponse,
  MissionDto,
  MissionListResponse,
  PortalArtifactDetailDto,
  PortalArtifactListResponse,
  PortalArtifactMediaDto,
  ScientificDiscoveryDto,
  TraverseWaypointDto,
} from './types';

export const portalApiClient = {
  /**
   * GET /api/v1/portal/celestial-bodies/
   */
  async getCelestialBodies(): Promise<CelestialBodyDto[]> {
    return axiosClient.get<CelestialBodyDto[]>('/api/v1/portal/celestial-bodies/');
  },

  /**
   * GET /api/v1/portal/celestial-bodies/{id}/
   */
  async getCelestialBodyById(id: string): Promise<CelestialBodyDto> {
    return axiosClient.get<CelestialBodyDto>(`/api/v1/portal/celestial-bodies/${id}/`);
  },

  /**
   * GET /api/v1/portal/artifacts/
   */
  async listArtifacts(params?: {
    body?: string;
    type?: string;
    status?: string;
    is_featured?: boolean;
    is_nasa_hardware?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
    cluster_distance_m?: number;
  }): Promise<PortalArtifactListResponse> {
    return axiosClient.get<PortalArtifactListResponse>('/api/v1/portal/artifacts/', {
      params,
    });
  },

  /**
   * GET /api/v1/portal/artifacts/{id}/
   */
  async getArtifactById(id: string): Promise<PortalArtifactDetailDto> {
    return axiosClient.get<PortalArtifactDetailDto>(`/api/v1/portal/artifacts/${id}/`);
  },

  /**
   * GET /api/v1/portal/artifacts/{id}/waypoints/
   */
  async getArtifactWaypoints(id: string): Promise<TraverseWaypointDto[]> {
    return axiosClient.get<TraverseWaypointDto[]>(`/api/v1/portal/artifacts/${id}/waypoints/`);
  },

  /**
   * GET /api/v1/portal/artifacts/{id}/discoveries/
   */
  async getArtifactDiscoveries(id: string): Promise<ScientificDiscoveryDto[]> {
    return axiosClient.get<ScientificDiscoveryDto[]>(`/api/v1/portal/artifacts/${id}/discoveries/`);
  },

  /**
   * GET /api/v1/portal/artifacts/{id}/media/
   */
  async getArtifactMedia(id: string): Promise<PortalArtifactMediaDto[]> {
    return axiosClient.get<PortalArtifactMediaDto[]>(`/api/v1/portal/artifacts/${id}/media/`);
  },

  /**
   * GET /api/v1/portal/missions/
   */
  async listMissions(params?: {
    agency?: string;
    limit?: number;
    offset?: number;
  }): Promise<MissionListResponse> {
    return axiosClient.get<MissionListResponse>('/api/v1/portal/missions/', {
      params,
    });
  },

  /**
   * GET /api/v1/portal/missions/{id}/
   */
  async getMissionById(id: string): Promise<MissionDto> {
    return axiosClient.get<MissionDto>(`/api/v1/portal/missions/${id}/`);
  },

  /**
   * GET /api/v1/portal/community-publications/
   */
  async listCommunityPublications(params?: {
    mission_id?: string;
    artifact_id?: string;
    platform_type?: string;
    limit?: number;
    offset?: number;
  }): Promise<CommunityPublicationListResponse> {
    return axiosClient.get<CommunityPublicationListResponse>(
      '/api/v1/portal/community-publications/',
      { params },
    );
  },

  /**
   * POST /api/v1/portal/community-publications/
   */
  async createCommunityPublication(
    data: CreateCommunityPublicationRequest,
  ): Promise<CreateCommunityPublicationResponse> {
    return axiosClient.post<CreateCommunityPublicationResponse>(
      '/api/v1/portal/community-publications/',
      data,
    );
  },
};
