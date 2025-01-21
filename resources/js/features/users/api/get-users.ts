import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { User, Meta } from '@/types/api';


export const getUsers = (
  page = 1,
  perPage = 15,
  search?: string
): Promise<{
  data: User[];
  meta?: Meta;
}> => {
  return api.get(`/users`, {
    params: {
      page,
      per_page: perPage,
      search,
    },
  });
};

export const getUsersQueryOptions = ({
  page = 1,
  perPage = 15,
  search = '', 
}: { page?: number; perPage?: number; search?: string } = {}) => {
  return queryOptions({
    queryKey: ['users', { page, perPage, search }],
    queryFn: () => getUsers(page, perPage, search),
  });
};

type UseUsersOptions = {
  page?: number;
  perPage?: number;
  search?: string; 
  queryConfig?: QueryConfig<typeof getUsersQueryOptions>;
};

export const useUsers = ({
  queryConfig,
  page = 1,
  perPage = 15,
  search, 
}: UseUsersOptions) => {
  return useQuery({
    ...getUsersQueryOptions({ page, perPage, search }), 
    ...queryConfig,
    select: (data) => {
      return {
        data: data.data,
        meta: data.meta,
      };
    },
  });
};
