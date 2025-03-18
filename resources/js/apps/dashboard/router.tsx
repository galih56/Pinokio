import { QueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Outlet, RouterProvider, createBrowserRouter, useLocation, useRouteError } from 'react-router-dom';

import { paths } from '@/apps/dashboard/paths';
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
        <ProtectedRoute>
          <Layout>
            <Outlet />
          </Layout>
        </ProtectedRoute>
      ),
      ErrorBoundary: AppRootErrorBoundary,
      children: [
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
        {
          path: paths.tasks.path,
          lazy: async () => {
            const { TasksRoute, tasksLoader } = await import(
              '@/pages/app/tasks/tasks'
            );
            return {
              Component: TasksRoute,
              loader: tasksLoader(queryClient),
            };
          },
          ErrorBoundary: AppRootErrorBoundary,
        },
        {
          path: paths.task.path,
          lazy: async () => {
            const { TaskRoute, taskLoader } = await import(
              '@/pages/app/tasks/task'
            );
            return {
              Component: TaskRoute,
              loader: taskLoader(queryClient),
            };
          },
          ErrorBoundary: AppRootErrorBoundary,
        },
        {
          path: paths.teams.path,
          lazy: async () => {
            const { TeamsRoute, teamsLoader } = await import(
              '@/pages/app/teams/teams'
            );
            return {
              Component: TeamsRoute,
              loader: teamsLoader(queryClient),
            };
          },
          ErrorBoundary: AppRootErrorBoundary,
        },
        {
          path: paths.team.path,
          lazy: async () => {
            const { TeamRoute, teamLoader } = await import(
              '@/pages/app/teams/team'
            );
            return {
              Component: TeamRoute,
              loader: teamLoader(queryClient),
            };
          },
          ErrorBoundary: AppRootErrorBoundary,
        },
        {
          path: paths.tags.path,
          lazy: async () => {
            const { TagsRoute, tagsLoader } = await import(
              '@/pages/app/tags/tags'
            );
            return {
              Component: TagsRoute,
              loader: tagsLoader(queryClient),
            };
          },
          ErrorBoundary: AppRootErrorBoundary,
        },
        {
          path: paths.tag.path,
          lazy: async () => {
            const { TagRoute, tagLoader } = await import(
              '@/pages/app/tags/tag'
            );
            return {
              Component: TagRoute,
              loader: tagLoader(queryClient),
            };
          },
          ErrorBoundary: AppRootErrorBoundary,
        },
        {
          path: paths.users.path,
          lazy: async () => {
            const { UsersRoute, usersLoader } = await import(
              '@/pages/app/users/users'
            );
            return {
              Component: UsersRoute,
              loader: usersLoader(queryClient),
            };
          },
          ErrorBoundary: AppRootErrorBoundary,
        },
        {
          path: paths.user.path,
          lazy: async () => {
            const { UserRoute, userLoader } = await import(
              '@/pages/app/users/user'
            );
            return {
              Component: UserRoute,
              loader: userLoader(queryClient),
            };
          },
          ErrorBoundary: AppRootErrorBoundary,
        },
        {
          path: paths.userRoles.path,
          lazy: async () => {
            const { UserRolesRoute, userRolesLoader } = await import(
              '@/pages/app/user-roles/user-roles'
            );
            return {
              Component: UserRolesRoute,
              loader: userRolesLoader(queryClient),
            };
          },
          ErrorBoundary: AppRootErrorBoundary,
        },
        {
          path: paths.userRole.path,
          lazy: async () => {
            const { UserRoleRoute, userRoleLoader } = await import(
              '@/pages/app/user-roles/user-role'
            );
            return {
              Component: UserRoleRoute,
              loader: userRoleLoader(queryClient),
            };
          },
          ErrorBoundary: AppRootErrorBoundary,
        },
        {
          path: paths.profile.path,
          lazy: async () => {
            const { ProfileRoute } = await import('@/pages/app/users/profile');
            return {
              Component: ProfileRoute,
            };
          },
          ErrorBoundary: AppRootErrorBoundary,
        },
        {
          path: paths.dashboard.path,
          lazy: async () => {
            const { DashboardRoute } = await import('@/pages/app/dashboard');
            return {
              Component: DashboardRoute,
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
