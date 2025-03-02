import { useMutation, useQueryClient } from  '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { Comment } from '@/types/api';

import { getCommentQueryOptions } from './get-comment';
import { getCommentsQueryOptions } from './get-comments';

export const updateCommentInputSchema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }),
  color: z.string().optional(),
});

export type UpdateCommentInput = z.infer<typeof updateCommentInputSchema>;

export const updateComment = ({
  data,
  commentId,
}: {
  data: UpdateCommentInput;
  commentId: string;
}): Promise<Comment> => {
  return api.patch(`/comments/${commentId}`, data);
};

type UseUpdateCommentOptions = {
  commentId: string;
  mutationConfig?: MutationConfig<typeof updateComment>;
};

export const useUpdateComment = ({
  commentId,
  mutationConfig,
}: UseUpdateCommentOptions) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (res : any, ...args ) => {
      queryClient.refetchQueries({
        queryKey: getCommentQueryOptions(commentId).queryKey,
      });
      queryClient.refetchQueries({
        queryKey: getCommentsQueryOptions().queryKey,
      });
      onSuccess?.(res, ...args);
    },
    ...restConfig,
    mutationFn: updateComment,
  });
};
