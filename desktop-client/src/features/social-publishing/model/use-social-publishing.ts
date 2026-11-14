import { usePublicationStore } from '@/entities/publication';
import { useConnectorStore } from '@/entities/social-connector';
import { localFolderConnector, telegramConnector, youtubeConnector } from '@/shared/api';
import { useState } from 'react';

export function useSocialPublishing() {
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishFeedback, setPublishFeedback] = useState<string | null>(null);

  const currentProject = usePublicationStore((s) => s.currentProject);
  const selectedConnectorIds = useConnectorStore((s) => s.selectedConnectorIds);

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
    openLocalFolderDirectly,
    currentProject,
  };
}
