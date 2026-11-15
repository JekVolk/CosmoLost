import { tauriCommands } from '../tauri';
import type { ConnectionStatus, IPlatformConnector, PublishPayload, PublishResult } from './types';

export class LocalFolderExporterConnector implements IPlatformConnector {
  readonly id = 'local-folder-export';
  readonly platformType = 'LOCAL_FOLDER';
  readonly displayName = 'Відкрити папку з відео (OS Explorer + Clipboard)';
  status: ConnectionStatus = 'CONNECTED';

  async connect(): Promise<boolean> {
    this.status = 'CONNECTED';
    return true;
  }

  async disconnect(): Promise<void> {
    // Local exporter is always available offline
    this.status = 'CONNECTED';
  }

  async publishVideo(payload: PublishPayload): Promise<PublishResult> {
    const seoBundleText = [
      payload.seoCaption.line1Hook,
      '',
      payload.seoCaption.line2Seo,
      '',
      payload.seoCaption.line3Tags,
      payload.pinComment ? `\n📌 Закріплений коментар:\n${payload.pinComment}` : '',
    ].join('\n');

    // 1. Copy full SEO package to system clipboard
    await tauriCommands.copyToClipboard(seoBundleText, 'SEO_BUNDLE');

    // 2. Trigger native OS file manager with selected video file
    const openResult = await tauriCommands.openFolderWithVideo(payload.projectId);

    console.info(
      `[LocalFolderExporterConnector] Opened OS explorer: ${openResult.opened_path}. SEO package copied to clipboard.`,
    );

    return {
      success: true,
      externalPostId: payload.projectId,
      externalPostUrl: openResult.opened_path,
      timestamp: new Date().toISOString(),
    };
  }
}

export const localFolderConnector = new LocalFolderExporterConnector();
