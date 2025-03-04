import { queryOptions, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { Issue, Meta } from '@/types/api';

export const getIssues = (
  page?: number,
  perPage?: number,
  search?: string
): Promise<{ data: Issue[]; meta?: Meta }> => {
  const params: Record<string, any> = { search };

  if (page && page > 0) {
    params.page = page;
    params.per_page = perPage;
  }

  return api.get(`/issues`, { params });
};

export const getIssuesQueryOptions = ({
  page,
  perPage = 15,
  search = '',
}: { page?: number; perPage?: number; search?: string } = {}) => {
  const isPaginated = !!page && page > 0;

  return queryOptions({
    queryKey: ['issues', { paginated: isPaginated, page, perPage, search }],
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
  page,
  perPage = 15,
  search = '',
}: UseIssuesOptions) => {
  return useQuery({
    ...getIssuesQueryOptions({ page, perPage, search }),
    ...queryConfig,
    select: (data) => ({
      data: data.data,
      meta: data.meta, // `meta` will be undefined if unpaginated
    }),
  });
};
