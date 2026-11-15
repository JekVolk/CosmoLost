import { portalApiClient } from '@/shared/api';
import type {
  CommunityPublicationDto,
  CreateCommunityPublicationRequest,
  CreateCommunityPublicationResponse,
} from '../model/types';

export const communityPublicationApi = {
  async listApproved(params?: {
    mission_id?: string;
    artifact_id?: string;
    platform_type?: string;
  }): Promise<CommunityPublicationDto[]> {
    const res = await portalApiClient.listCommunityPublications({
      ...params,
      limit: 50,
    });
    return res.results;
  },

  async submit(
    data: CreateCommunityPublicationRequest,
  ): Promise<CreateCommunityPublicationResponse> {
    return portalApiClient.createCommunityPublication(data);
  },
};
