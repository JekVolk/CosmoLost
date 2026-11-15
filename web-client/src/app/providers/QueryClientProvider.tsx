import {
  QueryClient,
  QueryClientProvider as TanstackQueryClientProvider,
} from '@tanstack/react-query';
import type React from 'react';
import { useState } from 'react';

export interface QueryClientProviderProps {
  children: React.ReactNode;
  client?: QueryClient;
}

export const QueryClientProvider: React.FC<QueryClientProviderProps> = ({ children, client }) => {
  const [internalClient] = useState(
    () =>
      client ??
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <TanstackQueryClientProvider client={internalClient}>{children}</TanstackQueryClientProvider>
  );
};
