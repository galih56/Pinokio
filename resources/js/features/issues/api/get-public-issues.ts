import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { Issue, Meta } from '@/types/api';


export const getPublicIssues = (
  page = 1,
  perPage = 15,
  search?: string
): Promise<{
  data: Issue[];
  meta?: Meta;
}> => {
  return api.get(`/public-issues`, {
    params: {
      page,
      per_page: perPage,
      search,
    },
  });
};

export const getPublicIssuesQueryOptions = ({
  page,
  perPage = 15,
  search, 
}: { page?: number; perPage?: number; search?: string } = {}) => {
  return queryOptions({
    queryKey: ['public-issues', { page, perPage, search }],
    queryFn: () => getPublicIssues(page, perPage, search),
  });
};

type UsePublicIssuesOptions = {
  page?: number;
  perPage?: number;
  search?: string; 
  queryConfig?: QueryConfig<typeof getPublicIssuesQueryOptions>;
};

export const usePublicIssues = ({
  queryConfig,
  page = 1,
  perPage = 15,
  search, 
}: UsePublicIssuesOptions) => {
  return useQuery({
    ...getPublicIssuesQueryOptions({ page, perPage, search }), 
    ...queryConfig,
    select: (data) => {
      return {
        data: data.data,
        meta: data.meta,
      };
    },
  });
};
