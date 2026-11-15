import { usePublicationStore } from '@/entities/publication';
import { useConnectorStore } from '@/entities/social-connector';
import { localFolderConnector, telegramConnector, youtubeConnector } from '@/shared/api';
import { useState } from 'react';

export function useSocialPublishing() {
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishFeedback, setPublishFeedback] = useState<string | null>(null);

  const currentProject = usePublicationStore((s) => s.currentProject);
  const updateStatus = usePublicationStore((s) => s.updateStatus);
  const updateDispatch = usePublicationStore((s) => s.updateDispatch);
  const setExternalPostUrl = usePublicationStore((s) => s.setExternalPostUrl);
  const selectedConnectorIds = useConnectorStore((s) => s.selectedConnectorIds);

  const autoPublishAll = async () => {
    if (!currentProject) {
      setPublishFeedback('Створіть або оберіть проект перед автопублікацією.');
      return;
    }

    setIsPublishing(true);
    setPublishFeedback(null);

    const payload = {
      projectId: currentProject.id,
      videoFilePath:
        currentProject.localVideoPath ||
        `C:\\Users\\CosmoCreator\\Videos\\CosmoLost\\${currentProject.id}.mp4`,
      title: `${currentProject.artifactName}: Таємниця сигналу`,
      seoCaption: currentProject.seoCaption,
      pinComment: currentProject.pinComment,
      privacyStatus: 'public' as const,
    };

    const results: string[] = [];

    try {
      await youtubeConnector.connect();
      const yt = await youtubeConnector.publishVideo(payload);
      if (yt.success) {
        results.push(`YouTube (${yt.externalPostUrl})`);
        updateDispatch({
          id: `disp-yt-${Date.now()}`,
          projectId: currentProject.id,
          connectorId: 'youtube-shorts',
          platformType: 'YOUTUBE_SHORTS',
          dispatchStatus: 'PUBLISHED',
          pinCommentStatus: 'PINNED',
          externalPostId: yt.externalPostId,
          externalPostUrl: yt.externalPostUrl,
          dispatchedAt: new Date().toISOString(),
        });
      }

      await telegramConnector.connect();
      const tg = await telegramConnector.publishVideo(payload);
      if (tg.success) {
        results.push(`Telegram (${tg.externalPostUrl})`);
        updateDispatch({
          id: `disp-tg-${Date.now()}`,
          projectId: currentProject.id,
          connectorId: 'telegram-channel',
          platformType: 'TELEGRAM_CHANNEL',
          dispatchStatus: 'PUBLISHED',
          pinCommentStatus: 'NOT_APPLICABLE',
          externalPostId: tg.externalPostId,
          externalPostUrl: tg.externalPostUrl,
          dispatchedAt: new Date().toISOString(),
        });
      }

      const local = await localFolderConnector.publishVideo(payload);
      if (local.success) {
        results.push('OS Explorer');
        updateDispatch({
          id: `disp-local-${Date.now()}`,
          projectId: currentProject.id,
          connectorId: 'local-folder-export',
          platformType: 'LOCAL_FOLDER',
          dispatchStatus: 'MANUAL_EXPORTED',
          pinCommentStatus: 'MANUAL_COPIED',
          dispatchedAt: new Date().toISOString(),
        });
      }

      updateStatus('PUBLISHED');
      setPublishFeedback(`🚀 Авто-публікація завершена успішно: ${results.join(' • ')}`);
    } catch (e) {
      setPublishFeedback(
        `Помилка автопублікації: ${e instanceof Error ? e.message : 'Unknown error'}`,
      );
    } finally {
      setIsPublishing(false);
    }
  };

  const publishToSelectedChannels = async () => {
    if (!currentProject) {
      setPublishFeedback('Створіть або оберіть проект перед публікацією.');
      return;
    }

    setIsPublishing(true);
    setPublishFeedback(null);

    const payload = {
      projectId: currentProject.id,
      videoFilePath:
        currentProject.localVideoPath ||
        `C:\\Users\\CosmoCreator\\Videos\\CosmoLost\\${currentProject.id}.mp4`,
      title: `${currentProject.artifactName}: Таємниця сигналу`,
      seoCaption: currentProject.seoCaption,
      pinComment: currentProject.pinComment,
      privacyStatus: 'public' as const,
    };

    const results: string[] = [];

    try {
      if (selectedConnectorIds.includes('youtube-shorts')) {
        await youtubeConnector.connect();
        const res = await youtubeConnector.publishVideo(payload);
        if (res.success) {
          results.push(`YouTube Shorts (${res.externalPostUrl})`);
          updateDispatch({
            id: `disp-yt-${Date.now()}`,
            projectId: currentProject.id,
            connectorId: 'youtube-shorts',
            platformType: 'YOUTUBE_SHORTS',
            dispatchStatus: 'PUBLISHED',
            pinCommentStatus: 'PINNED',
            externalPostId: res.externalPostId,
            externalPostUrl: res.externalPostUrl,
            dispatchedAt: new Date().toISOString(),
          });
        }
      }

      if (selectedConnectorIds.includes('telegram-channel')) {
        await telegramConnector.connect();
        const res = await telegramConnector.publishVideo(payload);
        if (res.success) {
          results.push(`Telegram (${res.externalPostUrl})`);
          updateDispatch({
            id: `disp-tg-${Date.now()}`,
            projectId: currentProject.id,
            connectorId: 'telegram-channel',
            platformType: 'TELEGRAM_CHANNEL',
            dispatchStatus: 'PUBLISHED',
            pinCommentStatus: 'NOT_APPLICABLE',
            externalPostId: res.externalPostId,
            externalPostUrl: res.externalPostUrl,
            dispatchedAt: new Date().toISOString(),
          });
        }
      }

      if (selectedConnectorIds.includes('local-folder-export')) {
        const res = await localFolderConnector.publishVideo(payload);
        if (res.success) {
          results.push('Нативний експорт у провідник (SEO скопійовано в буфер)');
          updateDispatch({
            id: `disp-local-${Date.now()}`,
            projectId: currentProject.id,
            connectorId: 'local-folder-export',
            platformType: 'LOCAL_FOLDER',
            dispatchStatus: 'MANUAL_EXPORTED',
            pinCommentStatus: 'MANUAL_COPIED',
            dispatchedAt: new Date().toISOString(),
          });
        }
      }

      if (results.length > 0) {
        updateStatus('PUBLISHED');
      }

      setPublishFeedback(`Успішно опрацьовано: ${results.join('; ')}`);
    } catch (e) {
      setPublishFeedback(`Помилка публікації: ${e instanceof Error ? e.message : 'Unknown error'}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const openLocalFolderDirectly = async () => {
    if (!currentProject) return;
    await localFolderConnector.publishVideo({
      projectId: currentProject.id,
      videoFilePath: currentProject.localVideoPath || '',
      title: currentProject.artifactName,
      seoCaption: currentProject.seoCaption,
      pinComment: currentProject.pinComment,
    });
    updateDispatch({
      id: `disp-local-${Date.now()}`,
      projectId: currentProject.id,
      connectorId: 'local-folder-export',
      platformType: 'LOCAL_FOLDER',
      dispatchStatus: 'MANUAL_EXPORTED',
      pinCommentStatus: 'MANUAL_COPIED',
      dispatchedAt: new Date().toISOString(),
    });
    setPublishFeedback('Провідник відкрито. SEO-пакет скопійовано в буфер обміну.');
  };

  const markPublishedManually = (url: string) => {
    if (!currentProject) return;
    const cleanUrl = url.trim();
    if (!cleanUrl) {
      setPublishFeedback('Введіть коректну веб-адресу опублікованого відео (TikTok, Reels, тощо).');
      return;
    }

    setExternalPostUrl(cleanUrl);
    updateDispatch({
      id: `disp-manual-${Date.now()}`,
      projectId: currentProject.id,
      connectorId: 'manual-link',
      platformType: cleanUrl.includes('tiktok')
        ? 'TIKTOK'
        : cleanUrl.includes('instagram')
          ? 'INSTAGRAM_REELS'
          : 'OTHER',
      dispatchStatus: 'PUBLISHED',
      pinCommentStatus: 'MANUAL_COPIED',
      externalPostUrl: cleanUrl,
      dispatchedAt: new Date().toISOString(),
    });

    setPublishFeedback(`✅ Ролик позначено як опублікований вручну: ${cleanUrl}`);
  };

  return {
    isPublishing,
    publishFeedback,
    publishToSelectedChannels,
    autoPublishAll,
    openLocalFolderDirectly,
    markPublishedManually,
    currentProject,
  };
}
