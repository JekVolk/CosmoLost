import { describe, expect, it } from 'vitest';
import {
  localFolderConnector,
  telegramConnector,
  youtubeConnector,
} from '../src/shared/api/social';

describe('Social Media Distribution Connectors', () => {
  describe('YouTubeShortsConnector', () => {
    it('fails publishing if not connected', async () => {
      await youtubeConnector.disconnect();
      const res = await youtubeConnector.publishVideo({
        projectId: 'test_1',
        videoFilePath: 'video.mp4',
        title: 'Last Sol of Opportunity',
        seoCaption: {
          line1Hook: 'Hook',
          line2Seo: 'SEO',
          line3Tags: '#tags',
        },
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain('not connected');
    });

    it('enforces <= 60 characters and #Shorts suffix when connected', async () => {
      await youtubeConnector.connect({ token: 'test_token' });
      expect(youtubeConnector.status).toBe('CONNECTED');

      const longTitle =
        'Very Long Title That Definitely Exceeds The Sixty Characters Maximum Allowed By YouTube Data API Specification';
      const res = await youtubeConnector.publishVideo({
        projectId: 'test_2',
        videoFilePath: 'video.mp4',
        title: longTitle,
        seoCaption: {
          line1Hook: 'Hook',
          line2Seo: 'SEO',
          line3Tags: '#space #nasa',
        },
        pinComment: 'Discussion comment?',
      });

      expect(res.success).toBe(true);
      expect(res.externalPostId).toContain('yt_shorts_');
      expect(res.externalPostUrl).toContain('https://youtube.com/shorts/');
    });
  });

  describe('TelegramChannelConnector', () => {
    it('escapes MarkdownV2 special characters in caption', async () => {
      await telegramConnector.connect({
        botToken: '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11',
        chatId: '@cosmolost_hq',
      });
      expect(telegramConnector.status).toBe('CONNECTED');

      const res = await telegramConnector.publishVideo({
        projectId: 'test_tg',
        videoFilePath: 'video.mp4',
        title: 'Opportunity: Mars [Exploration] & Science!',
        seoCaption: {
          line1Hook: 'Did you know? - Sol 5111 was final.',
          line2Seo: 'Breakdown of dust tau = 10.8 (extreme storm).',
          line3Tags: '#nasa #mars #space',
        },
      });

      expect(res.success).toBe(true);
      expect(res.externalPostUrl).toContain('https://t.me/cosmolost_channel/');
    });
  });

  describe('LocalFolderExporterConnector', () => {
    it('opens local file manager and copies complete SEO package', async () => {
      await localFolderConnector.connect();
      expect(localFolderConnector.status).toBe('CONNECTED');

      const res = await localFolderConnector.publishVideo({
        projectId: 'project_opportunity_sol5111',
        videoFilePath: 'C:\\Videos\\out.mp4',
        title: 'Opportunity Rover Last Sol',
        seoCaption: {
          line1Hook: 'Останній день марсохода 👇',
          line2Seo: 'Повна історія Opportunity. 3D-мапа: cosmolost.lihtar.org',
          line3Tags: '#space #nasa #mars',
        },
        pinComment: 'Чи варто повернути марсохід на Землю?',
      });

      expect(res.success).toBe(true);
      expect(res.externalPostId).toBe('project_opportunity_sol5111');
      expect(res.externalPostUrl).toContain('project_opportunity_sol5111');
    });
  });
});
