export const ROUTES = {
  ROOT: '/',
  OVERVIEW: '/overview',
  FSD: '/fsd',
  IPC: '/ipc',
  SCHEDULER: '/scheduler',
  SETTINGS: '/settings',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
