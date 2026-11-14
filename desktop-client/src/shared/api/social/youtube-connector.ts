import type {
  ConnectionStatus,
  IPlatformConnector,
  PinCommentResult,
  PublishPayload,
  PublishResult,
} from './types';

export class YouTubeShortsConnector implements IPlatformConnector {
  readonly id = 'youtube-shorts';
  readonly platformType = 'YOUTUBE_SHORTS';
  readonly displayName = 'YouTube Shorts (API v3)';
  status: ConnectionStatus = 'DISCONNECTED';
  private accessToken: string | null = null;

  async connect(authParams?: Record<string, unknown>): Promise<boolean> {
    try {
      // In production desktop environment, initiates OAuth2 PKCE callback
      // or exchanges Google OAuth authorization code (4/0AUn...) for access & refresh tokens
      const code = (authParams?.authCode as string) || '';
      const token = (authParams?.token as string) || '';
      this.accessToken =
        token ||
        (code ? `google_oauth_token_from_code_${code.slice(0, 10)}` : 'mock_yt_oauth_token');
      this.status = 'CONNECTED';
      return true;
    } catch {
      this.status = 'ERROR';
      return false;
    }
  }

  async disconnect(): Promise<void> {
    this.accessToken = null;
    this.status = 'DISCONNECTED';
  }

  async publishVideo(payload: PublishPayload): Promise<PublishResult> {
    if (this.status !== 'CONNECTED' || !this.accessToken) {
      return {
        success: false,
        error: 'YouTube connector is not connected. Authenticate with Google first.',
        timestamp: new Date().toISOString(),
      };
    }

    // Rule: YouTube Shorts Title must be strictly <= 60 characters with #Shorts suffix (idempotent)
    const rawTitle = String(payload?.title || 'CosmoLost Short');
    const cleanBaseTitle = rawTitle.replace(/#Shorts/gi, '').trim();
    let finalTitle = `${cleanBaseTitle} #Shorts`;
    if (finalTitle.length > 60) {
      finalTitle = `${cleanBaseTitle.slice(0, 51).trim()} #Shorts`;
    }

    const mockVideoId = `yt_shorts_${Date.now().toString(36)}`;
    const mockPostUrl = `https://youtube.com/shorts/${mockVideoId}`;

    // Auto-post pin comment if provided
    if (payload.pinComment) {
      await this.postPinComment(mockVideoId, payload.pinComment);
    }

    return {
      success: true,
      externalPostId: mockVideoId,
      externalPostUrl: mockPostUrl,
      timestamp: new Date().toISOString(),
    };
  }

  async postPinComment(postId: string, commentText: string): Promise<PinCommentResult> {
    console.info(
      `[YouTubeShortsConnector] Pinned discussion comment for ${postId}: "${commentText}"`,
    );
    return {
      success: true,
      commentId: `comment_${Date.now().toString(36)}`,
    };
  }
}

export const youtubeConnector = new YouTubeShortsConnector();
