import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { Task, Meta } from '@/types/api';


export const getTasks = (
  page = 1,
  perPage = 15,
  search?: string
): Promise<{
  data: Task[];
  meta?: Meta;
}> => {
  return api.get(`/tasks`, {
    params: {
      page,
      per_page: perPage,
      search,
    },
  });
};

export const getTasksQueryOptions = ({
  page,
  perPage = 15,
  search, 
}: { page?: number; perPage?: number; search?: string } = {}) => {
  return queryOptions({
    queryKey: ['tasks', { page, perPage, search }],
    queryFn: () => getTasks(page, perPage, search),
  });
};

type UseTasksOptions = {
  page?: number;
  perPage?: number;
  search?: string; 
  queryConfig?: QueryConfig<typeof getTasksQueryOptions>;
};

export const useTasks = ({
  queryConfig,
  page = 1,
  perPage = 15,
  search, 
}: UseTasksOptions) => {
  return useQuery({
    ...getTasksQueryOptions({ page, perPage, search }), 
    ...queryConfig,
    select: (data) => {
      return {
        data: data.data,
        meta: data.meta,
      };
    },
  });
};
