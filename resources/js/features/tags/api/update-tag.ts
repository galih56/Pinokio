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
  mutationConfig?: MutationConfig<typeof updateTag>;
};

export const useUpdateTag = ({
  mutationConfig,
}: UseUpdateTagOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (data : any, ...args ) => {
      queryClient.refetchQueries({
        queryKey: getTagQueryOptions(data.id).queryKey,
      });
      queryClient.refetchQueries({
        queryKey: getTagsQueryOptions().queryKey,
      });
      onSuccess?.(data, ...args);
    },
    ...restConfig,
    mutationFn: updateTag,
  });
};
