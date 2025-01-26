import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { Comment } from '@/types/api';
import { subYears } from 'date-fns';

import { getCommentsQueryOptions } from './get-comments';


export const createCommentInputSchema = z.object({
  comment: z.string().min(1, { message: 'Please give more detail comment...' }),
});

export type CreateCommentInput = z.infer<typeof createCommentInputSchema>;

export const createComment = (
  comment: string, 
  commentableId: string, 
  commentableType: string 
): Promise<Comment> => {
  return api.post(`/comments`, {
    comment,
    commentable_id: commentableId,
    commentable_type: commentableType,
  });
};

type UseCreateCommentOptions = {
  commentableId: string; // The ID of the commentable entity
  commentableType: string; // The type of the commentable entity
  mutationConfig?: MutationConfig<typeof createComment>;
};

export const useCreateComment = ({
  commentableId,
  commentableType,
  mutationConfig,
}: UseCreateCommentOptions) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args: any) => {
      queryClient.invalidateQueries({
        queryKey: getCommentsQueryOptions().queryKey,
      });
      onSuccess?.(args);
    },
    ...restConfig,
    mutationFn: (comment: string) => createComment(comment, commentableId, commentableType), // Pass commentableId and commentableType
  });
};