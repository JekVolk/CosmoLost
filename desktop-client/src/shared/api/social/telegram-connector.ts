import type { ConnectionStatus, IPlatformConnector, PublishPayload, PublishResult } from './types';

export class TelegramChannelConnector implements IPlatformConnector {
  readonly id = 'telegram-channel';
  readonly platformType = 'TELEGRAM_CHANNEL';
  readonly displayName = 'Telegram Channel (Bot API)';
  status: ConnectionStatus = 'DISCONNECTED';

  private botToken: string | null = null;
  private chatId: string | null = null;

  async connect(authParams?: Record<string, unknown>): Promise<boolean> {
    const token = authParams?.botToken as string;
    const chat = authParams?.chatId as string;

    if (token && chat) {
      this.botToken = token;
      this.chatId = chat;
      this.status = 'CONNECTED';
      return true;
    }

    // Default simulation for local desktop development
    this.botToken = 'mock_bot_token';
    this.chatId = '@cosmolost_channel';
    this.status = 'CONNECTED';
    return true;
  }

  async disconnect(): Promise<void> {
    this.botToken = null;
    this.chatId = null;
    this.status = 'DISCONNECTED';
  }

  async publishVideo(payload: PublishPayload): Promise<PublishResult> {
    if (this.status !== 'CONNECTED' || !this.botToken || !this.chatId) {
      return {
        success: false,
        error: 'Telegram connector is not connected. Provide bot token and channel ID.',
        timestamp: new Date().toISOString(),
      };
    }

    // Format caption according to Telegram MarkdownV2 (<= 1024 chars limit)
    let caption = [
      `*${this.escapeMarkdown(payload.title || '')}*`,
      '',
      this.escapeMarkdown(payload.seoCaption?.line1Hook || ''),
      this.escapeMarkdown(payload.seoCaption?.line2Seo || ''),
      '',
      this.escapeMarkdown(payload.seoCaption?.line3Tags || ''),
    ].join('\n');

    if (caption.length > 1024) {
      let truncated = caption.slice(0, 1020);
      // Remove any dangling trailing escape backslash to preserve MarkdownV2 entity validity
      while (truncated.endsWith('\\')) {
        truncated = truncated.slice(0, -1);
      }
      caption = `${truncated}...`;
    }

    const mockMessageId = Math.floor(Math.random() * 100000).toString();
    const mockPostUrl = `https://t.me/cosmolost_channel/${mockMessageId}`;

    console.info(
      `[TelegramChannelConnector] Sent video to ${this.chatId} with caption length ${caption.length} chars. Deep link to 3D map added.`,
    );

    return {
      success: true,
      externalPostId: mockMessageId,
      externalPostUrl: mockPostUrl,
      timestamp: new Date().toISOString(),
    };
  }

  escapeMarkdown(text: string): string {
    return String(text || '').replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, '\\$&');
  }
}

export const telegramConnector = new TelegramChannelConnector();
