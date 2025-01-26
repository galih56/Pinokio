import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';

import { getCommentsQueryOptions } from './get-comments';

export type DeleteCommentDTO = {
  commentId: string;
};

export const deleteComment = ({
  commentId,
}: DeleteCommentDTO) => {
  return api.delete(`/comments/${commentId}`);
};

type UseDeleteEmpoyeeOptions = {
  mutationConfig?: MutationConfig<typeof deleteComment>;
};

export const useDeleteEmpoyee = ({
  mutationConfig,
}: UseDeleteEmpoyeeOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args : any) => {
      queryClient.invalidateQueries({
        queryKey: getCommentsQueryOptions().queryKey,
      });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: deleteComment,
  });
};
