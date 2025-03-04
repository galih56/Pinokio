import { queryOptions, useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { Comment, Meta } from '@/types/api';


export const getComments = ({
  page = 1,
  perPage = 15,
  commentableId,
  commentableType,
}: {
  page?: number;
  perPage?: number;
  commentableId?: string;
  commentableType?: string;
}): Promise<{ data: Comment[]; meta?: Meta }> => {
  return api.get(`/comments`, {
    params: {
      page,
      per_page: perPage,
      commentableId,
      commentableType,
    },
  });
};

export const getCommentsQueryOptions = ({
  page = 1,
  perPage = 15,
  commentableId, 
  commentableType 
}: { page?: number; perPage?: number; commentableId?: string;  commentableType?: string  } = {}) => {
  return queryOptions({
    queryKey: ['comments', { page, perPage, commentableId, commentableType  }],
    queryFn: () => getComments({page, perPage, commentableId, commentableType}),
  });
};

type UseCommentsOptions = {
  page?: number;
  perPage?: number;
  queryConfig?: QueryConfig<typeof getCommentsQueryOptions>;
  commentableId?: string;  
  commentableType?: string 
};

export const useComments = ({
  queryConfig,
  page = 1,
  perPage = 15,
  commentableId, 
  commentableType 
}: UseCommentsOptions) => {
  return useQuery({
    ...getCommentsQueryOptions({ page, perPage , commentableId, commentableType }), 
    ...queryConfig,
    select: (data) => {
      return {
        data: data.data,
        meta: data.meta,
      };
    },
  });
};

export const useInfiniteComments = ({
  perPage = 15,
  commentableId,
  commentableType,
}: {
  perPage?: number;
  commentableId?: string;
  commentableType?: string;
}) => {
  return useInfiniteQuery({
    initialPageParam: 1,
    queryKey: ["comments", { perPage, commentableId, commentableType }],
    queryFn: ({ pageParam }) =>
      getComments({ page: pageParam, perPage, commentableId, commentableType }),
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.meta?.currentPage ?? 1;
      const totalPages = lastPage.meta?.totalPages ?? 1;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
  });
};
