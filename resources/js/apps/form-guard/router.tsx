import { QueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Navigate, Outlet, RouterProvider, createBrowserRouter, useLocation, useRouteError } from 'react-router-dom';

import { paths } from '@/apps/form-tracker/paths';
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
            const { FormTrackerFormRoute } = await import('@/pages/app/forms/form-tracker-form');
            return {
              Component: FormTrackerFormRoute,
            };
          },
          ErrorBoundary: AppRootErrorBoundary,
        }, 
        {
          path: ':id', 
          lazy: async () => {
            const { FormRoute, formLoader } = await import(
              '@/pages/app/form-guards/form-list'
            );
            return {
              Component: FormRoute,
              loader: formLoader(queryClient),
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
