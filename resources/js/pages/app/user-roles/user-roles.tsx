import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { LoaderFunctionArgs } from 'react-router-dom';

import { getUserRolesQueryOptions } from '@/features/user-roles/api/get-user-roles';
import { UserRolesList } from '@/features/user-roles/components/user-role-list';
import { lazy } from 'react';
import DialogOrDrawer from '@/components/layout/dialog-or-drawer';
import { Button } from '@/components/ui/button';
import { useDisclosure } from '@/hooks/use-disclosure';
const CreateUserRole = lazy(() => import('@/features/user-roles/components/create-user-role'));

export const userRolesLoader =
  (queryClient: QueryClient) =>
  async ({ request }: LoaderFunctionArgs) => {
    const url = new URL(request.url);

    const page = Number(url.searchParams.get('page') || 1);

    const query = getUserRolesQueryOptions({ page });

    return (
      queryClient.getQueryData(query.queryKey) ??
      (await queryClient.fetchQuery(query))
    );
  };

export const UserRolesRoute = () => {
  const { isOpen, open, close, toggle } = useDisclosure();

  return (
    <>
      <div className="mt-4">
        <DialogOrDrawer 
            open={isOpen}
            onOpenChange={toggle}
            title={"Create User Role"}
            trigger={ <Button variant="outline">Create User Role</Button>}
          >
            <div className='p-2'>
              <CreateUserRole onSuccess={close} onError={close}/>
            </div>
        </DialogOrDrawer>
        <div className='w-full my-2 p4'>
          <UserRolesList />          
        </div>
      </div>
    </>
  );
};
