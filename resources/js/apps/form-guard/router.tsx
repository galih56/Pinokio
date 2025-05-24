import { QueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Navigate, Outlet, RouterProvider, createBrowserRouter, useLocation, useRouteError } from 'react-router-dom';

import { paths } from '@/apps/issue-tracker/paths';
import { queryClient } from '@/lib/react-query';
import { Layout } from './layout';

const AppRootErrorBoundary = () => {
  const error = useRouteError();
  return <div>Something went wrong!</div>;
};

export const createAppRouter = (queryClient: QueryClient) => {
  const routes =  createBrowserRouter([
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
          path: ':id', 
          lazy: async () => {
            const { IssueRoute, issueLoader } = await import(
              '@/pages/app/issues/public-issue-view'
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
      element: <Navigate to={paths.home.path} replace />,
    },
  ], {
    basename : '/'
  })

  
  return routes;
};

export const AppRouter = () => {
  const router = useMemo(() => createAppRouter(queryClient), [queryClient]);
  
  return <RouterProvider router={router} />;
};
