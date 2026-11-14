import type React from 'react';
import { RouterProvider } from 'react-router-dom';
import { appRouter } from './routes/app-router';

export const App: React.FC = () => {
  return <RouterProvider router={appRouter} />;
};
