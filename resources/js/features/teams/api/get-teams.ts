import { queryOptions, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { Team, Meta } from '@/types/api';

export const getTeams = (
  page?: number,
  perPage?: number,
  search?: string
): Promise<{ data: Team[]; meta?: Meta }> => {
  const params: Record<string, any> = { search };

  if (page && page > 0) {
    params.page = page;
    params.per_page = perPage;
  }

  return api.get(`/tags`, { params });
};

export const getTeamsQueryOptions = ({
  page,
  perPage = 15,
  search = '',
}: { page?: number; perPage?: number; search?: string } = {}) => {
  const isPaginated = !!page && page > 0;

  return queryOptions({
    queryKey: ['tags', { paginated: isPaginated, page, perPage, search }],
    queryFn: () => getTeams(page, perPage, search),
  });
};

type UseTeamsOptions = {
  page?: number;
  perPage?: number;
  search?: string;
  queryConfig?: QueryConfig<typeof getTeamsQueryOptions>;
};

export const useTeams = ({
  queryConfig,
  page,
  perPage = 15,
  search = '',
}: UseTeamsOptions) => {
  return useQuery({
    ...getTeamsQueryOptions({ page, perPage, search }),
    ...queryConfig,
    select: (data) => ({
      data: data.data,
      meta: data.meta, // Will be undefined if unpaginated
    }),
  });
};
