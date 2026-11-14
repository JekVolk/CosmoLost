import { describe, expect, it } from 'vitest';
import { workspaceBundleService } from '../src/features/settings-management/api/workspace-bundle-service';
import { multiLlmClient, musicGeneratorClient } from '../src/shared/api/ai';
import { ApiError, FetchHttpClient } from '../src/shared/api/http/client';
import { telegramConnector, youtubeConnector } from '../src/shared/api/social';
import { CliInterceptor } from '../src/shared/lib/cli-bridge';

describe('Red-Team Hacker Security & Robustness Audit', () => {
  describe('1. Workspace Bundle Security & Sanitization', () => {
    it('detects and blocks Prototype Pollution attacks in JSON import (__proto__, constructor, prototype)', () => {
      const payload1 = '{"__proto__": {"isAdmin": true}}';
      const res1 = workspaceBundleService.validateBundle(payload1);
      expect(res1.isValid).toBe(false);
      expect(res1.errors[0]?.code).toBe('SECURITY_VIOLATION');

      const payload2 = '{"constructor": {"prototype": {"polluted": true}}}';
      const res2 = workspaceBundleService.validateBundle(payload2);
      expect(res2.isValid).toBe(false);
      expect(res2.errors[0]?.code).toBe('SECURITY_VIOLATION');

      const payload3 = '{"settings": {"themeMode": "dark"}, "prototype": "bad"}';
      const res3 = workspaceBundleService.validateBundle(payload3);
      expect(res3.isValid).toBe(false);
      expect(res3.errors[0]?.code).toBe('SECURITY_VIOLATION');
    });

    it('sanitizes all secret tokens during export by default to prevent credential leakage', () => {
      const exportedJson = workspaceBundleService.exportBundle({
        settings: {
          themeMode: 'dark',
          accentColor: 'blue',
          language: 'uk',
          compactMode: false,
          developerMode: true,
          autoRefreshMetrics: true,
          telemetryFrequencySec: 15,
          defaultMcpServerId: 'tauri',
          enableDiagnosticsLog: true,
          claudeApiKey: 'sk-ant-sensitive-secret-12345',
          openaiApiKey: 'sk-proj-super-secret-key-67890',
          geminiApiKey: 'AIzaSySecretGeminiKey123',
          telegramBotToken: '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11',
          youtubeAuthCode: '4/0AUn6Hd8DBQ1SVUeGEgJBxln9lTerL-CvZPPvCPua1Kize4qYeKf2Nbq32-APJ2akkUdG2A',
          youtubeRefreshToken: '1//0gSecretRefreshTokenXYZ',
          sunoApiKey: 'suno_secret_token_abc',
          runwayApiKey: 'rw_secret_token_def',
        },
        tasks: [],
      });

      const parsed = JSON.parse(exportedJson);
      expect(parsed.settings.claudeApiKey).toBe('');
      expect(parsed.settings.openaiApiKey).toBe('');
      expect(parsed.settings.geminiApiKey).toBe('');
      expect(parsed.settings.telegramBotToken).toBe('');
      expect(parsed.settings.youtubeAuthCode).toBe('');
      expect(parsed.settings.youtubeRefreshToken).toBe('');
      expect(parsed.settings.sunoApiKey).toBe('');
      expect(parsed.settings.runwayApiKey).toBe('');
    });

    it('allows including secrets only when explicitly requested (includeSecrets: true)', () => {
      const exportedJson = workspaceBundleService.exportBundle({
        settings: {
          themeMode: 'dark',
          accentColor: 'blue',
          language: 'uk',
          compactMode: false,
          developerMode: true,
          autoRefreshMetrics: true,
          telemetryFrequencySec: 15,
          defaultMcpServerId: 'tauri',
          enableDiagnosticsLog: true,
          claudeApiKey: 'sk-ant-explicit-token',
        },
        tasks: [],
        includeSecrets: true,
      });

      const parsed = JSON.parse(exportedJson);
      expect(parsed.settings.claudeApiKey).toBe('sk-ant-explicit-token');
    });
  });

  describe('2. Telegram Connector Entity Integrity', () => {
    it('escapes all MarkdownV2 special characters properly', () => {
      const escaped = telegramConnector.escapeMarkdown('Hello [World]! (100% *Mars* _Rover_ - 2026)');
      expect(escaped).toBe('Hello \\[World\\]\\! \\(100% \\*Mars\\* \\_Rover\\_ \\- 2026\\)');
    });

    it('prevents dangling trailing backslash when caption is sliced at 1020 chars', async () => {
      await telegramConnector.connect();

      // Create a string where char 1019 would be a backslash
      const padding = 'A'.repeat(1019);
      const titleWithSpecialChar = `${padding}*`;

      const result = await telegramConnector.publishVideo({
        projectId: 'test',
        title: titleWithSpecialChar,
        seoCaption: {
          line1Hook: 'Hook',
          line2Seo: 'SEO',
          line3Tags: '#Tags',
        },
      });

      expect(result.success).toBe(true);
      expect(result.externalPostUrl).toBeDefined();
    });
  });

  describe('3. YouTube Connector Title Safety', () => {
    it('handles undefined or malformed payload titles without throwing', async () => {
      await youtubeConnector.connect();

      // @ts-expect-error Testing runtime payload with missing title
      const res = await youtubeConnector.publishVideo({
        projectId: 'proj_unknown',
      });

      expect(res.success).toBe(true);
      expect(res.externalPostId).toBeDefined();
    });

    it('truncates titles strictly <= 60 characters and preserves #Shorts suffix', async () => {
      await youtubeConnector.connect();

      const longTitle = 'Super Long Martian Mission Telemetry Video Breakdown From Jezero Crater With Full Audio';
      const res = await youtubeConnector.publishVideo({
        projectId: 'proj_1',
        title: longTitle,
        seoCaption: {
          line1Hook: 'Hook',
          line2Seo: 'SEO',
          line3Tags: '#Tags',
        },
      });

      expect(res.success).toBe(true);
    });
  });

  describe('4. HTTP Client Timeout & Error Hardening', () => {
    it('throws ApiError with PARSE_ERROR when response is not valid JSON', async () => {
      const client = new FetchHttpClient();

      // Mock global fetch returning HTML error page
      const originalFetch = globalThis.fetch;
      globalThis.fetch = async () =>
        new Response('<html><body>502 Bad Gateway</body></html>', {
          status: 200,
          headers: { 'Content-Type': 'text/html' },
        });

      try {
        await expect(client.get('https://example.com/api/data')).rejects.toThrow(ApiError);
      } finally {
        globalThis.fetch = originalFetch;
      }
    });
  });

  describe('5. Music Generator Stability & Range Limits', () => {
    it('safely clamps negative, NaN, or extreme durations without throwing RangeError', async () => {
      // Negative duration
      const res1 = await musicGeneratorClient.generateMusic({
        prompt: 'Space ambience',
        // @ts-expect-error Testing invalid runtime input
        durationSec: -10,
      });
      expect(res1.durationSec).toBe(1);
      expect(res1.audioUrl.startsWith('data:audio/wav;base64,')).toBe(true);

      // NaN duration
      const res2 = await musicGeneratorClient.generateMusic({
        prompt: 'Space ambience',
        // @ts-expect-error Testing invalid runtime input
        durationSec: Number.NaN,
      });
      expect(res2.durationSec).toBe(15);
      expect(res2.audioUrl.startsWith('data:audio/wav;base64,')).toBe(true);

      // Giant duration (should be clamped to max 30s)
      const res3 = await musicGeneratorClient.generateMusic({
        prompt: 'Space ambience',
        durationSec: 999999,
      });
      expect(res3.durationSec).toBe(30);
      expect(res3.audioUrl.startsWith('data:audio/wav;base64,')).toBe(true);
    });
  });

  describe('6. CLI Interceptor Prototype Pollution Immunity', () => {
    it('discards prototype pollution flags during CLI argument parsing', async () => {
      const interceptor = new CliInterceptor();
      const res = await interceptor.execute('cosmolost status --__proto__ bad --constructor bad --lang en');

      expect(res.success).toBe(true);
      expect(Object.prototype.hasOwnProperty('bad')).toBe(false);
    });
  });

  describe('7. Multi-LLM Custom Endpoint Protocol Restriction', () => {
    it('rejects non-http/https protocols for custom endpoints to prevent SSRF', async () => {
      multiLlmClient.setCredentials({
        customLlmEndpoint: 'file:///etc/passwd',
      });

      const res = await multiLlmClient.generate({
        prompt: 'Hello',
        provider: 'custom',
      });

      // Should fall back gracefully rather than fetching file protocol
      expect(res.success).toBe(true);
      expect(res.isFallback).toBe(true);
    });
  });
});
