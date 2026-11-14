import { FsdArchitecturePage } from '@/pages/fsd';
import { HomePage } from '@/pages/home';
import { IpcBridgePage } from '@/pages/ipc';
import { NotFoundPage } from '@/pages/not-found';
import { SchedulerPage } from '@/pages/scheduler';
import { SettingsPage } from '@/pages/settings';
import { ROUTES } from '@/shared/config';
import { Navigate, createHashRouter } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';

export const appRouter = createHashRouter([
  {
    path: ROUTES.ROOT,
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Navigate to={ROUTES.OVERVIEW} replace />,
      },
      {
        path: ROUTES.OVERVIEW,
        element: <HomePage />,
      },
      {
        path: ROUTES.FSD,
        element: <FsdArchitecturePage />,
      },
      {
        path: ROUTES.IPC,
        element: <IpcBridgePage />,
      },
      {
        path: ROUTES.SCHEDULER,
        element: <SchedulerPage />,
      },
      {
        path: ROUTES.SETTINGS,
        element: <SettingsPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
