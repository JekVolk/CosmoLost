import { ArenaPage } from '@/pages/arena';
import { HomePage } from '@/pages/home';
import { LeaderboardsPage } from '@/pages/leaderboards';
import { McpConnectPage } from '@/pages/mcp-connect';
import { ProfilePage } from '@/pages/profile';
import type React from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/connect', element: <McpConnectPage /> },
  { path: '/mcp', element: <McpConnectPage /> },
  { path: '/arena', element: <ArenaPage /> },
  { path: '/profile/:callsign', element: <ProfilePage /> },
  { path: '/leaderboards', element: <LeaderboardsPage /> },
]);

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};
