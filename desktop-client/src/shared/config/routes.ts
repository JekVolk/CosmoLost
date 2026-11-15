export const ROUTES = {
  ROOT: '/',
  OVERVIEW: '/overview',
  CONTENT_FACTORY: '/content-factory',
  FSD: '/fsd',
  IPC: '/ipc',
  SCHEDULER: '/scheduler',
  MCP: '/mcp',
  SETTINGS: '/settings',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
