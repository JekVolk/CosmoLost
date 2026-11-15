import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HomePage } from '@/pages/home';
import { ArenaPage } from '@/pages/arena';
import { ProfilePage } from '@/pages/profile';
import { LeaderboardsPage } from '@/pages/leaderboards';

const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/arena', element: <ArenaPage /> },
  { path: '/profile/:callsign', element: <ProfilePage /> },
  { path: '/leaderboards', element: <LeaderboardsPage /> },
]);

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};
