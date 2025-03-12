import { queryOptions, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { UserRole, Meta } from '@/types/api';

export const getUserRoles = (
  page?: number,
  perPage?: number,
  search?: string
): Promise<{ data: UserRole[]; meta?: Meta }> => {
  const params: Record<string, any> = { search };

  if (page && page > 0) {
    params.page = page;
    params.per_page = perPage;
  }

  return api.get(`/user_roles`, { params });
};

export const getUserRolesQueryOptions = ({
  page,
  perPage = 15,
  search = '',
}: { page?: number; perPage?: number; search?: string } = {}) => {
  const isPaginated = !!page && page > 0;

  return queryOptions({
    queryKey: ['user_roles', { paginated: isPaginated, page, perPage, search }],
    queryFn: () => getUserRoles(page, perPage, search),
  });
};

type UseUserRolesOptions = {
  page?: number;
  perPage?: number;
  search?: string;
  queryConfig?: QueryConfig<typeof getUserRolesQueryOptions>;
};

export const useUserRoles = ({
  queryConfig,
  page,
  perPage = 15,
  search = '',
}: UseUserRolesOptions) => {
  return useQuery({
    ...getUserRolesQueryOptions({ page, perPage, search }),
    ...queryConfig,
    select: (data) => ({
      data: data.data,
      meta: data.meta, // Will be undefined if unpaginated
    }),
  });
};
