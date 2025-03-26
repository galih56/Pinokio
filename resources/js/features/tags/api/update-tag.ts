import { useMutation, useQueryClient } from  '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { Tag } from '@/types/api';

import { getTagQueryOptions } from './get-tag';
import { getTagsQueryOptions } from './get-tags';

export type UpdateTagDTO = Partial<Omit<Tag, "issues" | "createdAt">>;

export const updateTagInputSchema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }),
  color: z.string().optional(),
  isPublic: z.boolean().default(false),
});

export type UpdateTagInput = z.infer<typeof updateTagInputSchema>;

export const updateTag = ({
  data,
  tagId,
}: {
  data: UpdateTagInput;
  tagId: string;
}): Promise<Tag> => {
  return api.patch(`/tags/${tagId}`, data);
};

type UseUpdateTagOptions = {
  tagId: string;
  config?: MutationConfig<typeof updateTag>;
};

export const useUpdateTag = ({
  tagId,
  config,
}: UseUpdateTagOptions) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = config || {};

  return useMutation({
    onSuccess: (res : any, ...args ) => {
      queryClient.refetchQueries({
        queryKey: getTagQueryOptions(tagId).queryKey,
      });
      queryClient.refetchQueries({
        queryKey: getTagsQueryOptions().queryKey,
      });
      onSuccess?.(res, ...args);
    },
    ...restConfig,
    mutationFn: updateTag,
  });
};
