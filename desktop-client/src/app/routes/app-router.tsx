import { ROUTES } from '@/shared/config';
import { RouteSuspense } from '@/shared/ui';
import React, { Suspense } from 'react';
import { Navigate, createHashRouter } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';

const HomePage = React.lazy(() => import('@/pages/home').then((m) => ({ default: m.HomePage })));
const FsdArchitecturePage = React.lazy(() =>
  import('@/pages/fsd').then((m) => ({ default: m.FsdArchitecturePage })),
);
const IpcBridgePage = React.lazy(() =>
  import('@/pages/ipc').then((m) => ({ default: m.IpcBridgePage })),
);
const SchedulerPage = React.lazy(() =>
  import('@/pages/scheduler').then((m) => ({ default: m.SchedulerPage })),
);
const SettingsPage = React.lazy(() =>
  import('@/pages/settings').then((m) => ({ default: m.SettingsPage })),
);
const NotFoundPage = React.lazy(() =>
  import('@/pages/not-found').then((m) => ({ default: m.NotFoundPage })),
);

const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<RouteSuspense />}>
    <Component />
  </Suspense>
);

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
        element: withSuspense(HomePage),
      },
      {
        path: ROUTES.FSD,
        element: withSuspense(FsdArchitecturePage),
      },
      {
        path: ROUTES.IPC,
        element: withSuspense(IpcBridgePage),
      },
      {
        path: ROUTES.SCHEDULER,
        element: withSuspense(SchedulerPage),
      },
      {
        path: ROUTES.SETTINGS,
        element: withSuspense(SettingsPage),
      },
      {
        path: '*',
        element: withSuspense(NotFoundPage),
      },
    ],
  },
]);
