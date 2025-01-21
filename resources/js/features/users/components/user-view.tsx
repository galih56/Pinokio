

import { Spinner } from '@/components/ui/spinner';
import { useUser } from '../api/get-user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { paths } from '@/apps/dashboard/paths';
import { useEffect } from 'react';
import { adjustActiveBreadcrumbs, useBreadcrumbs } from '@/components/layout/breadcrumbs/breadcrumbs-store';

export const UserView = ({ userId }: { userId: string }) => {
  const userQuery = useUser({ userId });
  const user = userQuery?.data?.data;
  
  adjustActiveBreadcrumbs(`/users/:id`,`/users/${userId}`, user?.name, [ user ]);

  if (userQuery.isPending) {
      return (
          <div className="flex h-48 w-full items-center justify-center">
              <Spinner size="lg" />
          </div>
      );
  }

  if (!user) return null;

  return (
      <div className="mt-6 px-6 space-y-2">
          <div className="grid grid-cols-2 gap-6">
              <Card className="col-span-1 shadow-sm">
                  <CardHeader>
                      <CardTitle>User Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <div className="space-y-1 my-2">
                          <p className="text-sm font-medium leading-none">Username</p>
                          <p className="text-sm text-muted-foreground">{user.username}</p>
                      </div>
                      <div className="space-y-1 my-2">
                          <p className="text-sm font-medium leading-none">Email</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                  </CardContent>
              </Card>

          </div>
      </div>
  );
};