import { App, AppProviders } from '@/app';
import { DesktopErrorBoundary } from '@/shared/ui';
import React from 'react';
import ReactDOM from 'react-dom/client';
import '@/app/styles/global.css';

const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <DesktopErrorBoundary>
        <AppProviders>
          <App />
        </AppProviders>
      </DesktopErrorBoundary>
    </React.StrictMode>,
  );
}
