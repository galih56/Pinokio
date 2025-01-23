import { QueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Outlet, RouterProvider, createBrowserRouter, useLocation, useRouteError } from 'react-router-dom';

import { paths } from '@/apps/issue-tracker/paths';
import { ProtectedRoute } from '@/lib/auth';
import { queryClient } from '@/lib/react-query';
import { Layout } from './layout';

const AppRootErrorBoundary = () => {
  const error = useRouteError();
  return <div>Something went wrong!</div>;
};

export const createAppRouter = (queryClient: QueryClient) => {
  return createBrowserRouter([
    {
      path: paths.home.path,
      element: (
          <Layout>
            <Outlet />
          </Layout>
      ),
      ErrorBoundary: AppRootErrorBoundary,
      children: [
        {
          path: paths.home.path,
          lazy: async () => {
            const { IssueTrackerFormRoute } = await import('@/pages/app/issues/issue-tracker-form');
            return {
              Component: IssueTrackerFormRoute,
            };
          },
          ErrorBoundary: AppRootErrorBoundary,
        },
        {
          path: paths.issues.path,
          lazy: async () => {
            const { IssuesRoute, issuesLoader } = await import(
              '@/pages/app/issues/issues'
            );
            return {
              Component: IssuesRoute,
              loader: issuesLoader(queryClient),
            };
          },
          ErrorBoundary: AppRootErrorBoundary,
        },
        {
          path: paths.issue.path,
          lazy: async () => {
            const { IssueRoute, issueLoader } = await import(
              '@/pages/app/issues/issue'
            );
            return {
              Component: IssueRoute,
              loader: issueLoader(queryClient),
            };
          },
          ErrorBoundary: AppRootErrorBoundary,
        },
      ],
    },
    {
      path: '*',
      lazy: async () => {
        const { NotFoundRoute } = await import('@/pages/not-found');
        return {
          Component: NotFoundRoute,
        };
      },
      ErrorBoundary: AppRootErrorBoundary,
    },
  ], {
    basename : '/'
  })
};

export const AppRouter = () => {
  const router = useMemo(() => createAppRouter(queryClient), [queryClient]);
  
  return <RouterProvider router={router} />;
};
