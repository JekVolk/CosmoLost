import { usePublicationStore } from '@/entities/publication';
import { useConnectorStore } from '@/entities/social-connector';
import { localFolderConnector, telegramConnector, youtubeConnector } from '@/shared/api';
import { useState } from 'react';

export function useSocialPublishing() {
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishFeedback, setPublishFeedback] = useState<string | null>(null);

  const currentProject = usePublicationStore((s) => s.currentProject);
  const updateStatus = usePublicationStore((s) => s.updateStatus);
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
      videoFilePath: `C:\\Users\\CosmoCreator\\Videos\\CosmoLost\\${currentProject.id}.mp4`,
      title: `${currentProject.artifactName}: Таємниця сигналу`,
      seoCaption: currentProject.seoCaption,
      pinComment: currentProject.pinComment,
      privacyStatus: 'public' as const,
    };

    const results: string[] = [];

    try {
      await youtubeConnector.connect();
      const yt = await youtubeConnector.publishVideo(payload);
      if (yt.success) results.push(`YouTube (${yt.externalPostUrl})`);

      await telegramConnector.connect();
      const tg = await telegramConnector.publishVideo(payload);
      if (tg.success) results.push(`Telegram (${tg.externalPostUrl})`);

      const local = await localFolderConnector.publishVideo(payload);
      if (local.success) results.push('OS Explorer');

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
      videoFilePath: `C:\\Users\\CosmoCreator\\Videos\\CosmoLost\\${currentProject.id}.mp4`,
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
        }
      }

      if (selectedConnectorIds.includes('telegram-channel')) {
        await telegramConnector.connect();
        const res = await telegramConnector.publishVideo(payload);
        if (res.success) {
          results.push(`Telegram (${res.externalPostUrl})`);
        }
      }

      if (selectedConnectorIds.includes('local-folder-export')) {
        const res = await localFolderConnector.publishVideo(payload);
        if (res.success) {
          results.push('Нативний експорт у провідник (SEO скопійовано в буфер)');
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
      videoFilePath: '',
      title: currentProject.artifactName,
      seoCaption: currentProject.seoCaption,
      pinComment: currentProject.pinComment,
    });
    setPublishFeedback('Провідник відкрито. SEO-пакет скопійовано в буфер обміну.');
  };

  return {
    isPublishing,
    publishFeedback,
    publishToSelectedChannels,
    autoPublishAll,
    openLocalFolderDirectly,
    currentProject,
  };
}
