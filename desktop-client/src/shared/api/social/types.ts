export type ConnectorPlatformType =
  | 'YOUTUBE_SHORTS'
  | 'TELEGRAM_CHANNEL'
  | 'TIKTOK'
  | 'LOCAL_FOLDER';

export type ConnectionStatus = 'DISCONNECTED' | 'CONNECTED' | 'EXPIRED' | 'ERROR';

export interface PublishPayload {
  projectId: string;
  videoFilePath: string;
  title: string;
  seoCaption: {
    line1Hook: string;
    line2Seo: string;
    line3Tags: string;
  };
  pinComment?: string;
  privacyStatus?: 'public' | 'unlisted' | 'private';
}

export interface PublishResult {
  success: boolean;
  externalPostId?: string;
  externalPostUrl?: string;
  error?: string;
  timestamp: string;
}

export interface PinCommentResult {
  success: boolean;
  commentId?: string;
  error?: string;
}

export interface IPlatformConnector {
  readonly id: string;
  readonly platformType: ConnectorPlatformType;
  readonly displayName: string;
  status: ConnectionStatus;

  connect(authParams?: Record<string, unknown>): Promise<boolean>;
  disconnect(): Promise<void>;
  publishVideo(payload: PublishPayload): Promise<PublishResult>;
  postPinComment?(postId: string, commentText: string): Promise<PinCommentResult>;
}
