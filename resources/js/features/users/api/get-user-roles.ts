import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { UserRole, Meta } from '@/types/api';


export const getUserRoles = (): Promise<{
  data: UserRole[];
}> => {
  return api.get(`/user_roles`);
};

export const getUserRolesQueryOptions = () => {
  return queryOptions({
    queryKey: ['user-roles'],
    queryFn: () => getUserRoles(),
  });
};

type UseUserRolesOptions = {
  page?: number;
  perPage?: number;
  search?: string; 
  queryConfig?: QueryConfig<typeof getUserRolesQueryOptions>;
};

export const useUserRoles = ({
  queryConfig
}: UseUserRolesOptions) => {
  return useQuery({
    ...getUserRolesQueryOptions(), 
    ...queryConfig,
    select: (data) => {
      return data;
    },
  });
};
