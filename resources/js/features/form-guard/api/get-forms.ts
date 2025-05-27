import { queryOptions, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { Form, Meta } from '@/types/api';

export const getForms = (
  page?: number,
  perPage?: number,
  search?: string
): Promise<{ data: Form[]; meta?: Meta }> => {
  const params: Record<string, any> = { search };

  if (page && page > 0) {
    params.page = page;
    params.per_page = perPage;
  }

  return api.get(`/forms`, { params });
};

export const getFormsQueryOptions = ({
  page,
  perPage = 15,
  search = '',
}: { page?: number; perPage?: number; search?: string } = {}) => {
  const isPaginated = !!page && page > 0;

  return queryOptions({
    queryKey: ['forms', { paginated: isPaginated, page, perPage, search }],
    queryFn: () => getForms(page, perPage, search),
  });
};

type UseFormsOptions = {
  page?: number;
  perPage?: number;
  search?: string;
  queryConfig?: QueryConfig<typeof getFormsQueryOptions>;
};

export const useForms = ({
  queryConfig,
  page,
  perPage = 15,
  search = '',
}: UseFormsOptions) => {
  return useQuery({
    ...getFormsQueryOptions({ page, perPage, search }),
    ...queryConfig,
    select: (data) => ({
      data: data.data,
      meta: data.meta, // `meta` will be undefined if unpaginated
    }),
  });
};
