import { tauriCommands } from '../../api/tauri';

export interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema?: {
    type: string;
    properties?: Record<string, unknown>;
    required?: string[];
  };
}

export interface McpCallResult {
  isError: boolean;
  content: Array<{
    type: string;
    text: string;
  }>;
}

export interface McpServerCapabilities {
  tools?: boolean;
  resources?: boolean;
  prompts?: boolean;
  logging?: boolean;
}

export class McpClient {
  private serverId: string;
  private endpoint: string;
  private transport: 'sse' | 'stdio' | 'ipc';

  constructor(serverId: string, endpoint: string, transport: 'sse' | 'stdio' | 'ipc' = 'ipc') {
    this.serverId = serverId;
    this.endpoint = endpoint;
    this.transport = transport;
  }

  async ping(): Promise<number> {
    const start = performance.now();
    if (this.transport === 'ipc') {
      await tauriCommands.ping(`MCP ping for ${this.serverId}`);
    } else {
      // Simulate/HTTP check
      await new Promise((resolve) => setTimeout(resolve, 30));
    }
    return Math.round((performance.now() - start) * 100) / 100;
  }

  async listTools(): Promise<McpToolDefinition[]> {
    if (this.serverId === 'tauri') {
      return [
        {
          name: 'get_system_info',
          description: 'Fetches OS name, architecture, and Tauri runtime details',
        },
        {
          name: 'ping',
          description: 'Sends echo message to native Rust core with timestamp',
          inputSchema: {
            type: 'object',
            properties: {
              message: { type: 'string', description: 'Echo payload' },
            },
            required: ['message'],
          },
        },
        {
          name: 'window_control',
          description: 'Control window state (minimize, maximize, close)',
          inputSchema: {
            type: 'object',
            properties: {
              action: {
                type: 'string',
                enum: ['minimize', 'maximize', 'toggle_fullscreen'],
              },
            },
            required: ['action'],
          },
        },
      ];
    }

    if (this.serverId === 'chakra-ui') {
      return [
        {
          name: 'get_theme',
          description: 'Retrieves active Chakra UI v3 dark theme token configuration',
        },
        {
          name: 'list_components',
          description: 'Lists all available design system primitives and recipes',
        },
        {
          name: 'customize_theme',
          description: 'Injects dynamic palette and font scale overrides',
          inputSchema: {
            type: 'object',
            properties: {
              palette: { type: 'string', description: 'Accent color palette name' },
            },
            required: ['palette'],
          },
        },
      ];
    }

    if (this.serverId === 'context7') {
      return [
        {
          name: 'query_docs',
          description: 'Semantic query across project architecture and documentation',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'Search term or question' },
            },
            required: ['query'],
          },
        },
        {
          name: 'resolve_library_id',
          description: 'Resolves package identifier against known desktop SDK catalogs',
        },
      ];
    }

    // Generic / Custom endpoint tools
    return [
      {
        name: `${this.serverId}_health_check`,
        description: `Standard health inspection probe for ${this.serverId} MCP endpoint`,
      },
      {
        name: `${this.serverId}_execute_routine`,
        description: `Executes configured server capability at ${this.endpoint}`,
      },
    ];
  }

  async callTool(toolName: string, args: Record<string, unknown> = {}): Promise<McpCallResult> {
    const start = performance.now();

    try {
      if (this.serverId === 'tauri') {
        if (toolName === 'get_system_info') {
          const info = await tauriCommands.getSystemInfo();
          return {
            isError: false,
            content: [{ type: 'text', text: JSON.stringify(info, null, 2) }],
          };
        }
        if (toolName === 'ping') {
          const message = String(args.message || 'MCP Hello');
          const res = await tauriCommands.ping(message);
          return {
            isError: false,
            content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
          };
        }
      }

      if (this.serverId === 'chakra-ui' && toolName === 'get_theme') {
        return {
          isError: false,
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  appearance: 'dark',
                  colorPalette: 'active',
                  tokens: {
                    colors: { primary: 'blue.500', background: 'gray.950' },
                  },
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      // Default mock execution
      await new Promise((resolve) => setTimeout(resolve, 60));
      const durationMs = Math.round((performance.now() - start) * 100) / 100;

      return {
        isError: false,
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                server: this.serverId,
                tool: toolName,
                status: 'success',
                durationMs,
                executedArgs: args,
                timestamp: new Date().toISOString(),
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: `MCP Tool Execution Error: ${error instanceof Error ? error.message : 'Unknown'}`,
          },
        ],
      };
    }
  }
}
