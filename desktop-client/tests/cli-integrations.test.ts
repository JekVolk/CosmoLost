import { tauriCommands } from '../src/shared/api';
import {
  ImageGeneratorClient,
  MultiLlmClient,
  MusicGeneratorClient,
  VideoGeneratorClient,
} from '../src/shared/api/ai';
import { CliConfigGenerator, CliInterceptor } from '../src/shared/lib/cli-bridge';
import { describe, expect, it } from 'vitest';

describe('CLI & Multi-LLM Integrations Engine', () => {
  describe('MultiLlmClient', () => {
    it('initializes with default models and fallback behavior', async () => {
      const client = new MultiLlmClient();
      const res = await client.generate({
        prompt: 'Ping test',
      });

      expect(res.success).toBe(true);
      expect(res.tokensUsed).toBeGreaterThan(0);
      expect(res.text.toLowerCase()).toContain('pong');
    });

    it('returns structured fallback when specific provider token is missing', async () => {
      const client = new MultiLlmClient();
      const res = await client.generate({
        prompt: 'Create Mars short script',
        provider: 'claude',
      });

      expect(res.success).toBe(true);
      expect(res.provider).toBe('claude');
      expect(res.text).toContain('CosmoLost Heuristic AI Engine');
    });

    it('performs connectivity ping check for Claude and OpenAI', async () => {
      const client = new MultiLlmClient();

      // Without key
      const noKeyRes = await client.testConnection('claude', '');
      expect(noKeyRes.success).toBe(false);
      expect(noKeyRes.message).toContain('missing');

      // With provided test key (uses simulated fallback response)
      const withKeyRes = await client.testConnection('openai', 'sk-test-key-12345');
      expect(withKeyRes.success).toBe(true);
    });
  });

  describe('ImageGeneratorClient', () => {
    it('generates CDN image URL using Pollinations AI free provider', async () => {
      const client = new ImageGeneratorClient();
      const res = await client.generateImage({
        prompt: 'Mars Rover Curiosity crater panorama',
        provider: 'pollinations-free',
        size: '1024x1792',
      });

      expect(res.provider).toBe('pollinations-free');
      expect(res.imageUrl).toContain('pollinations.ai/prompt');
      expect(res.imageUrl).toContain('1024');
      expect(res.imageUrl).toContain('1792');
    });

    it('gracefully falls back to Pollinations when DALL-E token is absent', async () => {
      const client = new ImageGeneratorClient({ openaiApiKey: '' });
      const res = await client.generateImage({
        prompt: 'Apollo 11 Eagle Lunar Lander',
        provider: 'openai-dalle',
      });

      expect(res.isFallback).toBe(true);
      expect(res.imageUrl).toContain('pollinations.ai');
    });
  });

  describe('VideoGeneratorClient', () => {
    it('generates video tasks with Pollinations motion provider', async () => {
      const client = new VideoGeneratorClient();
      const res = await client.generateVideo({
        prompt: 'Mars dust devil over Opportunity Rover',
        provider: 'pollinations-motion',
      });

      expect(res.provider).toBe('pollinations-motion');
      expect(res.videoUrl).toContain('pollinations.ai');
      expect(res.status).toBe('ready');
      expect(res.taskId).toBeDefined();
    });

    it('generates local procedural video job', async () => {
      const client = new VideoGeneratorClient();
      const res = await client.generateVideo({
        prompt: 'Curiosity wheels rolling on Mount Sharp',
        provider: 'local-procedural',
      });

      expect(res.provider).toBe('local-procedural');
      expect(res.videoUrl).toContain('.mp4');
    });
  });

  describe('MusicGeneratorClient', () => {
    it('synthesizes procedural cosmic ambient audio track (55Hz drone)', async () => {
      const client = new MusicGeneratorClient();
      const res = await client.generateMusic({
        prompt: 'Deep interstellar silence',
        provider: 'procedural-drone-synth',
        durationSec: 5,
      });

      expect(res.provider).toBe('procedural-drone-synth');
      expect(res.audioUrl).toContain('data:audio/wav;base64');
      expect(res.isSynthetic).toBe(true);
      expect(res.durationSec).toBe(5);
    });

    it('fetches authentic NASA telemetry audio', async () => {
      const client = new MusicGeneratorClient();
      const res = await client.generateMusic({
        prompt: 'Mars InSight lander vibrations',
        provider: 'nasa-space-sounds',
      });

      expect(res.provider).toBe('nasa-space-sounds');
      expect(res.audioUrl).toContain('nasa.gov');
      expect(res.title).toContain('NASA InSight');
    });
  });

  describe('Under-The-Hood Auto Configuration & CLI Tool Detection', () => {
    it('detects CLI tools via tauriCommands', async () => {
      const status = await tauriCommands.detectCliTool('claude');
      expect(status.tool_name).toBe('claude');
      expect(status.installed).toBe(true);
      expect(status.path).toBeDefined();
    });

    it('auto-configures Claude Desktop / CLI MCP without terminal commands', async () => {
      const res = await tauriCommands.autoConfigureCliMcp('claude');
      expect(res.success).toBe(true);
      expect(res.client_name).toContain('claude');
      expect(res.config_file_path).toContain('claude_desktop_config.json');
      expect(res.message).toContain('автоматично підключено під капотом');
    });

    it('auto-configures Antigravity CLI MCP', async () => {
      const res = await tauriCommands.autoConfigureCliMcp('agy');
      expect(res.success).toBe(true);
      expect(res.client_name).toContain('agy');
      expect(res.config_file_path).toContain('cosmolost.json');
    });
  });

  describe('CliConfigGenerator', () => {
    const generator = new CliConfigGenerator();

    it('generates exact Claude CLI MCP registration command', () => {
      const cmd = generator.getClaudeCliCommand('scripts/cosmolost-mcp-server.mjs');
      expect(cmd).toBe('claude mcp add cosmolost -- node "scripts/cosmolost-mcp-server.mjs"');
    });

    it('generates Antigravity CLI (agy) MCP registration command', () => {
      const cmd = generator.getAgyCliCommand('scripts/cosmolost-mcp-server.mjs');
      expect(cmd).toBe('agy mcp add cosmolost "node scripts/cosmolost-mcp-server.mjs"');
    });

    it('generates valid Claude Desktop JSON config schema', () => {
      const config = generator.getClaudeDesktopConfig('C:/path/to/server.mjs') as {
        mcpServers: { cosmolost: { command: string; args: string[] } };
      };
      expect(config.mcpServers.cosmolost.command).toBe('node');
      expect(config.mcpServers.cosmolost.args).toContain('C:/path/to/server.mjs');
    });
  });

  describe('CliInterceptor', () => {
    const interceptor = new CliInterceptor();

    it('handles "status" command returning desktop metadata', async () => {
      const res = await interceptor.execute('cosmolost status');
      expect(res.exitCode).toBe(0);
      expect(res.success).toBe(true);
      expect(res.output).toContain('CosmoLost Desktop Client');
      expect(res.output).toContain('claude-cli');
      expect(res.output).toContain('antigravity-cli');
    });

    it('handles "ping" health check', async () => {
      const res = await interceptor.execute('cosmolost ping');
      expect(res.exitCode).toBe(0);
      expect(res.success).toBe(true);
      expect(res.output).toContain('pong');
      expect(res.output).toContain('8089');
    });

    it('handles "generate" command for viral script creation', async () => {
      const res = await interceptor.execute(
        'cosmolost generate --artifact opportunity-rover --rubric last-sol-drama',
      );
      expect(res.exitCode).toBe(0);
      expect(res.success).toBe(true);
      const data = res.data as { artifactId: string; rubric: string };
      expect(data.artifactId).toBe('opportunity-rover');
      expect(data.rubric).toBe('last-sol-drama');
    });

    it('handles "render" and "publish" commands', async () => {
      const renderRes = await interceptor.execute('cosmolost render --task job-mars-001');
      expect(renderRes.exitCode).toBe(0);
      expect(renderRes.output).toContain('job-mars-001');

      const pubRes = await interceptor.execute(
        'cosmolost publish --task job-mars-001 --platform YOUTUBE_SHORTS',
      );
      expect(pubRes.exitCode).toBe(0);
      expect(pubRes.output).toContain('YOUTUBE_SHORTS');
    });

    it('blocks execution when bridge is disabled', async () => {
      interceptor.setInterceptionActive(false);
      const res = await interceptor.execute('cosmolost ping');
      expect(res.success).toBe(false);
      expect(res.exitCode).toBe(2);
      expect(res.output).toContain('disabled');

      // Restore
      interceptor.setInterceptionActive(true);
    });
  });
});
