import { LoginPage, OAuthCallback, RequireAuth } from '@/features/auth';
import { ArenaPage, HomePage, LeaderboardsPage, ProfilePage } from '@/pages';
import { Navigate, createBrowserRouter } from 'react-router-dom';
import { App as PortalApp } from './App';

export const router = createBrowserRouter([
  {
    path: '/auth/callback',
    element: <OAuthCallback />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/portal',
    element: <PortalApp />,
  },
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: '/game',
        element: <HomePage />,
      },
      {
        path: '/arena',
        element: <ArenaPage />,
      },
      {
        path: '/game/arena',
        element: <ArenaPage />,
      },
      {
        path: '/profile/:callsign',
        element: <ProfilePage />,
      },
      {
        path: '/game/profile/:callsign',
        element: <ProfilePage />,
      },
      {
        path: '/leaderboards',
        element: <LeaderboardsPage />,
      },
      {
        path: '/game/leaderboards',
        element: <LeaderboardsPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
