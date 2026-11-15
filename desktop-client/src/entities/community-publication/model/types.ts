import type {
  CommunityPublicationDto,
  CreateCommunityPublicationRequest,
  CreateCommunityPublicationResponse,
} from '@/shared/api';

export interface CommunityPublicationDomainModel {
  id: string;
  missionId: string;
  artifactId?: string | null;
  missionName: string;
  artifactName?: string | null;
  title: string;
  videoUrl: string;
  platformType: string;
  authorName: string;
  isApproved: boolean;
  createdAt: string;
}

export interface ICommunityPublicationRepository {
  listApprovedPublications(params?: {
    missionId?: string;
    artifactId?: string;
    platformType?: string;
  }): Promise<CommunityPublicationDomainModel[]>;
  submitPublication(
    data: CreateCommunityPublicationRequest,
  ): Promise<CreateCommunityPublicationResponse>;
}

export type {
  CommunityPublicationDto,
  CreateCommunityPublicationRequest,
  CreateCommunityPublicationResponse,
};
