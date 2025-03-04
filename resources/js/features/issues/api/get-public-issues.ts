import { queryOptions, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { Issue, Meta } from '@/types/api';

type Issuer = {
  name: string;
  email: string;
};

export const getPublicIssues = (
  page?: number,
  perPage?: number,
  search?: string,
  issuer?: Issuer
): Promise<{ data: Issue[]; meta?: Meta }> => {
  const params: Record<string, any> = { search, ...issuer };

  if (page && page > 0) {
    params.page = page;
    params.per_page = perPage;
  }

  return api.get(`/public-issues`, { params });
};

export const getPublicIssuesQueryOptions = ({
  page,
  perPage = 15,
  search = '',
  issuer,
}: { page?: number; perPage?: number; search?: string; issuer?: Issuer }) => {
  const isPaginated = !!page && page > 0;

  return queryOptions({
    queryKey: ['public-issues', { paginated: isPaginated, page, perPage, search, issuer }],
    queryFn: () => getPublicIssues(page, perPage, search, issuer),
  });
};

type UsePublicIssuesOptions = {
  page?: number;
  perPage?: number;
  search?: string;
  issuer?: Issuer;
  queryConfig?: QueryConfig<typeof getPublicIssuesQueryOptions>;
};

export const usePublicIssues = ({
  queryConfig,
  page,
  perPage = 15,
  search = '',
  issuer,
}: UsePublicIssuesOptions) => {
  return useQuery({
    ...getPublicIssuesQueryOptions({ page, perPage, search, issuer }),
    ...queryConfig,
    select: (data) => ({
      data: data.data,
      meta: data.meta, // `meta` will be undefined if unpaginated
    }),
  });
};
