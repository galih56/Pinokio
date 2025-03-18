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
  
  if (page !== undefined && perPage !== undefined) {
    params.page = page;
    params.per_page = perPage;
  }

  return api.get(`/teams`, { params });
};


export const getTeamsQueryOptions = ({
  page,
  perPage,
  search = '',
}: { page?: number; perPage?: number; search?: string } = {}) => {
  const isPaginated = page !== undefined && perPage !== undefined;

  return queryOptions({
    queryKey: ['teams', { paginated: isPaginated, page, perPage, search }],
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
  perPage,
  search = '',
}: UseTeamsOptions) => {
  return useQuery({
    ...getTeamsQueryOptions({ page, perPage, search }),
    ...queryConfig,
    select: (data) => ({
      data: data.data,
      meta: data.meta, // Undefined if unpaginated
    }),
  });
};
