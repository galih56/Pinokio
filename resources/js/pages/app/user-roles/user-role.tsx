import { QueryClient } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { useParams, LoaderFunctionArgs } from 'react-router-dom';

import {
  useUserRole,
  getUserRoleQueryOptions,
} from '@/features/user-roles/api/get-user-role';
import { UserRoleView } from '@/features/user-roles/components/user-role-view';
import { UpdateUserRole } from '@/features/user-roles/components/update-user-role';
import { Button } from '@/components/ui/button';
import DialogOrDrawer from '@/components/layout/dialog-or-drawer';
import { Edit } from 'lucide-react';

export const userRoleLoader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    const userRoleId = params.id as string;

    const userRoleQuery = getUserRoleQueryOptions(userRoleId);
    
    const promises = [
      queryClient.getQueryData(userRoleQuery.queryKey) ??
        (await queryClient.fetchQuery(userRoleQuery)),
    ] as const;

    const [userRole] = await Promise.all(promises);

    return {
      userRole,
    };
};

export const UserRoleRoute = () => {
  const params = useParams();
  const userRoleId = params.id;

  return (
    <div className='mt-6'>
        {
          userRoleId && 
          <DialogOrDrawer 
            title={"Edit User Role"}
            description={"Pastikan data yang anda masukan sudah benar sesuai!"}
            trigger={ <Button variant="outline"> <Edit/> Edit User Role</Button>}
            >
              <UpdateUserRole userRoleId={userRoleId}/>
          </DialogOrDrawer>}
        <UserRoleView userRoleId={userRoleId} />
        <div className="mt-8">
          <ErrorBoundary
            fallback={
              <div>Failed to load the data. Try to refresh the page.</div>
            }
          >
          </ErrorBoundary>
        </div>
    </div>
  );
};
