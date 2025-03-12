import { useQuery, queryOptions } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { UserRole } from '@/types/api';

export const getUserRole = ({
  userRoleId,
}: {
  userRoleId: string;
}): Promise<{ data: UserRole }> => {
  return api.get(`/user_roles/${userRoleId}`);
};

export const getUserRoleQueryOptions = (userRoleId: string) => {
  return queryOptions({
    queryKey: ['user_roles', userRoleId],
    queryFn: () => getUserRole({ userRoleId }),
  });
};

type UseUserRoleOptions = {
  userRoleId: string;
  queryConfig?: QueryConfig<typeof getUserRoleQueryOptions>;
};

export const useUserRole = ({
  userRoleId,
  queryConfig,
}: UseUserRoleOptions) => {
  return useQuery({
    ...getUserRoleQueryOptions(userRoleId),
    ...queryConfig,
  });
};
