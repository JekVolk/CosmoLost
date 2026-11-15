import type {
  CommunityPublicationDomainModel,
  CommunityPublicationDto,
  CreateCommunityPublicationRequest,
  CreateCommunityPublicationResponse,
  ICommunityPublicationRepository,
} from '../model/types';
import { communityPublicationApi } from './community-publication-api';

function mapDtoToDomain(dto: CommunityPublicationDto): CommunityPublicationDomainModel {
  return {
    id: dto.id,
    missionId: dto.mission_id,
    artifactId: dto.artifact_id,
    missionName: dto.mission || dto.mission_id,
    artifactName: dto.artifact,
    title: dto.title,
    videoUrl: dto.video_url,
    platformType: dto.platform_type,
    authorName: dto.author_name,
    isApproved: dto.is_approved,
    createdAt: dto.created_at,
  };
}

export class CommunityPublicationRepository implements ICommunityPublicationRepository {
  async listApprovedPublications(params?: {
    missionId?: string;
    artifactId?: string;
    platformType?: string;
  }): Promise<CommunityPublicationDomainModel[]> {
    try {
      const dtos = await communityPublicationApi.listApproved({
        mission_id: params?.missionId,
        artifact_id: params?.artifactId,
        platform_type: params?.platformType,
      });
      return dtos.map(mapDtoToDomain);
    } catch {
      return [];
    }
  }

  async submitPublication(
    data: CreateCommunityPublicationRequest,
  ): Promise<CreateCommunityPublicationResponse> {
    return communityPublicationApi.submit(data);
  }
}

export const communityPublicationRepository = new CommunityPublicationRepository();
