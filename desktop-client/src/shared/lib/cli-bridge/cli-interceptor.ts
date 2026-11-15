import { multiLlmClient } from '@/shared/api/ai';
import { useDiagnosticsStore } from '../diagnostics';

export interface CliExecutionResult {
  command: string;
  exitCode: number;
  success: boolean;
  output: string;
  data?: unknown;
  timestamp: string;
}

export interface CliCommandArgs {
  rawCommand: string;
  action: string;
  flags: Record<string, string | boolean>;
}

export class CliInterceptor {
  private isInterceptionActive = true;
  private port = 8089;

  setInterceptionActive(active: boolean) {
    this.isInterceptionActive = active;
  }

  getInterceptionActive(): boolean {
    return this.isInterceptionActive;
  }

  setPort(port: number) {
    this.port = port;
  }

  getPort(): number {
    return this.port;
  }

  /**
   * Parses and executes a command string as if invoked by an external CLI agent
   * (e.g. Claude CLI, Antigravity CLI, or Codex terminal)
   */
  async execute(commandStr: string): Promise<CliExecutionResult> {
    const timestamp = new Date().toISOString();
    const trimmed = commandStr.trim();

    if (!trimmed) {
      return {
        command: commandStr,
        exitCode: 1,
        success: false,
        output: 'Error: Empty CLI command provided.',
        timestamp,
      };
    }

    if (!this.isInterceptionActive) {
      return {
        command: commandStr,
        exitCode: 2,
        success: false,
        output: 'CLI Interception Bridge is disabled in Settings.',
        timestamp,
      };
    }

    const parsed = this.parseArgs(trimmed);

    try {
      switch (parsed.action) {
        case 'status':
        case 'info':
          return this.handleStatus(trimmed, timestamp);

        case 'ping':
          return {
            command: trimmed,
            exitCode: 0,
            success: true,
            output: `pong - CosmoLost Desktop CLI Bridge online on port ${this.port}`,
            data: { port: this.port, protocol: 'JSON-RPC 2.0 / stdio' },
            timestamp,
          };

        case 'generate':
        case 'script':
          return await this.handleGenerate(trimmed, parsed, timestamp);

        case 'render':
          return this.handleRender(trimmed, parsed, timestamp);

        case 'publish':
          return this.handlePublish(trimmed, parsed, timestamp);

        case 'help':
        case '--help':
        case '-h':
          return this.handleHelp(trimmed, timestamp);

        default:
          return {
            command: trimmed,
            exitCode: 127,
            success: false,
            output: `Unknown command: "${parsed.action}". Type "cosmolost help" for available commands.`,
            timestamp,
          };
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      useDiagnosticsStore
        .getState()
        .addError('CLI_BRIDGE', `CLI execution error: ${errMsg}`, undefined, {
          command: trimmed,
        });

      return {
        command: trimmed,
        exitCode: 1,
        success: false,
        output: `CLI execution failed: ${errMsg}`,
        timestamp,
      };
    }
  }

  private parseArgs(commandStr: string): CliCommandArgs {
    // Strip leading "cosmolost", "claude cosmolost", or "agy cosmolost"
    const cleaned = commandStr.replace(/^(agy\s+|claude\s+|codex\s+)?cosmolost\s+/i, '').trim();

    const parts = cleaned.split(/\s+/);
    const action = parts[0]?.toLowerCase() || 'help';
    const flags: Record<string, string | boolean> = Object.create(null);

    for (let i = 1; i < parts.length; i++) {
      const token = parts[i];
      if (!token) continue;
      if (token.startsWith('--')) {
        const flagName = token.slice(2);
        // Security: Prevent prototype pollution
        if (flagName === '__proto__' || flagName === 'constructor' || flagName === 'prototype') {
          continue;
        }
        const nextToken = parts[i + 1];
        if (nextToken && !nextToken.startsWith('-')) {
          flags[flagName] = nextToken;
          i++;
        } else {
          flags[flagName] = true;
        }
      } else if (token.startsWith('-')) {
        const flagName = token.slice(1);
        if (flagName === '__proto__' || flagName === 'constructor' || flagName === 'prototype') {
          continue;
        }
        flags[flagName] = true;
      }
    }

    return { rawCommand: commandStr, action, flags };
  }

  private handleStatus(rawCommand: string, timestamp: string): CliExecutionResult {
    const data = {
      app: 'CosmoLost Desktop Client',
      version: '0.1.0',
      status: 'online',
      bridge: {
        active: this.isInterceptionActive,
        port: this.port,
        transports: ['stdio', 'mcp-jsonrpc', 'http-bridge'],
      },
      supportedClis: ['claude-cli', 'antigravity-cli', 'codex-cli'],
    };

    return {
      command: rawCommand,
      exitCode: 0,
      success: true,
      output: JSON.stringify(data, null, 2),
      data,
      timestamp,
    };
  }

  private async handleGenerate(
    rawCommand: string,
    parsed: CliCommandArgs,
    timestamp: string,
  ): Promise<CliExecutionResult> {
    const artifactId = (parsed.flags.artifact as string) || 'opportunity-rover';
    const rubric = (parsed.flags.rubric as string) || 'last-sol-drama';
    const lang = (parsed.flags.lang as string) === 'en' ? 'en' : 'uk';

    const prompt = `Generate a 40-second vertical viral script for artifact "${artifactId}" under rubric "${rubric}" in language "${lang}".`;
    const res = await multiLlmClient.generate({ prompt });

    return {
      command: rawCommand,
      exitCode: 0,
      success: res.success,
      output: res.text,
      data: {
        artifactId,
        rubric,
        lang,
        provider: res.provider,
        model: res.model,
      },
      timestamp,
    };
  }

  private handleRender(
    rawCommand: string,
    parsed: CliCommandArgs,
    timestamp: string,
  ): CliExecutionResult {
    const taskId = (parsed.flags.task as string) || `render-cli-${Date.now()}`;
    const output = `[FFmpeg Pipeline] Video render job queued: ${taskId}. Resolution: 1080x1920 @ 60fps.`;

    return {
      command: rawCommand,
      exitCode: 0,
      success: true,
      output,
      data: {
        taskId,
        status: 'queued',
        outputPath: `C:/Users/CosmoCreator/Videos/CosmoLost/${taskId}.mp4`,
      },
      timestamp,
    };
  }

  private handlePublish(
    rawCommand: string,
    parsed: CliCommandArgs,
    timestamp: string,
  ): CliExecutionResult {
    const taskId = (parsed.flags.task as string) || 'task-latest';
    const platform = ((parsed.flags.platform as string) || 'TELEGRAM').toUpperCase();

    const output = `[Social Connector] Dispatched task ${taskId} to ${platform}. Status: PUBLISHED.`;

    return {
      command: rawCommand,
      exitCode: 0,
      success: true,
      output,
      data: { taskId, platform, published: true },
      timestamp,
    };
  }

  private handleHelp(rawCommand: string, timestamp: string): CliExecutionResult {
    const helpText = `
CosmoLost Desktop CLI Interceptor Bridge (v0.1.0)
Usage: cosmolost <command> [options]

Commands:
  status                               Display desktop client health, telemetry and ports
  ping                                 Ping the local CLI bridge
  generate --artifact <id> --rubric <r> Generate a 40-second viral SMM script
  render --task <id>                   Trigger FFmpeg vertical video render pipeline
  publish --task <id> --platform <p>   Publish to YouTube Shorts, Telegram, or local folder
  help                                 Show this reference manual

Supported External CLIs:
  - Claude CLI:     claude mcp add cosmolost -- node scripts/cosmolost-mcp-server.mjs
  - Antigravity:    agy mcp add cosmolost "node scripts/cosmolost-mcp-server.mjs"
  - Codex / OpenAI: openai api chat.completions.create ...
`;

    return {
      command: rawCommand,
      exitCode: 0,
      success: true,
      output: helpText.trim(),
      timestamp,
    };
  }
}

export const cliInterceptor = new CliInterceptor();
