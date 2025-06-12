import { QueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Navigate, Outlet, RouterProvider, createBrowserRouter, useLocation, useRouteError } from 'react-router-dom';

import { paths } from '@/apps/form-guard/paths';
import { queryClient } from '@/lib/react-query';
import { Layout } from './layout';
import { AppRootErrorBoundary } from '@/components/ui/app-root-error-boundary';

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
          path: paths.form.path,
          lazy: async () => {
            const { formLayoutLoader } = await import(
              '@/pages/app/form-guard/form-builder'
            );
            const { FormResponse } = await import(
              '@/pages/app/form-guard/form-response'
            );
            return {
              Component: FormResponse,
              loader: formLayoutLoader(queryClient),
            };
          },
          ErrorBoundary: AppRootErrorBoundary,
        },
        {
          path: paths.formResponse.path,
          lazy: async () => {
            const { formLayoutLoader } = await import(
              '@/pages/app/form-guard/form-builder'
            );
            const { FormResponse } = await import(
              '@/pages/app/form-guard/form-response'
            );
            return {
              Component: FormResponse,
              loader: formLayoutLoader(queryClient),
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
    basename: '/form-guard',
  })

  
  return routes;
};

export const AppRouter = () => {
  const router = useMemo(() => createAppRouter(queryClient), [queryClient]);
  
  return <RouterProvider router={router} />;
};
