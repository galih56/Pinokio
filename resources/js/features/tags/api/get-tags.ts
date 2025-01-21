import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { Tag, Meta } from '@/types/api';


export const getTags = (
  page? : number,
  perPage? : number,
  search?: string
): Promise<{
  data: Tag[];
  meta?: Meta;
}> => {
  return api.get(`/tags`, {
    params: {
      page,
      per_page: perPage,
      search,
    },
  });
};

export const getTagsQueryOptions = ({
  page = 1,
  perPage = 15,
  search = '', 
}: { page?: number; perPage?: number; search?: string } = {}) => {
  return queryOptions({
    queryKey: ['tags', { page, perPage, search }],
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
  page = 1,
  perPage = 15,
  search = '', 
}: UseTagsOptions) => {
  return useQuery({
    ...getTagsQueryOptions({ page, perPage, search }), 
    ...queryConfig,
    select: (data) => {
      return {
        data: data.data,
        meta: data.meta,
      };
    },
  });
};
