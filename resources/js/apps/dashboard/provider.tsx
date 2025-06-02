import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import * as React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { HelmetProvider } from 'react-helmet-async';

import { queryClient, queryConfig } from '@/lib/react-query';
import { MainErrorFallback } from '@/components/layout/error-fallbacks';
import { Spinner } from '@/components/ui/spinner';

type AppProviderProps = {
  children: React.ReactNode;
};

export const AppProvider = ({ children }: AppProviderProps) => {

  return (
    <React.Suspense
      fallback={
        <div className="flex h-screen w-screen items-center justify-center">
          <Spinner size="xl" />
        </div>
      }
    >
      <ErrorBoundary FallbackComponent={MainErrorFallback}
        onError={(error, info) => {
          // Log to error reporting service
          console.error("Application error:", error, info)
        }}>
        <HelmetProvider>
          <QueryClientProvider client={queryClient}>
            {import.meta.env.DEV && <ReactQueryDevtools />}
            {children}
          </QueryClientProvider>
        </HelmetProvider>
      </ErrorBoundary>
    </React.Suspense>
  );
};
