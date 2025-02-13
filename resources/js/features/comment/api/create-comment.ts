import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { Comment } from '@/types/api';
import { getCommentsQueryOptions } from './get-comments';

export const createCommentInputSchema = z.object({
  comment: z.string().min(1, { message: 'Please give more detailed comment...' }),
  commenterType: z.enum(['User', 'GuestIssuer'])
}).extend({
  name: z.string().optional(),
  email: z.string().email().optional(),
}).superRefine((data, ctx) => {
  if (data.commenterType === 'GuestIssuer') {
    if (!data.name) {
      ctx.addIssue({
        code: 'custom',
        message: 'Name is required for Guest users',
        path: ['name']
      });
    }
    if (!data.email) {
      ctx.addIssue({
        code: 'custom',
        message: 'Email is required for Guest users',
        path: ['email']
      });
    }
  }
  return true;
});

export type CreateCommentInput = z.infer<typeof createCommentInputSchema>;

export const createComment = (
  data: {
    comment: string, 
    commentableId: string, 
    commentableType: string,
    userDetail: { name: string; email: string , commenterType : string }
  }
): Promise<Comment> => {
  const { comment, commentableId, commentableType, userDetail } = data;
  return api.post('/comments', {
    comment,
    commentableId: commentableId,
    commentableType: commentableType,
    ...userDetail
  });
};

type UseCreateCommentOptions = {
  mutationConfig?: MutationConfig<typeof createComment>;
};

export const useCreateComment = ({
  mutationConfig,
}: UseCreateCommentOptions) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args: any) => {
      const [data, variables, context] = args;
      queryClient.invalidateQueries({
        queryKey: getCommentsQueryOptions({
          commentableId: variables.commentableId,
          commentableType: variables.commentableType,
        }).queryKey,
      });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: (data) => createComment(data),
  });
};