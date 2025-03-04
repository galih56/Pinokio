import { queryOptions, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { Tag, Meta } from '@/types/api';

export const getTags = (
  page?: number,
  perPage?: number,
  search?: string
): Promise<{ data: Tag[]; meta?: Meta }> => {
  const params: Record<string, any> = { search };

  if (page && page > 0) {
    params.page = page;
    params.per_page = perPage;
  }

  return api.get(`/tags`, { params });
};

export const getTagsQueryOptions = ({
  page,
  perPage = 15,
  search = '',
}: { page?: number; perPage?: number; search?: string } = {}) => {
  const isPaginated = !!page && page > 0;

  return queryOptions({
    queryKey: ['tags', { paginated: isPaginated, page, perPage, search }],
    queryFn: () => getTags(page, perPage, search),
  });
};

type UseTagsOptions = {
  page?: number;
  perPage?: number;
  search?: string;
  queryConfig?: QueryConfig<typeof getTagsQueryOptions>;
};

export const useTags = ({
  queryConfig,
  page,
  perPage = 15,
  search = '',
}: UseTagsOptions) => {
  return useQuery({
    ...getTagsQueryOptions({ page, perPage, search }),
    ...queryConfig,
    select: (data) => ({
      data: data.data,
      meta: data.meta, // Will be undefined if unpaginated
    }),
  });
};
