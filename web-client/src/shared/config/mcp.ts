export interface AiClientGuide {
  id: 'gemini' | 'claude' | 'cursor';
  name: string;
  badge: string;
  badgeType: 'recommended' | 'desktop' | 'dev';
  icon: 'sparkles' | 'bot' | 'terminal';
  accentColor: string;
  description: string;
  title: string;
  speedTag: string;
  steps: {
    number: number;
    title: string;
    description: string;
    actionLabel?: string;
    actionUrl?: string;
    actionType?: 'link' | 'copy';
    codeSnippet?: string;
    successBadge?: string;
  }[];
}

export interface McpPromptItem {
  id: string;
  category: string;
  icon: 'orbit' | 'book-open' | 'compass' | 'sparkles';
  accentColor: string;
  prompt: string;
}

export interface McpFaqItem {
  id: string;
  question: string;
  answer: string;
  icon: 'sparkles' | 'laptop' | 'heart' | 'power';
  accentColor: string;
}

export const MCP_CONFIG = {
  serverUrl: 'https://api.cosmolost.space/mcp/sse',
  localServerUrl: 'http://localhost:8005/sse',
  geminiChatUrl: 'https://gemini.google.com/',
  geminiConnectorsUrl: 'https://gemini.google.com/extensions',
  version: 'v2.4',
  releaseTitle: 'CosmoLost MCP v2.4 is Live!',
  features: [
    '1-Click setup for Cursor, Claude Desktop & ChatGPT',
    'Real-time 3D telemetry query tools for 142+ landing sites',
    'Live NASA PDS & JPL Horizons ephemeris synchronization',
  ],
};

export const AI_CLIENT_GUIDES: Record<'gemini' | 'claude' | 'cursor', AiClientGuide> = {
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    badge: 'Recommended',
    badgeType: 'recommended',
    icon: 'sparkles',
    accentColor: '#00F0FF',
    description: 'Reference setup guide for connecting compatible browser-based AI interfaces.',
    title: 'Google Gemini Connection Guide',
    speedTag: 'Setup guide',
    steps: [
      {
        number: 1,
        title: 'Copy the Server URL',
        description:
          'Click the "Copy URL" button above. The CosmoLost server endpoint will be copied to your clipboard.',
      },
      {
        number: 2,
        title: 'Open Gemini Connectors',
        description:
          'Go to the official Google Gemini Connectors settings page in a new browser tab:',
        actionLabel: 'Open Gemini Connectors',
        actionUrl: MCP_CONFIG.geminiConnectorsUrl,
        actionType: 'link',
      },
      {
        number: 3,
        title: 'Click "+ Add" and paste',
        description:
          'In settings, select "+ Add custom connector", paste the server URL, and complete the prompt.',
        successBadge: 'Connection configured',
      },
    ],
  },
  claude: {
    id: 'claude',
    name: 'Claude Desktop',
    badge: 'Desktop Client',
    badgeType: 'desktop',
    icon: 'bot',
    accentColor: '#FF9D35',
    description: 'Connect via configuration file in the Claude Desktop app.',
    title: 'Claude Desktop Connection Guide',
    speedTag: 'Config file',
    steps: [
      {
        number: 1,
        title: 'Locate Claude Config',
        description:
          'Open claude_desktop_config.json in %APPDATA%\\Claude (Windows) or ~/Library/Application Support/Claude (macOS).',
      },
      {
        number: 2,
        title: 'Add CosmoLost MCP Block',
        description: 'Add the CosmoLost SSE server entry into your "mcpServers" dictionary:',
        codeSnippet: JSON.stringify(
          {
            mcpServers: {
              cosmolost: {
                transport: 'sse',
                url: MCP_CONFIG.serverUrl,
              },
            },
          },
          null,
          2
        ),
      },
      {
        number: 3,
        title: 'Restart Claude Desktop',
        description:
          'Restart Claude to automatically load the 10 CosmoLost planetary exploration tools.',
        successBadge: 'Tools available in chat',
      },
    ],
  },
  cursor: {
    id: 'cursor',
    name: 'Cursor & Other Clients',
    badge: 'For Developers',
    badgeType: 'dev',
    icon: 'terminal',
    accentColor: '#268BFF',
    description: 'Cursor, LibreChat, Open WebUI, and any client supporting MCP SSE.',
    title: 'Cursor & MCP SSE Client Guide',
    speedTag: 'SSE Endpoint',
    steps: [
      {
        number: 1,
        title: 'Copy SSE Endpoint',
        description: `Copy the CosmoLost live SSE endpoint: ${MCP_CONFIG.serverUrl}`,
        actionLabel: 'Copy Endpoint',
        actionType: 'copy',
      },
      {
        number: 2,
        title: 'Add in Cursor Settings',
        description:
          'Navigate to Cursor Settings > Features > MCP > Add New MCP Server. Select "sse" and paste the endpoint URL.',
      },
      {
        number: 3,
        title: 'Verify Connection Status',
        description:
          'Check the status light turns green. Cursor Composer will now invoke artifact and telemetry tools automatically.',
        successBadge: 'Active & connected',
      },
    ],
  },
};

export const MCP_PROMPT_ITEMS: McpPromptItem[] = [
  {
    id: 'moon-artifacts',
    category: 'MOON · ARTIFACTS',
    icon: 'orbit',
    accentColor: '#00D9F5',
    prompt: 'Find lost spacecraft on the Moon.',
  },
  {
    id: 'history-missions',
    category: 'HISTORY · MISSIONS',
    icon: 'book-open',
    accentColor: '#268BFF',
    prompt: 'Tell the story of the Apollo 11 mission.',
  },
  {
    id: 'mars-exploration',
    category: 'MARS · EXPLORATION',
    icon: 'compass',
    accentColor: '#FF9D35',
    prompt: 'Which spacecraft explored Mars?',
  },
  {
    id: 'science-discoveries',
    category: 'SCIENCE · DISCOVERIES',
    icon: 'sparkles',
    accentColor: '#00F0FF',
    prompt: 'Show exciting scientific discoveries.',
  },
];

export const MCP_FAQ_ITEMS: McpFaqItem[] = [
  {
    id: 'what-is-mcp',
    question: 'What is MCP?',
    answer:
      'Model Context Protocol (MCP) is an open standard that gives your AI direct access to verified CosmoLost data, ensuring accurate facts about space exploration.',
    icon: 'sparkles',
    accentColor: '#00F0FF',
  },
  {
    id: 'do-i-need-install',
    question: 'Do I need to install anything?',
    answer:
      'Setup depends on your AI client. Web-based interfaces connect via the endpoint URL, while desktop assistants (like Claude or Cursor) require adding the server to their configuration file.',
    icon: 'laptop',
    accentColor: '#268BFF',
  },
  {
    id: 'is-connection-free',
    question: 'Is the connection free?',
    answer:
      'CosmoLost is an open-science educational project developed for NASA Space Apps. Access to public endpoints and data is provided for research and community exploration under open-access principles.',
    icon: 'heart',
    accentColor: '#FF9D35',
  },
  {
    id: 'how-to-disconnect',
    question: 'How do I disconnect MCP?',
    answer:
      "You can disable or remove the connector at any time directly in your AI client's settings or configuration file.",
    icon: 'power',
    accentColor: '#22C55E',
  },
];
