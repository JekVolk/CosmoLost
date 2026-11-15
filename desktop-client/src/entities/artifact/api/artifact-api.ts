import { editorApiClient, portalApiClient } from '@/shared/api';
import type {
  EditorAssetBundle,
  PortalArtifactDetailDto,
  PortalArtifactDto,
  PortalArtifactMediaDto,
  ScientificDiscoveryDto,
  TraverseWaypointDto,
} from '@/shared/api';

export const artifactApi = {
  /**
   * Fetches full catalog from backend portal API
   */
  async getCatalog(): Promise<PortalArtifactDto[]> {
    const res = await portalApiClient.listArtifacts({ limit: 50 });
    return res.results;
  },

  /**
   * Fetches single artifact details from backend portal API
   */
  async getById(id: string): Promise<PortalArtifactDetailDto> {
    return portalApiClient.getArtifactById(id);
  },

  /**
   * Fetches media & text assembly bundle for desktop editor
   */
  async getAssetBundle(id: string): Promise<EditorAssetBundle> {
    return editorApiClient.getArtifactAssetBundle(id);
  },

  /**
   * Fetches traverse waypoints (path on surface)
   */
  async getWaypoints(id: string): Promise<TraverseWaypointDto[]> {
    return portalApiClient.getArtifactWaypoints(id);
  },

  /**
   * Fetches scientific discoveries
   */
  async getDiscoveries(id: string): Promise<ScientificDiscoveryDto[]> {
    return portalApiClient.getArtifactDiscoveries(id);
  },

  /**
   * Fetches media gallery
   */
  async getMedia(id: string): Promise<PortalArtifactMediaDto[]> {
    return portalApiClient.getArtifactMedia(id);
  },
};
