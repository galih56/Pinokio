import { useMutation, useQueryClient } from  '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { Tag } from '@/types/api';

import { getTagQueryOptions } from './get-tag';
import { getTagsQueryOptions } from './get-tags';

export const updateTagInputSchema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }),
  color: z.string().optional(),
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
  mutationConfig?: MutationConfig<typeof updateTag>;
};

export const useUpdateTag = ({
  tagId,
  mutationConfig,
}: UseUpdateTagOptions) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

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
