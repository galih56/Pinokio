import { QueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Navigate, Outlet, RouterProvider, createBrowserRouter, useLocation, useParams, useRouteError } from 'react-router-dom';

import { paths } from '@/apps/form-guard/paths';
import { queryClient } from '@/lib/react-query';
import { Layout } from './layout';
import { AppRootErrorBoundary } from '@/components/ui/app-root-error-boundary';

const lazyFormEntry = async () => {
    const { formLayoutLoader, FormEntry } = await import(
        '@/pages/app/form-guard/form-entry'
    );
    return {
        Component: FormEntry,
        loader: formLayoutLoader(queryClient),
    };
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
          path: paths.form.path,
          lazy: lazyFormEntry,
          ErrorBoundary: AppRootErrorBoundary,
        },
        {
          path: paths.formResponse.path,
          lazy: lazyFormEntry,
          ErrorBoundary: AppRootErrorBoundary,
        }, 
        {
          path: paths.thankYouPage.path,
          lazy: async () => {
            const { FormSubmittedRoute } = await import(
              '@/pages/app/form-guard/form-submitted'
            );
            return {
              Component: FormSubmittedRoute,
            };
          },
          ErrorBoundary: AppRootErrorBoundary,
        },
        {
          path: '/:id/*',
          element: <CatchAllRedirect />,
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

const CatchAllRedirect = () => {
  const { id } = useParams();

  return <Navigate to={`/form-guard/${id}/response`} replace />;
};

export const AppRouter = () => {
  const router = useMemo(() => createAppRouter(queryClient), [queryClient]);
  
  return <RouterProvider router={router} />;
};
