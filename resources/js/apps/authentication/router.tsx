import { useMemo } from 'react';
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { paths } from '@/apps/authentication/paths';
import { queryClient } from '@/lib/react-query';
import { QueryClient } from '@tanstack/react-query';

export const createAppRouter = (queryClient : QueryClient) =>
  createBrowserRouter([
    {
      path: paths.auth.register.path,
      lazy: async () => {
        const { RegisterRoute } = await import('@/pages/auth/register');
        return { Component: RegisterRoute };
      },
    },
    {
      path: paths.auth.login.path,
      lazy: async () => {
        const { LoginRoute } = await import('@/pages/auth/login');
        return { Component: LoginRoute };
      },
    },  
    {
      path: '*',
      element: <Navigate to={`./${paths.auth.login.path}`} replace/>,
    },
  ], {
    basename : '/auth'
  });

export const AppRouter = () => {
  const router = useMemo(() => createAppRouter(queryClient), [queryClient]);
  return <RouterProvider router={router} />;
};
