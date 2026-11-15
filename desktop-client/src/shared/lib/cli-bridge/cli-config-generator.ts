/**
 * Generates terminal installation commands and JSON configurations
 * for Claude CLI, Antigravity CLI (agy), and Codex / OpenAI CLI.
 */

export interface CliConfigContext {
  mcpScriptAbsolutePath?: string;
  customPort?: number;
  claudeApiKey?: string;
  openaiApiKey?: string;
  geminiApiKey?: string;
}

export class CliConfigGenerator {
  private defaultScriptPath = 'scripts/cosmolost-mcp-server.mjs';

  /**
   * Generates the 1-click terminal command to add CosmoLost MCP to Claude CLI
   */
  getClaudeCliCommand(scriptPath?: string): string {
    const path = scriptPath || this.defaultScriptPath;
    return `claude mcp add cosmolost -- node "${path}"`;
  }

  /**
   * Generates `claude_desktop_config.json` snippet for Claude Desktop App
   */
  getClaudeDesktopConfig(scriptPath?: string): Record<string, unknown> {
    const path = scriptPath || this.defaultScriptPath;
    return {
      mcpServers: {
        cosmolost: {
          command: 'node',
          args: [path],
          env: {
            NODE_ENV: 'production',
          },
        },
      },
    };
  }

  /**
   * Generates the 1-click terminal command to add CosmoLost MCP to Antigravity CLI (agy)
   */
  getAgyCliCommand(scriptPath?: string): string {
    const path = scriptPath || this.defaultScriptPath;
    return `agy mcp add cosmolost "node ${path}"`;
  }

  /**
   * Generates Codex / OpenAI CLI configuration snippet
   */
  getCodexCliCommand(apiKey?: string): string {
    const key = apiKey || '<YOUR_OPENAI_API_KEY>';
    return `OPENAI_API_KEY="${key}" openai api chat.completions.create -m gpt-4o -g user "Run CosmoLost video automation"`;
  }

  /**
   * Generates local Ollama / LM Studio bridge endpoint snippet
   */
  getLocalOpenApiSnippet(port = 8089): string {
    return `http://127.0.0.1:${port}/v1/chat/completions`;
  }
}

export const cliConfigGenerator = new CliConfigGenerator();
