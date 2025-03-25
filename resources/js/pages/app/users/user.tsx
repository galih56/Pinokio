import { QueryClient } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { useParams, LoaderFunctionArgs } from 'react-router-dom';

import {
  useUser,
  getUserQueryOptions,
} from '@/features/users/api/get-user';
import { UserView } from '@/features/users/components/user-view';
import { UpdateUser } from '@/features/users/components/update-user';
import { Button } from '@/components/ui/button';
import DialogOrDrawer from '@/components/layout/dialog-or-drawer';
import { Edit } from 'lucide-react';

export const userLoader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    const userId = params.id as string;

    const userQuery = getUserQueryOptions(userId);
    
    const promises = [
      queryClient.getQueryData(userQuery.queryKey) ??
        (await queryClient.fetchQuery(userQuery)),
    ] as const;

    const [user] = await Promise.all(promises);

    return {
      user,
    };
};

export const UserRoute = () => {
  const params = useParams();
  const userId = params.id;

  return (
    <div className='mt-6'>
        <DialogOrDrawer 
          title={"Edit User"}
          trigger={ <Button variant="outline"> <Edit/> Edit User</Button>}
          >
            <UpdateUser userId={userId}/>
        </DialogOrDrawer>
        <UserView userId={userId} />
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
