import { queryOptions, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { UserRole, Meta } from '@/types/api';

export const searchUserRoles = (
  search?: string
): Promise<{ data: UserRole[]; meta?: Meta }> => {
  const params: Record<string, any> = { search };
  return api.get(`/user_roles`, { params });
};

export const searchUserRolesQueryOptions = ({
  search = '',
}: {  search?: string } = {}) => {

  return queryOptions({
    queryKey: ['user_roles', { search }],
    queryFn: () => searchUserRoles(search),
  });
};

type UseUserRolesOptions = {
  search?: string;
  queryConfig?: QueryConfig<typeof searchUserRolesQueryOptions>;
};

export const useSearchUserRoles = ({
  queryConfig,
  search = '',
}: UseUserRolesOptions) => {
  return useQuery({
    ...searchUserRolesQueryOptions({ search }),
    ...queryConfig
  });
};
