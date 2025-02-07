import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { Issue, Meta } from '@/types/api';


export const getIssues = (
  page = 1,
  perPage = 15,
  search?: string
): Promise<{
  data: Issue[];
  meta?: Meta;
}> => {
  return api.get(`/issues`, {
    params: {
      page,
      per_page: perPage,
      search,
    },
  });
};

export const getIssuesQueryOptions = ({
  page,
  perPage = 15,
  search, 
}: { page?: number; perPage?: number; search?: string } = {}) => {
  return queryOptions({
    queryKey: ['issues', { page, perPage, search }],
    queryFn: () => getIssues(page, perPage, search),
  });
};

type UseIssuesOptions = {
  page?: number;
  perPage?: number;
  search?: string; 
  queryConfig?: QueryConfig<typeof getIssuesQueryOptions>;
};

export const useIssues = ({
  queryConfig,
  page = 1,
  perPage = 15,
  search, 
}: UseIssuesOptions) => {
  return useQuery({
    ...getIssuesQueryOptions({ page, perPage, search }), 
    ...queryConfig,
    select: (data) => {
      return {
        data: data.data,
        meta: data.meta,
      };
    },
  });
};
