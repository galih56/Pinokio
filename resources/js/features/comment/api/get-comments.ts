import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { Comment, Meta } from '@/types/api';


export const getComments = (
  page? : number,
  perPage? : number,
  search?: string,
  commentableId?: string, 
  commentableType?: string 
): Promise<{
  data: Comment[];
  meta?: Meta;
}> => {
  return api.get(`/comments`, {
    params: {
      page,
      per_page: perPage,
      search,
      commentableId,
      commentableType
    },
  });
};

export const getCommentsQueryOptions = ({
  page = 1,
  perPage = 15,
  search = '', 
  commentableId, 
  commentableType 
}: { page?: number; perPage?: number; search?: string; commentableId?: string;  commentableType?: string  } = {}) => {
  return queryOptions({
    queryKey: ['comments', { page, perPage, search, commentableId, commentableType  }],
    queryFn: () => getComments(page, perPage, search, commentableId, commentableType ),
  });
};

type UseCommentsOptions = {
  page?: number;
  perPage?: number;
  search?: string; 
  queryConfig?: QueryConfig<typeof getCommentsQueryOptions>;
  commentableId?: string;  
  commentableType?: string 
};

export const useComments = ({
  queryConfig,
  page = 1,
  perPage = 15,
  search = '', 
  commentableId, 
  commentableType 
}: UseCommentsOptions) => {
  return useQuery({
    ...getCommentsQueryOptions({ page, perPage, search , commentableId, commentableType }), 
    ...queryConfig,
    select: (data) => {
      return {
        data: data.data,
        meta: data.meta,
      };
    },
  });
};
