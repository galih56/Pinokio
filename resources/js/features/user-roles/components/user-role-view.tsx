

import { Spinner } from '@/components/ui/spinner';
import { useUserRole } from '../api/get-user-role';

export const UserRoleView = ({ userRoleId }: { userRoleId: string | undefined }) => {
  
  if(!userRoleId){
    return <h1>Unrecognized Request</h1>
  }
  
  const userRoleQuery = useUserRole({
    userRoleId,
  });

  if (userRoleQuery.isPending) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const userRole = userRoleQuery?.data?.data;
  if (!userRole) return null;

  return (
    <div className="mt-6 flex flex-col px-6 space-y-2">
      <div className="grid grid-cols-2 gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">Name</p>
              <p className="text-sm text-muted-foreground">
                {userRole.name} 
                <br />
                {userRole.code ?? <span className='text-red'>No User Role Code Found</span>}
              </p>
            </div>
          </div>
      </div>
    </div>
  );
};
