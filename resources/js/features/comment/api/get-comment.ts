import { useQuery, queryOptions } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { Comment } from '@/types/api';

export const getComment = ({
  commentId,
}: {
  commentId: string;
}): Promise<{ data: Comment }> => {
  return api.get(`/comments/${commentId}`);
};

export const getCommentQueryOptions = (commentId: string) => {
  return queryOptions({
    queryKey: ['comments', commentId],
    queryFn: () => getComment({ commentId }),
  });
};

type UseCommentOptions = {
  commentId: string;
  queryConfig?: QueryConfig<typeof getCommentQueryOptions>;
};

export const useComment = ({
  commentId,
  queryConfig,
}: UseCommentOptions) => {
  return useQuery({
    ...getCommentQueryOptions(commentId),
    ...queryConfig,
  });
};
